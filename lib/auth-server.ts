import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: {
        cookie: (await import("next/headers")).cookies().toString(),
      },
    });
    return session?.data || null;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/authenticate?mode=login");
  }
  return session;
}
