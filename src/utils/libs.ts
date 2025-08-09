import axios from 'axios';
import { utxo } from '@/types';
import {
  alysBaseURL,
  maraUrl,
  RPC_PASSWORD,
  RPC_USERNAME,
  rpcPort,
  rpcUrl,
} from '@/lib/constants';

/**
 * This function is used to get the block count using RPC
 */
export async function getBlockCount() {
  const body = {
    jsonrpc: '1.0',
    method: 'getblockcount',
    id: 'curltest',
    params: [],
  };

  try {
    const response = await axios.post(`${rpcUrl}:${rpcPort}`, body, {
      auth: {
        username: RPC_USERNAME ?? '',
        password: RPC_PASSWORD ?? '',
      },
    });

    const rpc = response.data;
    console.log(rpc.result);
  } catch (e) {
    console.log(e);
  }
}

/**
 * This function is used to get the block hash using RPC
 */
export async function getBlockHash(height: number) {
  const body = {
    jsonrpc: '1.0',
    method: 'getblockhash',
    id: 'curltest',
    params: [height],
  };

  const response = await axios.post(`${rpcUrl}:${rpcPort}`, body, {
    auth: {
      username: RPC_USERNAME ?? '',
      password: RPC_PASSWORD ?? '',
    },
  });
  return response.data;
}

/**
 * This function is used to get the transaction hex using RPC
 * @param txId -txId
 * @param verbose -verbose
 * @param blockHash -blockHash
 */
export async function getTransactionHex(
  txId: string,
  verbose: boolean,
  blockHash: string | null,
) {
  let params = [txId, verbose, blockHash];
  if (!blockHash) params = [txId];

  const body = {
    jsonrpc: '1.0',
    method: 'getrawtransaction',
    id: 'curltest',
    params: params,
  };

  const response = await axios.post(`${rpcUrl}:${rpcPort}`, body, {
    auth: {
      username: RPC_USERNAME ?? '',
      password: RPC_PASSWORD ?? '',
    },
  });

  return response.data;
}

/**
 * This function is used to get  unspents for transaction
 * @param address -address
 */
export async function getUtxos(address: string) {
  try {
    const response = await axios.get(maraUrl + address);

    const utxos: utxo[] = response.data.result;

    utxos.forEach((utxo) => {
      utxo.value = Number(utxo.value);
      utxo.height = Number(utxo.height);

      console.log(utxo);
    });
    utxos.sort((a, b) => b.value - a.value);

    return utxos;
  } catch (error) {
    return error;
  }
}

/**
 * This function is used to fetch the token instances for the given token address
 * @param tokenAddress -tokenAddress
 */
export async function fetchTokenInstances(tokenAddress: string) {
  try {
    const url = `${alysBaseURL}/${tokenAddress}/instances`;
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching token instances:', error.response?.data);
    return error;
  }
}
/**
 * This function is used to send the transaction using RPC
 * @param transactionHex -transactionHex
 */
export async function sendTransactionToRpc(transactionHex: string) {
  const body = {
    jsonrpc: '1.0',
    method: 'sendrawtransaction',
    id: 'curltest',
    params: [transactionHex, 0, []],
  };

  const response = await axios.post(`${rpcUrl}:${rpcPort}`, body, {
    auth: {
      username: RPC_USERNAME ?? '',
      password: RPC_PASSWORD ?? '',
    },
  });

  console.log(response.data);
  return response.data;
}
