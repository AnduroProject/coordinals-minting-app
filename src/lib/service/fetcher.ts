"use client";

import axios from "axios";
import { apiurl } from "../constants";
import { error } from "console";

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
export function wishlistAddress(params: any) {
  console.log("=====wishlistAddress,",params)

  return axios
    .post("/api/wishlist",{params} )
    .then((response) => {
      console.log("=====wishlistAddress 222,")
      console.log("=====wishlistAddress response",response)

      return response.data.data;
    }).catch((error) =>{
console.log("=====catched,",error)
    });
}
