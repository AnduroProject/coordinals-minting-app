import { utxo } from "@/types";
import { inputSize } from "@/lib/constants";
import { getUtxos } from "./libs";
import { fetchUtxos } from "@/lib/service/fetcher";
import { toast } from "sonner";

export async function prepareInputs(
  utxos :utxo[],
  requiredAmount: number,
  feeRate: number,

) {
  //const utxos: utxo[] = await fetchUtxos(address);

//removing already added input, and subtracting the value
// const maxUtxo = utxos.shift();
// if (!maxUtxo) throw new Error("No utxo found.");
// requiredAmount -= maxUtxo.value;

  const inputs: utxo[] = [];
  let totalAmount = 0,
    index = 0;
    console.log("====requiredAmount in prepare",requiredAmount)

  while (totalAmount < requiredAmount) {

    if (index > utxos.length -1) {
      console.log("====index",index)

      throw new Error("Insufficient balance.");
      //toast.error("Insufficient balance.")
      return
    }

    inputs.push(utxos[index]);
    totalAmount += utxos[index].value;
    index++;
    requiredAmount += inputSize * feeRate;
    console.log("====requiredAmount final in prepare",requiredAmount)

  }
  return {
    inputs: inputs,
    changeAmount: totalAmount - requiredAmount,
  };
}
