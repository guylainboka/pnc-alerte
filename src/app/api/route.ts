import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "PNC Alerte API",
    version: "1.0.0",
    status: "active"
  });
}
