import { sendTransactionToRpc } from "@/utils/libs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { transactionHex } = await req.json();

  try {
    const response = await sendTransactionToRpc(transactionHex);
    return NextResponse.json({ status: 200, data: response, message: null });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      data: null,
      message: error,
    });
  }
}
