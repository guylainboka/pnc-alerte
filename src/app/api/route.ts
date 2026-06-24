import { NextResponse } from "next/server";

// Compatibility with output: "export" (Capacitor static build)
export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return NextResponse.json({ 
    message: "PNC Alerte API",
    version: "2.0.0",
    status: "active",
    backend: "supabase"
  });
}
