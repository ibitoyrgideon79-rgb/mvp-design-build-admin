import { NextResponse } from "next/server";
import { setStaffStatus } from "@/lib/staffStore";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { enabled, idLost, performedBy } = await request.json();

  const record = await setStaffStatus(id, { enabled, idLost }, performedBy);
  if (!record) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }
  return NextResponse.json({ staff: record });
}
