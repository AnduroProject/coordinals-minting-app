import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const tokenFilePath = path.join(process.cwd(), 'data', 'token.json');

export async function GET(req: Request) {
  try {
    console.log("=======get in tokenID");

    if (!fs.existsSync(tokenFilePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const data = fs.readFileSync(tokenFilePath, "utf-8");
    const jsonData = JSON.parse(data);

    console.log("=====jsonData", jsonData);

    return NextResponse.json({ data: jsonData }, { status: 200 });
  } catch (error: any) {
    console.error('Error reading token file:', error);
    return NextResponse.json({ error: 'Failed to read token file' }, { status: 500 });
  }
}



export async function POST(req: Request) {
  try {
    const { tokenId } = await req.json();
    console.log("====token id to update", tokenId)

    if (!fs.existsSync(tokenFilePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    fs.writeFileSync(tokenFilePath, JSON.stringify({ tokenId }, null, 2));

    return NextResponse.json({ message: "Token id updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error writing JSON file:", error);
    return NextResponse.json({ message: "Failed to update JSON file" }, { status: 500 });
  }
}
