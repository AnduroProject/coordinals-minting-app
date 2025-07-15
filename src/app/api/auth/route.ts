import { NextResponse } from "next/server";


export async function GET() {
  //const token = tokens.create(secret);
  const token = generateRandomString(32);
  // Set CSRF token as an HTTP-only cookie
  const response = NextResponse.json({ authToken: token });
  response.cookies.set("XSRF-TOKEN", token, { httpOnly: true });

  return response;
}
function generateRandomString(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST() {

  const response = NextResponse.json({ message: "Disconnected successfully" });
  response.cookies.set("XSRF-TOKEN", "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}