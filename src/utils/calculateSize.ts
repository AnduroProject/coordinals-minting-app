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
  let inputSize = 72

    transactionSize += inputSize * psbt.data.inputs.length
    for (let index = 0; index < psbt.data.outputs.length; index++) {
      transactionSize += 31
      
    }  
    
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
export async  function   getUnspentsLsit(
   utxos:utxo[],
   
) {
  const unspents: utxo[] = []
  //const blockHeight: number = (await getMinedBlockCount(networkInfo.chromaBookApi)).height
  for (let i = 0; i < utxos.length; i++) {
    const unspent = utxos[i]
    if (!unspent.coinbase) unspents.push(unspent)
    if (
      unspent.coinbase &&
    unspent.confirmations >10 
    ) {
      unspents.push(unspent)
    }
  }
  return unspents
}


export const isTxConfirmed = (txHeight: number, blockHeight: number, networkType: string) => {
  let coinbaseMaximumConfimation = 100
  if (networkType === "sidechain") coinbaseMaximumConfimation = 10
  return blockHeight - txHeight > coinbaseMaximumConfimation && txHeight !== 0
}