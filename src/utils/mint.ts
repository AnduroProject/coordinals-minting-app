import * as coordinate from "chromajs-lib";

import { rpcResponse, tokenData, utxo } from "@/types";

const schnorr = require("bip-schnorr");
const convert = schnorr.convert;
import ecc from "@bitcoinerlab/secp256k1";
import * as bip39 from "bip39";
import BIP32Factory from "bip32";
const bip32 = BIP32Factory(ecc);

import { calculateSize, getUnspentsLsit } from "./calculateSize";
import { prepareInputs } from "./prepareInputs";
import {
  fetchBlockHash,
  fetchTransactionHex,
  fetchUtxos,
  sendTransactionHelper,
} from "@/lib/service/fetcher";
import {
  checkUsedUtxo,
  getSavedUtxo,
  saveUsedUtxo,
} from "./localStorageHelper";
import { apiurl, maraUrl } from "@/lib/constants";
import { toast } from "sonner";

export const convertDataToSha256Hex = (value: any) => {
  return convert.hash(Buffer.from(value, "utf8")).toString("hex");
};

export const stringtoHex = (value: any) => {
  const buffer = Buffer.from(value, "utf8");
  const hexString = buffer.toString("hex");
  return hexString;
};

export async function mintToken(
  data: tokenData,
  feeRate: number,
) {
  console.log("=====minting token====")
  console.log("=====minting token data====", data)


  const walletxpub = localStorage.getItem("xpubkey") || "";
  console.log("===walletxpub", walletxpub)
  const acc = bip32.fromBase58(walletxpub, coordinate.networks.testnet);
  const node = acc.derive(0)
  const destNode = acc.derive(2);
  let blockHash, txHex;


  const opreturnData = JSON.stringify(data.opReturnValues);

  const payloadHex = convertDataToSha256Hex(opreturnData);
  const psbt = new coordinate.Psbt({
    network: coordinate.networks.testnet,
  });


  // Set transaction version and asset-specific data
  psbt.setVersion(10);
  psbt.assettype = data.assetType;
  psbt.headline = stringtoHex(data.headline);
  psbt.ticker = stringtoHex(data.ticker);
  psbt.payload = payloadHex;
  psbt.payloaddata = stringtoHex(opreturnData);

  if (data.assetType === 0) psbt.setPrecisionType(8);


  // Fetch available UTXOs for the given xpub
  let utxos: utxo[] = await fetchUtxos(walletxpub);
  utxos.sort((a, b) => b.value - a.value);

  console.log("🚀 ~ utxos:", utxos);
  if (utxos.length == 0) {
    throw { message: "UTXO not found" };
  } let utxo = utxos[0];


  if (utxo.confirmations !== 0) {
    // Confirmed UTXO
    blockHash = await fetchBlockHash(utxo.height);
    let hexResponse = await fetchTransactionHex(
      utxo.txid,
      true,
      blockHash.result,
    );
    console.log("===hexResponse=", hexResponse)

    txHex = hexResponse.result.hex;
    console.log("===txHex=", txHex)

  }


  // Add input UTXO to the transaction
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    nonWitnessUtxo: Buffer.from(txHex, "hex"),
  });

  const controllerAddress = coordinate.payments.p2wpkh({
    pubkey: node.publicKey,
    network: coordinate.networks.testnet,
  }).address;

  console.log("===controllerAddress=", controllerAddress)


  const toAddress = coordinate.payments.p2wpkh({
    pubkey: destNode.publicKey,
    network: coordinate.networks.testnet,
  }).address;
  console.log("===toAddress=", toAddress)

  if (!controllerAddress || !toAddress)
    throw new Error("Controller or change address does not exists.");

  // Add outputs to the transaction
  psbt.addOutput({ address: controllerAddress, value: 10 ** 8 });
  psbt.addOutput({ address: toAddress, value: data.supply });




  //  Calculate transaction size and required fee
  const vbytes = await calculateSize(psbt, acc, utxos, data);
  const requiredAmount = vbytes * feeRate;

  let inputs: utxo[] = [],
    changeAmount = utxo.value - requiredAmount;


  // If the current UTXO is insufficient, prepare additional inputs

  if (utxo.value < requiredAmount) {
    let result = await prepareInputs(walletxpub, requiredAmount, feeRate);
    if (result != undefined) {
      inputs = result.inputs;
      changeAmount = result.changeAmount;

    }
  }


  // Add additional inputs if necessary
  if (inputs.length !== 0) {
    for (let i = 0; i < inputs.length; i++) {
      let hash = await fetchBlockHash(inputs[i].height);
      let hex = await fetchTransactionHex(inputs[i].txid, true, hash.result);

      psbt.addInput({
        hash: inputs[i].txid,
        index: inputs[i].vout,
        nonWitnessUtxo: Buffer.from(hex.result.hex, "hex"),
      });
    }
  }

  //Add change output
  psbt.addOutput({
    address: controllerAddress,
    value: changeAmount,
  });


  try {

    saveUsedUtxo(utxo.txid);

    return psbt.toHex();
  } catch (error) {
    console.log(error);
  }
}
