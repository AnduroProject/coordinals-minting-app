"use client";

import axios from "axios";


enum COLLECTION_STATUS {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  SOLD_OUT = "SOLD_OUT",
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


export async function fetchUtxos(address: string): Promise<{ success: true, data: any } | { success: false, error: string }> {
  try {
    const response = await axios.post("/api/utxo", { address });

    const name = response.data?.data?.name;

    if (name === "Error") {
      return { success: false, error: "Something went wrong" };
    }

    return { success: true, data: response.data.data };
    
  } catch (error) {
    console.error("Error in fetching utxo:", error);
    return { success: false, error: "Network or server error occurred" };
  }
}


export function fetchTransactionHex(
  txId: string,
  verbose: boolean,
  blockHash: string | null,
) {
  return axios
    .post("/api/transactionHex", { txId, verbose, blockHash })
    .then((response) => {
      return response.data.data;
    });
}



export function disconnectCookie() {
  return axios.post("/api/auth", ).then((response) => {
    return response;
  });
}

export function fetchBlockHash(height: number) {
  return axios.post("/api/blockHash", { height }).then((response) => {
    return response.data.data;
  });
}

export function sendTransactionHelper(transactionHex: string) {
  return axios
    .post("/api/sendTransaction", { transactionHex })
    .then((response) => {
      return response.data.data;
    });
}

export async function saveJsonData(jsonData: any,tokenId:number) {

  try {
    const response = await axios.post("/api/metaData", { jsonData, tokenId });
    return response.data;
  } catch (error) {
    console.error("Error saving JSON:", error);
    throw error;
  }
}


export function tokenId() {

  return axios.get("/api/tokenId")
  .then((response) =>  {
    return response.data.data;
    })
    .catch((error) => {
      console.error("Error in getting token id:", error);
      throw error;
    }); 
}

export function storeTokenId(tokenId: number) {
 
  if (!tokenId) {
    throw new Error("tokenId is missing");
  }
  return axios.post("/api/tokenId", { tokenId})
  .then((response) =>  response)
    .catch((error) => {
      console.error("Error in storing token id:", error);
      throw error;
    }); 
}


export async function tokenTransferInfo(toAddress:string,supply:any) {
  try {
    const response = await axios.post("/api/alysTokenTransfer", { toAddress, supply });
    return response.data;
  } catch (error) {
    console.error("Error in getting provider Info :", error);
    throw error;
  } 
}

export function contractInfo(tokenContractAddress:string,tokenAbi:any) {

  return axios.post("/api/contractInfo", {tokenContractAddress,tokenAbi})
  .then((response) =>  {
    return response.data;
    })
    .catch((error) => {
      console.error("Error in getting contract info :", error);
      throw error;
    }); 
}
export async function nftMintInfo(toAddress:string,mintId:number) {

  try {
    const response = await axios.post("/api/alysNftMint", { toAddress, mintId });
    return response.data;
  } catch (error) {
    console.error("Error in getting nftMint Info  :", error);
    throw error;
  } 
}