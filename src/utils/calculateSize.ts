import { BIP32Interface } from "bip32";
import * as coordinate from "chromajs-lib";
import { Psbt } from "chromajs-lib";
import { inputSize, outputSize } from "@/lib/constants";
import { tokenData, utxo } from "@/types";
import * as chroma from "chromajs-lib"
// export async function calculateSize(
//   psbt: Psbt,
//   acc: BIP32Interface,
//   inputs: utxo[],
// ) {
//   const instance = coordinate.Psbt.fromBuffer(psbt.toBuffer());
//    console.log("====isntance",instance)
//   for (let i = 0; i < instance.inputCount; i++) {
//     const signer = acc.derive(0).derive(inputs[i].derviation_index);
//     instance.signInput(i, signer);
//   }

//   instance.finalizeAllInputs();

//   const vBytes = instance.extractTransaction(true).virtualSize();

//   return vBytes + outputSize;
// }

export async function calculateSize(
  psbt: Psbt,
  outputs: Array<{ address: string; value: number }>,
  data: tokenData,
  
) {
  let transactionSize = 11
  // segwit address input size

    transactionSize += inputSize * psbt.data.inputs.length
    console.log("====psbt.data.inputs.length",psbt.data.inputs.length)
    console.log("====psbt.data.outputs.length",outputs.length)
    console.log("====psbt.",data)

    for (let index = 0; index < outputs.length; index++) {
      transactionSize += 31
      
    }  
    console.log("====psbt.data.")

      transactionSize += 2 // default size for asset type
      transactionSize += Buffer.from(data.headline, "utf8").byteLength
      transactionSize += Buffer.from(data.ticker, "utf8").byteLength
          if(data.assetType === 0 || data.assetType === 1){
        transactionSize += Buffer.from(data.opReturnValues[0].image_url
          , "utf8").byteLength
      }else {
        transactionSize += Buffer.from(data.opReturnValues[0].image_data
          , "base64").byteLength
        
      }
  console.log("====outputSize",transactionSize)
  return transactionSize;
}

export const convertToSAT = (value: number): number => {
  return Math.round(value * 10 ** 8)
}

export const getChainInstance = (networkType: any) => {
return chroma
  
}

export const getNetwork = (networkMode: string, networkType: string) => {
     console.log("network mode -network type",networkMode,networkType)

  if (networkMode === "test") {
    return getChainInstance(networkType).networks.testnet
  }
  if (networkMode === "main") {
    return getChainInstance(networkType).networks.bitcoin
  }
  return getChainInstance(networkType).networks.regtest
}

// export const getNetwork = (networkMode: string, networkType: string) => {
//   console.log("network mode -network type",networkMode,networkType)
//   if (networkMode === "test") {
//     return chroma.networks.testnet
//   }
//   if (networkMode === "main") {
//     return chroma.networks.bitcoin
//   }
//   return chroma.networks.regtest
// }




