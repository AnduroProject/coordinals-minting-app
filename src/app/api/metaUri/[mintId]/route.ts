import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import { getFileFromS3 } from "@/lib/service/awshelper"
const fs = require("fs")
var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY,
  region:  process.env.AWS_REGION,
})  
const s3 = new AWS.S3()


export async function GET(
  req: Request,
  { params }: { params: { mintId: string } }
) {
  try {

    const { mintId } = params;

    console.log("inside metauri post mintId",mintId)
    if (!mintId) {
      return NextApiResponse.json({ error: "Mint ID is required" }, { status: 400 });    
    } 
    // convert the callback-based function to a promise-based function provided by aws-sdk
    const mintData = await getFileFromS3(mintId)  
    return NextResponse.json(mintData);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}


