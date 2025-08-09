import { utxo } from '@/types';
import { inputSize } from '@/lib/constants';

/**
 * This function is used to prepare the inputs to make transaction
 * @param utxos -utxos
 * @param requiredAmount -requiredAmount
 * @param feeRate -feeRate
 */
export async function prepareInputs(
  utxos: utxo[],
  requiredAmount: number,
  feeRate: number,
) {
  const inputs: utxo[] = [];
  let totalAmount = 0,
    index = 0;
  while (totalAmount < requiredAmount) {
    if (index > utxos.length - 1) {
      throw new Error('Insufficient balance.');
      return;
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
