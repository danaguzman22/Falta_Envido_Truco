import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validation";
import { adminRepository } from "@/lib/repository";

export async function POST(request: Request) {
  try {
    const body = adminLoginSchema.parse(await request.json());
    const { email, password } = body;

    // Check if email is in whitelist
    const admin = await adminRepository.findAdminByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { message: "Acceso denegado. No eres un administrador autorizado" },
        { status: 401 }
      );
    }

    // First-time setup: no password hash yet
    if (admin.passwordHash === null) {
      // Register with password
      const registeredAdmin = await adminRepository.registerAdminWithPassword(email, password);
      await adminRepository.updateLastLogin(registeredAdmin.email);

      const response = NextResponse.json({ message: "Cuenta creada y sesión iniciada" });
      response.cookies.set(ADMIN_SESSION_COOKIE, registeredAdmin.email, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });

      return response;
    }

    // Regular login: verify password
    const authenticatedAdmin = await adminRepository.authenticateAdmin(email, password);
    await adminRepository.updateLastLogin(authenticatedAdmin.email);

    const response = NextResponse.json({ message: "Sesión iniciada" });
    response.cookies.set(ADMIN_SESSION_COOKIE, authenticatedAdmin.email, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar sesión";
    return NextResponse.json({ message }, { status: 400 });
  }
}