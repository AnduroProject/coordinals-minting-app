import { getUtxos } from '@/utils/libs';
import { NextResponse } from 'next/server';

/**
 * This function is used to get  unspents for the transaction
 * @param req -req
 */
export async function POST(req: Request) {
  const { address } = await req.json();
  try {
    const response = await getUtxos(address);
    return NextResponse.json({ status: true, data: response, message: null });
  } catch (error) {
    return NextResponse.json({
      status: false,
      data: null,
      message: error,
    });
  }
}
