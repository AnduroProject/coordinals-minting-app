import { fetchTokenInstances } from "@/utils/libs";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
  try {
    // { tokenAddress } = params;

    const { tokenAddress } = await req.json();

    const data = await fetchTokenInstances(tokenAddress);
  if(data.response?.data.message === 'Not found'){
    return NextResponse.json({ data: null }, { status: 200 });
  }else{
    return NextResponse.json({ data }, { status: 200 });
  }
  } catch (error:any) {
    //console.error("Error in API route:", error);
    //return NextResponse.json({ error: "Failed to fetch token instances" }, { status: 500 });
    console.error("Error in POST API:", error);
    
    return NextResponse.json({ error: error },{ status: 500 });
  }
}


