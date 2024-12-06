import { NextResponse } from "next/server";
import path from "path";
const fs = require("fs")


export async function POST(req: Request) {
  try {
    const { jsonData,tokenId } = await req.json();
console.log("====json data",jsonData)
console.log("====json tokenId",tokenId)

    //folder and filename 
    const folderPath = path.join(process.cwd(), "data");
    const filePath = path.join(folderPath, tokenId +".json");

    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    return NextResponse.json({ message: "JSON file saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error writing JSON file:", error);
    return NextResponse.json({ message: "Failed to save JSON file" }, { status: 500 });
  }
}


