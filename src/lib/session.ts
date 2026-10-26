import { SignJWT, jwtVerify } from "jose";

// Shared by proxy.ts and server code, so it must stay free of Node-only imports.
export const SESSION_COOKIE = "wardexp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, so the home-screen app stays signed in

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set. Add it to your environment variables.");
  return new TextEncoder().encode(value);
}

export async function signSession(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.email === "string" ? { email: payload.email } : null;
  } catch {
    return null;
  }
}
