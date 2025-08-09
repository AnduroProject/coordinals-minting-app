import { generateRandomString } from '@/utils/calculateSize';
import { NextResponse } from 'next/server';

/**
 * This function is used to set CSRF token in cookie
 */
export async function GET() {
  const token = generateRandomString(32);
  // Set CSRF token as an HTTP-only cookie
  const response = NextResponse.json({ authToken: token });
  response.cookies.set('XSRF-TOKEN', token, { httpOnly: true });
  return response;
}

/**
 * This function is used to remove CSRF token from cookie
 */
export async function POST() {
  const response = NextResponse.json({ message: 'Disconnected successfully' });
  response.cookies.set('XSRF-TOKEN', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
