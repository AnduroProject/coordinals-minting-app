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
  wishlistAddress,
} from "@/lib/service/fetcher";
import {
  checkUsedUtxo,
  getSavedUtxo,
  saveUsedUtxo,
} from "./localStorageHelper";
import {  apiurl, maraUrl } from "@/lib/constants";
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
  mnemonics: string,
  feeRate: number,
) {
  console.log("=====minting token====")
  console.log("=====minting token data====",data)

  // Generating addresses from mnemonic
  const seed = bip39.mnemonicToSeedSync(mnemonics);
  const root = bip32.fromSeed(seed, coordinate.networks.testnet);
  const childNode = root.derivePath("m/84'/2222'/0'");
  const node = childNode.derive(0).derive(0);
  const destNode = childNode.derive(0).derive(2);
  const xpub = childNode.derive(0).neutered().toBase58();


const walletxpub= localStorage.getItem("xpubkey") ||"";
console.log("===walletxpub",walletxpub)
const acc = bip32.fromBase58(walletxpub, coordinate.networks.testnet);
const Node = acc.derive(0)
const desti = acc.derive(2);


  // Fetch available UTXOs for the given address
  let utxos: utxo[] = await fetchUtxos(walletxpub);
  console.log("🚀 ~ utxos:", utxos);
  if (utxos.length == 0) {
    throw { message: "UTXO not found" };
  }
  let utxo = utxos[0];

  // // Check if the UTXO has been used recently and wait for a new one if necessary
  // if (checkUsedUtxo(utxo.txid)) {
  //   console.log("mint waiting started");
  //   const savedUtxoTxid = getSavedUtxo();

  //   while (utxo.txid === savedUtxoTxid) {
  //     console.log("iteration started");
  //     await new Promise((resolve) => setTimeout(resolve, 1500)); // Wait for 2 seconds
  //     utxos = await fetchUtxos(walletxpub);
  //     if (utxos.length > 0) {
  //       utxo = utxos[0];
  //     } else {
  //       console.log("no utxo found");
  //     }
  //   }

  //   console.log("mint waiting ended");
  // }

  let blockHash, txHex;

  if (utxo.confirmations !== 0) {
    // Confirmed UTXO
    blockHash = await fetchBlockHash(utxo.height);
    let hexResponse = await fetchTransactionHex(
      utxo.txid,
      true,
      blockHash.result,
    );
    //console.log("===hexResponse=",hexResponse)
    
    txHex = hexResponse.result.hex;
    console.log("===txHex=",txHex)

  } else {
    // Mempool UTXO
    let hexResponse = await fetchTransactionHex(utxo.txid, false, null);
    console.log("===hexResponse  else=",hexResponse)

    txHex = hexResponse.result;
    console.log("===txHex= else",txHex)

  }
  const opreturnData = JSON.stringify(data.opReturnValues);

  const payloadHex = convertDataToSha256Hex(opreturnData);
  const psbt = new coordinate.Psbt({
    network: coordinate.networks.testnet,
  });

  console.log("===psbt=",psbt)

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
  let params = {
    xpub: walletxpub || "",
    address: "",
    derivation_index: 0,
    baseUrl: apiurl,
  }

  await wishlistAddress(params)
  //const controllerAddress = "tc1qgqc937p0pjvskgnwn9flxm9dmcmcewfp25zkpm"
  const controllerAddress = coordinate.payments.p2wpkh({
    pubkey: Node.publicKey,
    network: coordinate.networks.testnet,
  }).address;

  console.log("===controllerAddress=",controllerAddress)
  let params2 = {
    xpub: walletxpub || "",
    address: "",
    derivation_index: 2,
    baseUrl: apiurl,
  }
 await wishlistAddress(params2)

  const toAddress = coordinate.payments.p2wpkh({
    pubkey: desti.publicKey,
    network: coordinate.networks.testnet,
  }).address;
  console.log("===toAddress=",toAddress)

  if (!controllerAddress || !toAddress)
    throw new Error("Controller or change address does not exists.");

  // Add outputs to the transaction
  psbt.addOutput({ address: controllerAddress, value: 10 ** 8 });
  psbt.addOutput({ address: toAddress, value: data.supply });
  

  //console.log("==psbt  mid22 tohex",psbt.toHex())


 //  Calculate transaction size and required fee
   const vbytes = await calculateSize(psbt, acc, utxos,data);
   //const vbytes = 172;

  console.log("====vBytes calc",vbytes)
  console.log("====utxo.value",utxo.value)

  const requiredAmount = vbytes * feeRate;
  console.log("====requiredAmount calc",requiredAmount)

  let inputs: utxo[] = [],
    changeAmount = utxo.value - requiredAmount;
    console.log("====changeAmount calc",changeAmount)


   // If the current UTXO is insufficient, prepare additional inputs
  
    if (utxo.value < requiredAmount) {
      console.log("====less amnt")
      let result = await prepareInputs(walletxpub, requiredAmount, feeRate);
      if(result != undefined){
        inputs = result.inputs;
        changeAmount = result.changeAmount;
        console.log("====inputs used",inputs)
        console.log("====changeAmount",changeAmount)
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
  console.log("==psbt 22 hex",psbt.toHex())


  // Sign all inputs
  // for (let i = 0; i < psbt.inputCount; i++) {
  //   const signer = childNode.derive(0).derive(utxos[i].derviation_index);
  //   psbt.signInput(i, signer);
  // }
  // psbt.finalizeAllInputs();

  // // Check if transaction size exceeds the limit
  // if ((psbt.extractTransaction(true).virtualSize() * 4) / 1000 > 3600) {
  //   throw new Error("Maximum file size exceeded.");
  // }

  // //Broadcast the transaction
  try {
    //const response: rpcResponse = await sendTransactionHelper(
      // psbt.extractTransaction(true).toHex(),
      psbt.toHex()

    //);
    // console.log(      psbt.extractTransaction(true).toHex(),"----extractTransaction------"
    // );

    //console.log(psbt.toHex());
    saveUsedUtxo(utxo.txid);

    return psbt.toHex();
  } catch (error) {
    console.log(error);
  }
}
