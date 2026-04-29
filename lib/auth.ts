import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "utn_admin_session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const adminUser = process.env.ADMIN_USER;

  if (!adminUser) {
    return false;
  }

  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === adminUser;
}

export async function getAdminUserName(): Promise<string | null> {
  const adminUser = process.env.ADMIN_USER;
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;

  if (!adminUser || sessionValue !== adminUser) {
    return null;
  }

  return adminUser;
}