import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "utn_admin_session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminEmail = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return adminEmail !== undefined && adminEmail.length > 0;
}

export async function getAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;
}