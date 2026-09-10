import { NextResponse } from "next/server";
import { clearActivity, listActivity } from "@/lib/staffStore";

export async function GET() {
  const activity = await listActivity();
  return NextResponse.json({ activity });
}

export async function DELETE() {
  await clearActivity();
  return NextResponse.json({ ok: true });
}
