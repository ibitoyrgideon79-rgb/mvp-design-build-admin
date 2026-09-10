import { NextResponse } from "next/server";
import { listStaff, onboardStaff } from "@/lib/staffStore";

const REQUIRED_FIELDS = ["fullName", "email", "role", "department", "startDate", "employmentType"];

export async function GET() {
  const staff = await listStaff();
  return NextResponse.json({ staff });
}

export async function POST(request) {
  const body = await request.json();

  const missing = REQUIRED_FIELDS.filter((field) => !body[field]?.trim());
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const record = await onboardStaff(body);
  return NextResponse.json({ staff: record }, { status: 201 });
}
