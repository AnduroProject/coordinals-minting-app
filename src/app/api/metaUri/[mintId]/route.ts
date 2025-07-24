import { NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { getFileFromS3 } from '@/lib/service/awshelper';
const fs = require('fs');

export async function GET(
  req: Request,
  { params }: { params: { mintId: string } },
) {
  try {
    const { mintId } = params;

    if (!mintId) {
      return NextResponse.json(
        { error: 'Mint ID is required' },
        { status: 400 },
      );
    }
    // convert the callback-based function to a promise-based function provided by aws-sdk
    const mintData = await getFileFromS3(mintId);
    return NextResponse.json(mintData);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 },
    );
  }
}
