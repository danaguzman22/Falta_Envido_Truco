import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = adminLoginSchema.parse(await request.json());
    const expectedUser = process.env.ADMIN_USER;
    const expectedPass = process.env.ADMIN_PASS;

    if (!expectedUser || !expectedPass) {
      return NextResponse.json({ message: "Credenciales de admin no configuradas" }, { status: 500 });
    }

    if (body.username !== expectedUser || body.password !== expectedPass) {
      return NextResponse.json({ message: "Credenciales invalidas" }, { status: 401 });
    }

    const response = NextResponse.json({ message: "Sesion iniciada" });
    response.cookies.set(ADMIN_SESSION_COOKIE, expectedUser, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar sesion";
    return NextResponse.json({ message }, { status: 400 });
  }
}