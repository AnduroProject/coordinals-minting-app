import * as coordinate from "chromajs-lib";

import { rpcResponse, tokenData, utxo } from "@/types";

const schnorr = require("bip-schnorr");
const convert = schnorr.convert;
import ecc from "@bitcoinerlab/secp256k1";
import * as bip39 from "bip39";
import BIP32Factory from "bip32";
const bip32 = BIP32Factory(ecc);

import { calculateSize, convertToSAT, getUnspentsLsit } from "./calculateSize";
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
  let unspents: utxo[] = await fetchUtxos(walletxpub);
  console.log("🚀 ~ utxos: 111", unspents);

  unspents.sort((a, b) => b.value - a.value);
  const utxos: utxo[] = []
  for (let i = 0; i < unspents.length; i++) {
    const unspent = unspents[i]
    if (!unspent.coinbase) utxos.push(unspent)
    if (
      unspent.coinbase &&
      unspent.confirmations > 10
    ) {
      utxos.push(unspent)
    }
  }
  console.log("🚀 ~ utxos:", utxos);

  if (utxos.length === 0) {
    console.log("====222")
    throw { message: "UTXO not found" };
  }


  // Calculate the required amount for the transaction
  let requiredAmount = 0;
  let selectedUtxos: utxo[] = [];
  let totalInputValue = 0;
  let changeAmount = 0
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

  // Add outputs
  psbt.addOutput({ address: controllerAddress, value: 10 ** 8 });
  psbt.addOutput({ address: toAddress, value: data.supply });

  for (let i = 0; i < utxos.length; i++) {
    const currentUtxo = utxos[i];
    console.log("====current utxo", currentUtxo)
    selectedUtxos.push(currentUtxo);
    totalInputValue += currentUtxo.value;
    console.log("Intermediate Selected UTXOs:", [...selectedUtxos]); 

    // Add the UTXO
    blockHash = await fetchBlockHash(currentUtxo.height);
    const txHex = await fetchTransactionHex(currentUtxo.txid, true, blockHash.result);
    psbt.addInput({
      hash: currentUtxo.txid,
      index: currentUtxo.vout,
      nonWitnessUtxo: Buffer.from(txHex.result.hex, "hex"),
    });


    // calculate the size and fee
    const vbytes = await calculateSize(psbt, data);
    requiredAmount = vbytes * feeRate;
    console.log("===requiredAmount=", requiredAmount);
    console.log("===totalInputValue=", totalInputValue);

    changeAmount = totalInputValue - requiredAmount;
    console.log("Change Amount:", changeAmount);


  
    if (totalInputValue >= requiredAmount && changeAmount >= convertToSAT(0.00002)) {
      psbt.addOutput({ address: toAddress || "", value: changeAmount });
      break; 
    }

    // If no  UTXOs are available 
    if (i === utxos.length - 1 && changeAmount < convertToSAT(0.00002)) {
      throw { message: "Insufficient funds: You don't have enough funds" };
    }
  }

  console.log("Selected UTXOs:", selectedUtxos);
  console.log("Change Amount:", changeAmount);
  try {

    //saveUsedUtxo(utxos.txid);

    return psbt.toHex();
  } catch (error) {
    console.log(error);
  }
}
