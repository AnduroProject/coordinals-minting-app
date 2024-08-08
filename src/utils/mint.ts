import * as coordinate from "chromajs-lib";

import { rpcResponse, tokenData, utxo } from "@/types";

const schnorr = require("bip-schnorr");
const convert = schnorr.convert;
import ecc from "@bitcoinerlab/secp256k1";
import * as bip39 from "bip39";
import BIP32Factory from "bip32";
const bip32 = BIP32Factory(ecc);

import { calculateSize } from "./calculateSize";
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
  mnemonics: string,
  feeRate: number,
) {
  // Generating addresses from mnemonic
  const seed = bip39.mnemonicToSeedSync(mnemonics);
  const root = bip32.fromSeed(seed, coordinate.networks.testnet);

  const childNode = root.derivePath("m/84'/2222'/0'");

  const node = childNode.derive(0).derive(0);
  const destNode = childNode.derive(0).derive(2);
  const xpub = childNode.derive(0).neutered().toBase58();

  // Fetch available UTXOs for the given address
  let utxos: utxo[] = await fetchUtxos(xpub);
  console.log("🚀 ~ utxos:", utxos);
  if (utxos.length == 0) {
    throw { message: "UTXO not found" };
  }
  let utxo = utxos[0];

  // Check if the UTXO has been used recently and wait for a new one if necessary
  if (checkUsedUtxo(utxo.txid)) {
    console.log("mint waiting started");
    const savedUtxoTxid = getSavedUtxo();

    while (utxo.txid === savedUtxoTxid) {
      console.log("iteration started");
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Wait for 2 seconds
      utxos = await fetchUtxos(xpub);
      if (utxos.length > 0) {
        utxo = utxos[0];
      } else {
        console.log("no utxo found");
      }
    }

    console.log("mint waiting ended");
  }

  let blockHash, txHex;

  if (utxo.confirmations !== 0) {
    // Confirmed UTXO
    blockHash = await fetchBlockHash(utxo.height);
    let hexResponse = await fetchTransactionHex(
      utxo.txid,
      true,
      blockHash.result,
    );
    txHex = hexResponse.result.hex;
  } else {
    // Mempool UTXO
    let hexResponse = await fetchTransactionHex(utxo.txid, false, null);
    txHex = hexResponse.result;
  }
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
  const toAddress = coordinate.payments.p2wpkh({
    pubkey: destNode.publicKey,
    network: coordinate.networks.testnet,
  }).address;

  if (!controllerAddress || !toAddress)
    throw new Error("Controller or change address does not exists.");

  // Add outputs to the transaction
  psbt.addOutput({ address: controllerAddress, value: 10 ** 8 });
  psbt.addOutput({ address: toAddress, value: data.supply });

  // Calculate transaction size and required fee
  const vbytes = await calculateSize(psbt, childNode, utxos);

  const requiredAmount = vbytes * feeRate;

  let inputs: utxo[] = [],
    changeAmount = utxo.value - requiredAmount;

  // If the current UTXO is insufficient, prepare additional inputs
  if (utxo.value < requiredAmount) {
    let result = await prepareInputs(xpub, requiredAmount, feeRate);
    inputs = result.inputs;
    changeAmount = result.changeAmount;
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

  // Add change output
  psbt.addOutput({
    address: toAddress,
    value: changeAmount,
  });

  // Sign all inputs
  for (let i = 0; i < psbt.inputCount; i++) {
    const signer = childNode.derive(0).derive(utxos[i].derviation_index);
    psbt.signInput(i, signer);
  }
  psbt.finalizeAllInputs();

  // Check if transaction size exceeds the limit
  if ((psbt.extractTransaction(true).virtualSize() * 4) / 1000 > 3600) {
    throw new Error("Maximum file size exceeded.");
  }

  // Broadcast the transaction
  try {
    const response: rpcResponse = await sendTransactionHelper(
      psbt.extractTransaction(true).toHex(),
    );
    console.log(response);
    saveUsedUtxo(utxo.txid);

    return response;
  } catch (error) {
    console.log(error);
  }
}
