import { utxo } from "@/types";
import { inputSize } from "@/lib/constants";
import { getUtxos } from "./libs";
import { fetchUtxos } from "@/lib/service/fetcher";
import { toast } from "sonner";

export async function prepareInputs(
  address: string,
  requiredAmount: number,
  feeRate: number,
) {
  const utxos: utxo[] = await fetchUtxos(address);
  console.log(" all utxos",utxos)

  //removing already added input, and subtracting the value
  // const maxUtxo = utxos.shift();
  // if (!maxUtxo) throw new Error("No utxo found.");
  // requiredAmount -= maxUtxo.value;

  const inputs: utxo[] = [];
  let totalAmount = 0,
    index = 0;

    console.log("==total amnt initial",totalAmount)
    console.log("==requiredAmountinitial",requiredAmount)

  while (totalAmount < requiredAmount) {
    console.log("==utxo.lenth",utxos.length)

    if (index > utxos.length -1) {
      //throw new Error("Insufficient balance.");
      toast.error("Insufficient balance.")
      return
    }
    
    //toast.error("Insufficient balance.")
    //throw new Error("Insufficient balance.");

    inputs.push(utxos[index]);
    console.log("==utxo.inputs",inputs)

    totalAmount += utxos[index].value;
    console.log("==utxo.totalAmount",totalAmount)

    index++;
    requiredAmount += inputSize * feeRate;
    console.log("==utxo.requiredAmount",requiredAmount)

  }
  return {
    inputs: inputs,
    changeAmount: totalAmount - requiredAmount,
  };
}
