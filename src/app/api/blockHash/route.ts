import { getBlockHash } from '@/utils/libs';
import { NextResponse } from 'next/server';

/**
 * This function is used to get the block hash
 * @param req- req
 */
export async function POST(req: Request) {
  const { height } = await req.json();
  try {
    const response = await getBlockHash(height);
    return NextResponse.json({ status: 200, data: response, message: null });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      data: null,
      message: error,
    });
  }
}
