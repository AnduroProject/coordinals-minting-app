import {
  alysRPCUrl,
  nftContractAddress,
  privateKey,
  tokenContractAddress,
} from '@/lib/constants';
import { nftAbi } from '@/utils/nftAbi';
import { tokenAbi } from '@/utils/tokenAbi';
import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { mintId, toAddress } = await req.json();
  try {
    const provider = new ethers.JsonRpcProvider(alysRPCUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const nonces = await provider.getTransactionCount(
      signer.address,
      'pending',
    );
    const contract = new ethers.Contract(nftContractAddress, nftAbi, signer);

    const gasPrice = (await provider.getFeeData()).gasPrice;
    const gethex = await contract.safeMint.populateTransaction(
      toAddress,
      mintId,
      //appBaseUrl + 'api/metaUri/' + mintId,
      'https://maratech-sidechain-testnet-coordinate.s3.amazonaws.com/nft/' +
        mintId +
        '.json',

      {
        gasPrice: gasPrice,
        nonce: nonces,
      },
    );
    const signedTxn = await signer.sendTransaction(gethex);

    return NextResponse.json({ status: 200, data: signedTxn, message: null });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      data: null,
      message: error,
    });
  }
}
