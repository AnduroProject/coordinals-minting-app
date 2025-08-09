import { alysRPCUrl, privateKey, tokenContractAddress } from '@/lib/constants';
import { tokenAbi } from '@/utils/tokenAbi';
import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

/**
 * This function is used to transfer the alys tokens
 * @param req - req
 */
export async function POST(req: Request) {
  const { toAddress, supply } = await req.json();
  try {
    const provider = new ethers.JsonRpcProvider(alysRPCUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const nonces = await provider.getTransactionCount(
      signer.address,
      'pending',
    );
    const contract = new ethers.Contract(
      tokenContractAddress,
      tokenAbi,
      signer,
    );
    const gasPrice = (await provider.getFeeData()).gasPrice;
    const value = ethers.parseUnits(supply.toString(), 8);
    const gethex = await contract.transfer(toAddress, value, {
      chainId: '727272',
      gasPrice: gasPrice,
      nonce: nonces,
    });
    return NextResponse.json({ status: 200, data: gethex, message: null });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      data: null,
      message: error,
    });
  }
}
