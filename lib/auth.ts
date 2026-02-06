import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type UserRole = "admin" | "user";

const SESSION_COOKIE = "churn_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const APP_PASSWORD = process.env.APP_PASSWORD || "changeme";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

export function createSessionValue(role: UserRole): string {
  const payload = `${Date.now()}|${role}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function getRoleFromSessionValue(value: string | undefined): UserRole | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length) {
    return null;
  }
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  const [timestampRaw, roleRaw] = payload.split("|");
  if (!timestampRaw || !roleRaw) return null;
  const timestamp = Number(timestampRaw);
  if (Number.isNaN(timestamp)) return null;
  const ageSeconds = (Date.now() - timestamp) / 1000;
  if (ageSeconds >= SESSION_MAX_AGE) return null;
  if (roleRaw !== "admin" && roleRaw !== "user") return null;
  return roleRaw;
}

export function verifySessionValue(value: string | undefined): boolean {
  return getRoleFromSessionValue(value) !== null;
}

export function passwordMatches(input: string): UserRole | null {
  if (ADMIN_PASSWORD && input.length === ADMIN_PASSWORD.length) {
    if (crypto.timingSafeEqual(Buffer.from(input), Buffer.from(ADMIN_PASSWORD))) {
      return "admin";
    }
  }
  if (input.length !== APP_PASSWORD.length) {
    return null;
  }
  if (crypto.timingSafeEqual(Buffer.from(input), Buffer.from(APP_PASSWORD))) {
    return "user";
  }
  return null;
}

export function getSessionMaxAge(): number {
  return SESSION_MAX_AGE;
}

export function getSessionRole(): UserRole | null {
  const session = cookies().get(getSessionCookieName())?.value;
  return getRoleFromSessionValue(session);
}

export function requireSession(): UserRole {
  const role = getSessionRole();
  if (!role) {
    redirect("/login");
  }
  return role;
}

export function requireAdmin(): UserRole {
  const role = requireSession();
  if (role !== "admin") {
    redirect("/");
  }
  return role;
}
