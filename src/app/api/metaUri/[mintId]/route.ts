import { NextResponse } from 'next/server';
import { getFileFromS3 } from '@/lib/service/awshelper';

/**
 * This function is used to get the metadata for asset
 * @param params- params
 */
export async function GET({ params }: { params: { mintId: string } }) {
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
