import { NextResponse } from "next/server";
import { getStaff, updateStaff } from "@/lib/staffStore";

const REQUIRED_FIELDS = ["fullName", "email", "role", "department", "startDate", "employmentType"];

export async function GET(request, { params }) {
  const { id } = await params;
  const staff = await getStaff(id);
  if (!staff) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }
  return NextResponse.json({ staff });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const missing = REQUIRED_FIELDS.filter((field) => !body[field]?.trim());
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const record = await updateStaff(id, body);
  if (!record) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }
  return NextResponse.json({ staff: record });
}
