import { NextResponse } from "next/server";
import { checkCredentials, createSessionToken, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "../../../lib/auth";

export async function POST(request) {
  const { username, password } = await request.json();

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), SESSION_COOKIE_OPTIONS);
  return response;
}
