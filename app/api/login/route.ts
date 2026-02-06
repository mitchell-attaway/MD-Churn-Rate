import { NextResponse } from "next/server";
import {
  createSessionValue,
  getSessionCookieName,
  getSessionMaxAge,
  passwordMatches
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";

  const role = passwordMatches(password);
  if (!role) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getSessionCookieName(),
    value: createSessionValue(role),
    httpOnly: true,
    sameSite: "lax",
    maxAge: getSessionMaxAge(),
    path: "/"
  });

  return response;
}
