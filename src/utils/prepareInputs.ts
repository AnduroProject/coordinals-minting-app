import { utxo } from "@/types";
import { inputSize } from "@/lib/constants";
import { getUtxos } from "./libs";
import { fetchUtxos } from "@/lib/service/fetcher";
import { toast } from "sonner";
import { getUnspentsLsit } from "./calculateSize";

export async function prepareInputs(
  address: string,
  requiredAmount: number,
  feeRate: number,
) {
  const utxos: utxo[] = await fetchUtxos(address);

  const inputs: utxo[] = [];
  let totalAmount = 0,
    index = 0;

  while (totalAmount < requiredAmount) {

    if (index > utxos.length -1) {
      //throw new Error("Insufficient balance.");
      toast.error("Insufficient balance.")
      return
    }

    inputs.push(utxos[index]);
    totalAmount += utxos[index].value;
    index++;
    requiredAmount += inputSize * feeRate;
  }
  return {
    inputs: inputs,
    changeAmount: totalAmount - requiredAmount,
  };
}
