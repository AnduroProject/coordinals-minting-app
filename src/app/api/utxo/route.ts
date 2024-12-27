import { getUtxos } from "@/utils/libs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("=====utxo api")
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

