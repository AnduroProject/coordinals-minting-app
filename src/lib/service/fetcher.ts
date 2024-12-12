"use client";

import axios from "axios";
import { apiurl } from "../constants";
import { error } from "console";
import path from "path";

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

export function fetchUtxos(address: string) {
  return axios.post("/api/utxo", { address }).then((response) => {
    return response.data.data;
  });
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

export function saveJsonData(jsonData: any,tokenId:number) {
  console.log("tokenId== save=========",tokenId)

  return axios.post("/api/metaData", { jsonData, tokenId })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error saving JSON:", error);
      throw error;
    });
}

export function nftInstance(tokenAddress: string) {
  console.log("nftInstance===========",tokenAddress)
  if (!tokenAddress) {
    throw new Error("tokenAddress is missing");
  }
  return axios.post("/api/instance", { tokenAddress })
  .then((response) =>  response.data.data)
    .catch((error) => {
      console.error("Error in getting instances:", error);
      throw error;
    }); 
}

export function alysTokenInfo(address: string) {
  console.log("alysTokenInfo===========",address)
  if (!address) {
    throw new Error("tokenAddress is missing");
  }
  return axios.post("/api/tokenInfo", { address })
  .then((response: any) =>  response.data.data)
    .catch((error: any) => {
      console.error("Error in getting instances:", error);
      throw error;
    }); 
}
