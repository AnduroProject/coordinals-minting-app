import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import csrf from "csrf";

// const tokens = new csrf();
// const secret = process.env.CSRF_SECRET || tokens.secretSync();


export function middleware(request: NextRequest) {
  console.log("===== MIDDLEWARE");
  console.log("Middleware executed for:", request.url);
  // Extract CSRF token from the cookie
  const userToken = request.cookies.get('XSRF-TOKEN')?.value;

  console.log("++ USER TOKEN:", userToken);

  // Check if the token is missing
  if (!userToken) {
    return NextResponse.json({ error: "Authorization failed" }, { status: 403 });
  }

  // // Verify the CSRF token
  // if (!tokens.verify(secret, userToken)) {
  //   return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  // }

  // Proceed with the request if the CSRF token is valid
  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/api/utxo","/api/alysNftMint","/api/alysTokenTransfer","/api/blockHash",
"/api/contractInfo","/api/metaData","/api/tokenId",],
};
