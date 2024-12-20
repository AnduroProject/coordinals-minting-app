import { alysRPCUrl, privateKey, tokenContractAddress } from "@/lib/constants";
import { tokenAbi } from "@/utils/tokenAbi";
import { ethers } from "ethers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { toAddress,supply } = await req.json();
   console.log("----RPC URL")
    try {
      const provider = new ethers.JsonRpcProvider(alysRPCUrl)
      console.log("----RPC response",provider)
      const signer = new ethers.Wallet(privateKey, provider)
      const nonces = await provider.getTransactionCount(signer.address, "pending")
      console.log("----nonces", nonces)
      const contract = new ethers.Contract(tokenContractAddress, tokenAbi, signer);
      console.log("----contract", contract)
  
      const gasPrice = (await provider.getFeeData()).gasPrice
      console.log("----toAddress", toAddress)
      console.log("----supply", supply)
      console.log("----ethers.parseEther(supply.toString())", ethers.parseEther(supply.toString()))
      

      const gethex = await contract.transfer(
        toAddress,
        ethers.parseEther(supply.toString()),
        {
          chainId: "212121",
          gasPrice: gasPrice,
          nonce: nonces,
        },
      )
      console.log("gethex ..----------.", gethex)

      return NextResponse.json({ status: 200, data: gethex, message: null });
    } catch (error) {
        console.log("error ..----------.", error)
      return NextResponse.json({
        status: 500,
        data: null,
        message: error,
      });
    }
  }
  