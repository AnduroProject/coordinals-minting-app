'use client';

import axios from 'axios';

enum COLLECTION_STATUS {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  SOLD_OUT = 'SOLD_OUT',
}

export interface CollectionType {
  id: string;
  name: string;
  ticker: string;
  description: string;
  supply: number;
  price: number;
  createdAt: string;
  walletLimit: number;
  logoKey: string;
  POStartDate: string;
  status: COLLECTION_STATUS;
  totalCount: number;
  userId: string;
  mintedCount: number;
}

/**
 * This function is used to fetch the unspents
 * @param address-address
 */
export async function fetchUtxos(
  address: string,
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  try {
    const response = await axios.post('/api/utxo', { address });
    const name = response.data?.data?.name;
    if (name === 'Error') {
      return { success: false, error: 'Something went wrong' };
    }
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Error in fetching utxo:', error);
    return { success: false, error: 'Network or server error occurred' };
  }
}

/**
 * This function is used to fetch the transaction hex
 * @param txId- txId
 * @param verbose -verbose
 * @param blockHash -blockHash
 */
export async function fetchTransactionHex(
  txId: string,
  verbose: boolean,
  blockHash: string | null,
) {
  const response = await axios.post('/api/transactionHex', {
    txId,
    verbose,
    blockHash,
  });
  return response.data.data;
}

/**
 * This function is used to diconnect the cookie
 */
export async function disconnectCookie() {
  const response = await axios.post('/api/auth');
  return response;
}

/**
 * This function is used to diconnect the cookie
 * @param  height -height
 */
export async function fetchBlockHash(height: number) {
  const response = await axios.post('/api/blockHash', { height });
  return response.data.data;
}

/**
 * This function is used to send the transaction to wallet
 * @param transactionHex -transactionHex
 */
export async function sendTransactionHelper(transactionHex: string) {
  const response = await axios.post('/api/sendTransaction', { transactionHex });
  return response.data.data;
}

/**
 * This function is used to save the json data
 * @param jsonData -jsonData
 * @param tokenId -tokenId
 */
export async function saveJsonData(jsonData: any, tokenId: number) {
  try {
    const response = await axios.post('/api/metaData', { jsonData, tokenId });
    return response.data;
  } catch (error) {
    console.error('Error saving JSON:', error);
    throw error;
  }
}

/**
 * This function is used to get token id of the asset
 */
export async function tokenId() {
  try {
    const response = await axios.get('/api/tokenId');
    return response.data.data;
  } catch (error) {
    console.error('Error in getting token id:', error);
    throw error;
  }
}

/**
 * This function is used to store the token id of the asset
 * @param tokenId -tokenId
 */
export async function storeTokenId(tokenId: number) {
  if (!tokenId) {
    throw new Error('tokenId is missing');
  }
  try {
    const response = await axios.post('/api/tokenId', { tokenId });
    return response;
  } catch (error) {
    console.error('Error in storing token id:', error);
    throw error;
  }
}
/**
 * This function is used to transfer the alys tokens
 * @param toAddress -toAddress
 * @param supply -supply
 */
export async function tokenTransferInfo(toAddress: string, supply: any) {
  try {
    const response = await axios.post('/api/alysTokenTransfer', {
      toAddress,
      supply,
    });
    return response.data;
  } catch (error) {
    console.error('Error in getting provider Info :', error);
    throw error;
  }
}

/**
 * This function is used to get the contract details
 * @param tokenContractAddress -tokenContractAddress
 * @param tokenAbi -tokenAbi
 */
export async function contractInfo(
  tokenContractAddress: string,
  tokenAbi: any,
) {
  try {
    const response = await axios.post('/api/contractInfo', {
      tokenContractAddress,
      tokenAbi,
    });
    return response.data;
  } catch (error) {
    console.error('Error in getting contract info :', error);
    throw error;
  }
}

/**
 * This function is used to mint the alys nft
 * @param toAddress -tokenContractAddress
 * @param mintId -tokenAbi
 */
export async function nftMintInfo(toAddress: string, mintId: number) {
  try {
    const response = await axios.post('/api/alysNftMint', {
      toAddress,
      mintId,
    });
    return response.data;
  } catch (error) {
    console.error('Error in getting nftMint Info  :', error);
    throw error;
  }
}
