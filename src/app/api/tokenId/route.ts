import { NextResponse } from 'next/server';
import { getFileFromS3 } from '@/lib/service/awshelper';

/**
 * This function is used to get the token id of the asset
 */
export async function GET() {
  try {
    const mintData = await getFileFromS3('token_data');
    return NextResponse.json({ data: mintData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to read token file' },
      { status: 500 },
    );
  }
}
/**
 * This function is used to upload the token id for asset
 * @param req -req
 */
export async function POST(req: Request) {
  const { tokenId } = await req.json();
  try {
    if (!tokenId) {
      return NextResponse.json(
        { error: 'tokenId is required' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: 'Token id updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update token id' },
      { status: 500 },
    );
  }
}
