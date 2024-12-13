import { Client } from 'pg';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("====process.env.DATABASE_URL",process.env.DATABASE_URL)

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();  
    const result = await client.query('SELECT * FROM token_data ORDER BY token_id DESC LIMIT 1');
    console.log("result.rows",result.rows)
    return NextResponse.json({data: result.rows }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Database connection failed', details: error.message  }, { status: 500 });

  } finally {
    await client.end(); 
  }
}

export async function POST(req: Request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  const { tokenId ,metaData} = await req.json();
  console.log("====handler post2222",tokenId ,metaData)

  // Ensure the required fields are present in the request body
  if (!tokenId || !metaData) {
    return NextResponse.json({ error: 'TokenId and metadata are required' }, { status: 200 });
  }

  try {
    await client.connect();  // Try to connect to the database
    await client.query('INSERT INTO token_data (token_id, metadata) VALUES ($1, $2)', [tokenId, metaData]);
     return NextResponse.json({ message: 'User created successfully' },{status:201});
  } catch (error: any) {
    return NextResponse.json({ error: 'Database connection failed', details: error.message },
    {status: 500});
  } finally {
    await client.end();  // Always close the connection
  }
}