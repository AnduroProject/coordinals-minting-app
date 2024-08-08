import { utxo } from "@/types";
import { inputSize } from "@/lib/constants";
import { getUtxos } from "./libs";
import { fetchUtxos } from "@/lib/service/fetcher";

export async function prepareInputs(
  address: string,
  requiredAmount: number,
  feeRate: number,
) {
  const utxos: utxo[] = await fetchUtxos(address);

  //removing already added input, and subtracting the value
  const maxUtxo = utxos.shift();
  if (!maxUtxo) throw new Error("No utxo found.");
  requiredAmount -= maxUtxo.value;

  const inputs: utxo[] = [];
  let totalAmount = 0,
    index = 0;

  while (totalAmount < requiredAmount) {
    if (index > utxos.length - 1) throw new Error("Insufficient balance.");

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
