import axios from "axios";
import { utxo } from "@/types";
import {
  apiurl,
  alysBaseURL,
  maraUrl,
  RPC_PASSWORD,
  RPC_USERNAME,
  rpcPort,
  rpcUrl,
  appBaseUrl,
} from "@/lib/constants";

export async function getBlockCount() {
  const body = {
    jsonrpc: "1.0",
    method: "getblockcount",
    id: "curltest",
    params: [],
  };

  try {
    const response = await axios.post(`${rpcUrl}:${rpcPort}`, body, {
      auth: {
        username: RPC_USERNAME ?? "",
        password: RPC_PASSWORD ?? "",
      },
    });

    const rpc = response.data;

    console.log(rpc.result);
  } catch (e) {
    console.log(e);
  }
}

export async function getBlockHash(height: number) {
  const body = {
    jsonrpc: "1.0",
    method: "getblockhash",
    id: "curltest",
    params: [height],
  };
  console.log("===response getBlockHash")


  const response = await axios.post(`${rpcUrl}:${rpcPort}`, body, {
    auth: {
      username: RPC_USERNAME ?? "",
      password: RPC_PASSWORD ?? "",
    },
  }); console.log("===response getBlockHash response")


  return response.data;
}

export async function getTransactionHex(
  txId: string,
  verbose: boolean,
  blockHash: string | null,
) {
  let params = [txId, verbose, blockHash];
  if (!blockHash) params = [txId];

  const body = {
    jsonrpc: "1.0",
    method: "getrawtransaction",
    id: "curltest",
    params: params,
  };

  const response = await axios.post(`${rpcUrl}:${rpcPort}`, body, {
    auth: {
      username: RPC_USERNAME ?? "",
      password: RPC_PASSWORD ?? "",
    },
  });

  return response.data;
}

/* export async function getUtxos(address: string) {
  const body = {
    jsonrpc: "1.0",
    method: "scantxoutset",
    id: "curltest",
    params: ["start", [{ desc: `addr(${address})` }]],
  };
  // try {
  const response = await axios.post(`${rpcUrl}:${rpcPort}`, body, {
    auth: {
      username: RPC_PASSWORDE,
      password: process.env.RPC_PASSWORD ??"",
    },
  });

  const utxos: utxo[] = response.data.result.unspents;

  if (utxos.length === 0) throw new Error("No utxo found.");

  utxos.sort((a, b) => b.amount - a.amount);
  utxos.forEach((utxo) => (utxo.amount = utxo.amount * 10 ** 8));

  return utxos;
  // } catch (error) {
  //   console.log("🚀 ~ getUtxos ~ error:", error);
  //   throw new Error(error);
  // }
} */

export async function getUtxos(address: string) {
  const response = await axios.get(maraUrl + address);

  const utxos: utxo[] = response.data.result;

  utxos.forEach((utxo) => {
    utxo.value = Number(utxo.value);
    utxo.height = Number(utxo.height);

    console.log(utxo);
  });
  utxos.sort((a, b) => b.value - a.value);

  return utxos;
}



export async function fetchTokenInstances(tokenAddress: string) {
   try {
    const url = `${alysBaseURL}/${tokenAddress}/instances`;
    console.log("__URL", url)
    const response = await axios.get(url);
    console.log("====response",response)
    return response.data;
  } catch (error:any) {
    console.error("Error fetching token instances:", error.response?.data);
    return error;
  }
}


export async function wishlist(params: any) {
  const WHITELIST_ADDRESS = "unspents/whitelist"
  try {
    const response = await axios.post(apiurl, params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;

  } catch (error) {
    console.log("🚀 ~ wishlist ~ error:", error);

  }
}

export async function sendTransactionToRpc(transactionHex: string) {
  const body = {
    jsonrpc: "1.0",
    method: "sendrawtransaction",
    id: "curltest",
    params: [transactionHex, 0, []],
  };

  const response = await axios.post(`${rpcUrl}:${rpcPort}`, body, {
    auth: {
      username: RPC_USERNAME ?? "",
      password: RPC_PASSWORD ?? "",
    },
  });

  console.log(response.data);

  return response.data;
}



