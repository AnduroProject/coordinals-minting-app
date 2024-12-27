import { alysRPCUrl, ownerAddress, privateKey } from "@/lib/constants";
import { tokenAbi } from "@/utils/tokenAbi";
import { ethers } from "ethers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { tokenContractAddress, tokenAbi } = await req.json();
    console.log("----RPC tokenContractAddress", tokenContractAddress)
   
    try {
        const provider = new ethers.JsonRpcProvider(alysRPCUrl)
        console.log("----RPC response", provider)
        const signer = new ethers.Wallet(privateKey, provider)
        const nonces = await provider.getTransactionCount(signer.address, "pending")
        console.log("----nonces", nonces)
        const contract = new ethers.Contract(tokenContractAddress, tokenAbi, signer);
        console.log("----contract", contract)

        const balance = await contract.balanceOf(ownerAddress);
        const name = await contract.name();
        const symbol = await contract.symbol();
    

        return NextResponse.json({
            status: 200,  data: {
                balance: balance.toString(), 
                name,
                symbol,
              }, message: null
        });
    } catch (error) {
        console.log("error ..----------.", error)
        return NextResponse.json({
            status: 500,
            data: null,
            message: "Error in fetching data",
        });
    }
}
