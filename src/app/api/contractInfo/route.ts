import { alysRPCUrl, ownerAddress, privateKey } from '@/lib/constants';
import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

/**
 * This function is used to get the contract details
 * @param req- req
 */
export async function POST(req: Request) {
  const { tokenContractAddress, tokenAbi } = await req.json();

  try {
    const provider = new ethers.JsonRpcProvider(alysRPCUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(
      tokenContractAddress,
      tokenAbi,
      signer,
    );

    const balance = await contract.balanceOf(ownerAddress);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();

    return NextResponse.json({
      status: 200,
      data: {
        balance: balance.toString(),
        name,
        symbol,
        decimals: decimals.toString(),
      },
      message: null,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      data: null,
      message: 'Error in fetching data',
    });
  }
}
