import { NextResponse } from 'next/server';
var AWS = require('aws-sdk');
import { uploadToS3 } from '@/lib/service/awshelper';

export async function POST(req: Request) {
  const { jsonData, tokenId } = await req.json();

  try {
    let uploadResponse = await uploadToS3(tokenId, jsonData);
    return NextResponse.json(uploadResponse, { status: 200 });
  } catch (error) {
    console.error('Error writing JSON file:', error);
    return NextResponse.json(error, { status: 500 });
  }
}
