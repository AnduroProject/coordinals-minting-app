import { Psbt } from 'chromajs-lib';
import { inputSize } from '@/lib/constants';
import { tokenData } from '@/types';
import * as chroma from 'chromajs-lib';

/**
 * This function is used to calculate the transaction size
 * @param psbt -psbt
 * @param outputs -outputs
 * @param data -data
 */
export async function calculateSize(
  psbt: Psbt,
  outputs: Array<{ address: string; value: number }>,
  data: tokenData,
) {
  let transactionSize = 11;
  // segwit address input size

  transactionSize += inputSize * psbt.data.inputs.length;

  for (let index = 0; index < outputs.length; index++) {
    transactionSize += 31;
  }
  transactionSize += 2; // default size for asset type
  transactionSize += Buffer.from(data.headline, 'utf8').byteLength;
  transactionSize += Buffer.from(data.ticker, 'utf8').byteLength;
  if (data.assetType === 0 || data.assetType === 1) {
    transactionSize += Buffer.from(
      data.opReturnValues[0].image_url,
      'utf8',
    ).byteLength;
  } else {
    transactionSize += Buffer.from(
      data.opReturnValues[0].image_data,
      'base64',
    ).byteLength;
  }
  return transactionSize;
}
/**
 * This function is used to convert  to satoshi
 * @param value -value
 */
export const convertToSAT = (value: number): number => {
  return Math.round(value * 10 ** 8);
};

/**
 * This function is used to convert  to satoshi
 * @param value -value
 */
export const getChainInstance = (networkType: any) => {
  return chroma;
};

/**
 * This function is used to convert  to satoshi
 * @param networkMode -networkMode
 * @param networkType -networkType
 */
export const getNetwork = (networkMode: string, networkType: string) => {
  if (networkMode === 'test') {
    return getChainInstance(networkType).networks.testnet;
  }
  if (networkMode === 'main') {
    return getChainInstance(networkType).networks.bitcoin;
  }
  return getChainInstance(networkType).networks.regtest;
};

/**
 * This function is used to generate the random string
 * @param length -length
 */
export function generateRandomString(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
