import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * This function is act as middleware for the application
 * @param request -request
 */

export function middleware(request: NextRequest) {
  // Extract CSRF token from the cookie
  const userToken = request.cookies.get('XSRF-TOKEN')?.value;

  // Check if the token is missing
  if (!userToken || userToken === undefined) {
    return NextResponse.json(
      { error: 'Authorization failed' },
      { status: 403 },
    );
  }
  // Proceed with the request if the CSRF token is valid
  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: [
    '/api/utxo',
    '/api/alysNftMint',
    '/api/alysTokenTransfer',
    '/api/blockHash',
    '/api/contractInfo',
    '/api/metaData',
    '/api/tokenId',
  ],
};
