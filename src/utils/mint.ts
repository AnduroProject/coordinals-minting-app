import * as coordinate from "chromajs-lib";

import {  tokenData, utxo } from "@/types";

const schnorr = require("bip-schnorr");
const convert = schnorr.convert;
import ecc from "@bitcoinerlab/secp256k1";
import * as bip39 from "bip39";
import BIP32Factory from "bip32";
const bip32 = BIP32Factory(ecc);
import * as chroma from "chromajs-lib"
import { calculateSize, convertToSAT, getChainInstance, getNetwork, } from "./calculateSize";
import {
  fetchUtxos,
  
} from "@/lib/service/fetcher";


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


  const walletxpub = localStorage.getItem("xpubkey") || "";
  const acc = bip32.fromBase58(walletxpub, coordinate.networks.testnet);
  const node = acc.derive(0)
  const destNode = acc.derive(2);


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
  if (data.assetType === 0) psbt.setPrecisionType(Number(data?.precision) || 8);

  const result = await fetchUtxos(walletxpub);
  let unspents: utxo[] = [];

  if (result.success) {
    unspents = result.data; 
  //  console.log("UTXO fetch error:", unspents);
    // Handle error UI or fallback
  } else {
   // console.error("UTXOs fetch error::", result.error);
    throw { message:result.error};
  }
  
  // Fetch available UTXOs for the given xpub
  //let unspents: utxo[] = await fetchUtxos(walletxpub);
  // try {
  //   const utxos = await fetchUtxos(walletxpub);
  //   console.log("Fetched UTXOs:", utxos);
  // } catch (err:any) {
  //   console.error("Failed to fetch UTXOs:", err.message);
  // }
  
 // console.log("🚀 ~ utxos: 111", unspents);

  unspents.sort((a, b) => b.value - a.value);
  const utxos: utxo[] = []
  for (let i = 0; i < unspents.length; i++) {
    const unspent = unspents[i]
    if (!unspent.coinbase) utxos.push(unspent)
    if (
      unspent.coinbase &&
      unspent.confirmations >= 10
    ) {
      utxos.push(unspent)
    }
  }

  if (utxos.length === 0) {
    throw { message: "Insufficient funds" };
  }
  const outputs: Array<{ address: string; value: number }> = [];

  // Calculate the required amount for the transaction
  let requiredAmount = 0;
  let selectedUtxos: utxo[] = [];
  let totalInputValue = 0;
  let changeAmount = 0
  const controllerAddress = coordinate.payments.p2wpkh({
    pubkey: node.publicKey,
    network: coordinate.networks.testnet,
  }).address;


  const toAddress = coordinate.payments.p2wpkh({
    pubkey: destNode.publicKey,
    network: coordinate.networks.testnet,
  }).address;

  if (!controllerAddress || !toAddress)
    throw new Error("Address does not exists.");

  let   supplyValue = data.supply * 10 ** Number(data?.precision )|| 8

  outputs.push({ address: controllerAddress, value: 10 ** 8 });
  if (data.assetType === 0) {
    outputs.push({ address: toAddress, value: supplyValue });

  }else{
    outputs.push({ address: toAddress, value: data.supply });

  }

  outputs.forEach(output => {
    psbt.addOutput(output);
  });


  for (let i = 0; i < utxos.length; i++) {
    const currentUtxo = utxos[i];

    // Add the UTXO to selected inputs
    selectedUtxos.push(currentUtxo);
    totalInputValue += currentUtxo.value;

    // Add the input to the PSBT
    const network = getNetwork("test", "sidechain");
  


    psbt.addInput({
      hash: currentUtxo.txid,
      index: currentUtxo.vout,

    });
    const testNode = acc.derive(currentUtxo.derviation_index);
    const address = coordinate.payments.p2wpkh({
      pubkey: testNode.publicKey,
      network: coordinate.networks.testnet,
    }).address;

    psbt.updateInput(i, {
      witnessUtxo: {
        script: getChainInstance("sidechain").address.toOutputScript(address || "", network),
        value: currentUtxo.value,
      },
    });
    ///script: getChainInstance(networkType || "").address.toOutputScript(address, network),


    // Calculate the size and fee
    const vbytes = await calculateSize(psbt, outputs, data);
    requiredAmount = vbytes * feeRate;



    if (totalInputValue >= requiredAmount) {
      changeAmount = totalInputValue - requiredAmount;

      if (changeAmount > convertToSAT(0.00001)) {
        outputs.push({ address: toAddress, value: changeAmount });

        //Recalculate size and fee after adding the change output**
        const updatedVbytes = await calculateSize(psbt, outputs, data);
        const updatedRequiredAmount = updatedVbytes * feeRate;

        changeAmount = totalInputValue - updatedRequiredAmount;
        if (changeAmount > convertToSAT(0.00001)) {
          psbt.addOutput({ address: toAddress || "", value: changeAmount });
        }
        else {
          //console.log("Change output is too small; skipping it.");
        }
      }
      break;
    }

    if (i === utxos.length - 1 && totalInputValue < requiredAmount) {
      throw { message: "Insufficient funds: You don't have enough funds" };
    }
  }

  

  try {
    //saveUsedUtxo(utxos.txid);
    return psbt.toHex();
  } catch (error) {
    console.log(error);
  }
}
