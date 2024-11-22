import { getBlockHash, wishlist } from "@/utils/libs";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const { params } = await req.json();
    console.log("====POST " ,req)
    console.log("====req bodfy",req.body)


    try {
      const response = await wishlist(params);
      return NextResponse.json({ status: 200, data: response, message: null });
    } catch (error) {
        console.log("====ERROR",error)
      return NextResponse.json({
        status: 500,
        data: null,
        message: error,
      });
    }
  }