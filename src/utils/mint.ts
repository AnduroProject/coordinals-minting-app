import * as coordinate from "chromajs-lib";

import { rpcResponse, tokenData, utxo } from "@/types";
import { deriveKeyFromMnemonic } from "@chainsafe/bls-keygen"

const schnorr = require("bip-schnorr");
const convert = schnorr.convert;
import ecc from "@bitcoinerlab/secp256k1";
import * as bip39 from "bip39";
import BIP32Factory from "bip32";
const bip32 = BIP32Factory(ecc);
import * as chroma from "chromajs-lib"
import { calculateSize, convertToSAT, getChainInstance, getNetwork, } from "./calculateSize";
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
import { alysRPCUrl, apiurl, maraUrl, privateKey } from "@/lib/constants";
import { toast } from "sonner";
import { ethers } from "ethers";

export const convertDataToSha256Hex = (value: any) => {
  return convert.hash(Buffer.from(value, "utf8")).toString("hex");
};

export const stringtoHex = (value: any) => {
  const buffer = Buffer.from(value, "utf8");
  const hexString = buffer.toString("hex");
  return hexString;
};

export function getProvider(apiUrl: any) {
  console.log("provider api url",apiUrl)
  return new ethers.JsonRpcProvider(apiUrl)
}

export async function getContractInfo(toAddress:any ,contractAddress:any,abiFile:any){
  const provider = getProvider(alysRPCUrl)
  console.log("---provider", provider)
  const signer = new ethers.Wallet(privateKey, provider)
  const nonces = await provider.getTransactionCount(signer.address, "pending")
  console.log("----nonces", nonces)
  const contract = new ethers.Contract(contractAddress, abiFile, signer);
  console.log("----contract", contract)

  const gasPrice = (await provider.getFeeData()).gasPrice
  console.log("----gasPrice", gasPrice)

  return {
    contract, 
    gasPrice,
    nonces,
    signer
  }
}

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
      unspent.confirmations >= 10
    ) {
      utxos.push(unspent)
    }
  }
  console.log("🚀 ~ utxos:", utxos);

  if (utxos.length === 0) {
    console.log("====222")
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

  console.log("===controllerAddress=", controllerAddress)

  const toAddress = coordinate.payments.p2wpkh({
    pubkey: destNode.publicKey,
    network: coordinate.networks.testnet,
  }).address;
  console.log("===toAddress=", toAddress)

  if (!controllerAddress || !toAddress)
    throw new Error("Address does not exists.");

  outputs.push({ address: controllerAddress, value: 10 ** 8 });
  outputs.push({ address: toAddress, value: data.supply });

  outputs.forEach(output => {
    psbt.addOutput(output);
  });
  console.log("===psbt output=", outputs)


  for (let i = 0; i < utxos.length; i++) {
    const currentUtxo = utxos[i];
    console.log("====current utxo", currentUtxo);

    // Add the UTXO to selected inputs
    selectedUtxos.push(currentUtxo);
    totalInputValue += currentUtxo.value;
    console.log("Intermediate Selected UTXOs:", [...selectedUtxos]);

    // Add the input to the PSBT
    const network = getNetwork("test", "sidechain");
    console.log("====network", network);
    console.log("==== chroma.address", getChainInstance("sidechain").address);
    console.log("==== chroma", currentUtxo.derviation_index);


    psbt.addInput({
      hash: currentUtxo.txid,
      index: currentUtxo.vout,

    });
    const testNode = acc.derive(currentUtxo.derviation_index);
    const address = coordinate.payments.p2wpkh({
      pubkey: testNode.publicKey,
      network: coordinate.networks.testnet,
    }).address;
    console.log("===testNode addresss=", toAddress)

    psbt.updateInput(i, {
      witnessUtxo: {
        script: getChainInstance("sidechain").address.toOutputScript(address|| "", network),
        value: currentUtxo.value,
      },
    });
    ///script: getChainInstance(networkType || "").address.toOutputScript(address, network),


    // Calculate the size and fee
    const vbytes = await calculateSize(psbt, outputs, data);
    requiredAmount = vbytes * feeRate;
    console.log("===requiredAmount=", requiredAmount);
    console.log("===totalInputValue=", totalInputValue);


    if (totalInputValue >= requiredAmount) {
      changeAmount = totalInputValue - requiredAmount;
      console.log("Change Amount:", changeAmount);

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
          console.log("Change output is too small; skipping it.");
        }
      }
      break;
    }

    if (i === utxos.length - 1 && totalInputValue < requiredAmount) {
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
