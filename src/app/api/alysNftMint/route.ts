import { alysRPCUrl, nftContractAddress, privateKey, tokenContractAddress } from "@/lib/constants";
import { nftAbi } from "@/utils/nftAbi";
import { tokenAbi } from "@/utils/tokenAbi";
import { ethers } from "ethers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { mintId,toAddress } = await req.json();
   console.log("----RPC URL")
    try {
      const provider = new ethers.JsonRpcProvider(alysRPCUrl)
      console.log("----RPC response",provider)
      const signer = new ethers.Wallet(privateKey, provider)
      const nonces = await provider.getTransactionCount(signer.address, "pending")
      console.log("----nonces", nonces)
      const contract = new ethers.Contract(nftContractAddress, nftAbi, signer);
      console.log("----contract", contract)
  
      const gasPrice = (await provider.getFeeData()).gasPrice
      console.log("----toAddress", toAddress)
      console.log("----mintId", mintId)

      const gethex = await contract.safeMint.populateTransaction(
        toAddress,
        mintId,
        //appBaseUrl + 'api/metaUri/' + mintId,
        "https://mara-sidechain-tesnet-coordinate.s3.amazonaws.com/nft/" + mintId + ".json",
        {
          gasPrice: gasPrice,
          nonce: nonces
        })
      console.log("gethex ..----------.", gethex)
      const signedTxn = await signer.sendTransaction(gethex);
      console.log("signedTxn ..----------.", signedTxn)

      return NextResponse.json({ status: 200, data: signedTxn, message: null });
    } catch (error) {
        console.log("error ..----------.", error)
      return NextResponse.json({
        status: 500,
        data: null,
        message: error,
      });
    }
  }
  