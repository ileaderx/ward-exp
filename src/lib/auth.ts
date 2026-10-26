import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

// Every page and server action calls this; the proxy redirect alone is not a security boundary.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
