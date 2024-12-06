import { NextResponse } from "next/server";
import axios from "axios";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
const fs = require("fs")


export async function GET(
  req: Request,
  { params }: { params: { mintId: string } }
) {
  try {

    const { mintId } = params;

    console.log("inside metauri post mintId",mintId)
    if (!mintId) {
      return NextResponse.json({ error: "Mint ID is required" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "data", `${mintId}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Metadata not found" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const metadata = JSON.parse(fileContent);

    return NextResponse.json({ data: metadata }, { status: 200 });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}


