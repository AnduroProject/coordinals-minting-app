import { NextResponse } from "next/server";
var AWS = require('aws-sdk');


import path from "path";
const fs = require("fs")


export async function POST(req: Request) {
  try {
    const { jsonData,tokenId } = await req.json();
    const payload = {
      Bucket: process.env.BUCKET_NAME,
      Key: `nft/${tokenId}.json`,
      Body: JSON.stringify(jsonData),
      ContentType: 'application/json',
    }
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY,
      region:  process.env.AWS_REGION,
    })  
    const s3 = new AWS.S3()
    // convert the callback-based function to a promise-based function provided by aws-sdk
    const uploadPromise = s3.upload(payload).promise()
    // wait for the promise to resolve
    const data = await uploadPromise  
    return NextResponse.json({
      message: 'File uploaded successfully',
      data: {
          fileUrl: data.Location,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error writing JSON file:", error);
    return NextResponse.json({ message: "Failed to save JSON file" }, { status: 500 });
  }
}


