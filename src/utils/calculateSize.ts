import { BIP32Interface } from "bip32";
import * as coordinate from "chromajs-lib";
import { Psbt } from "chromajs-lib";
import { outputSize } from "@/lib/constants";
import { tokenData, utxo } from "@/types";

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
  acc: BIP32Interface,
  inputs: utxo[],
  data: tokenData,
) {
  let transactionSize = 11
  // segwit address input size
  let inputSize = 68

  console.log("====calculateSize",data)
  console.log("====calculateSize 22",data.opReturnValues)

    transactionSize += inputSize * psbt.data.inputs.length
    for (let index = 0; index < psbt.data.outputs.length; index++) {
      transactionSize += 31
      
    }  
    
      transactionSize += 2 // default size for asset type
      transactionSize += Buffer.from(data.headline, "utf8").byteLength
      transactionSize += Buffer.from(data.ticker, "utf8").byteLength
   
      // transactionSize += Buffer.from(transactionData.payload, "hex").byteLength
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