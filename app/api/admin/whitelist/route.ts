import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { adminRepository } from "@/lib/repository";
import { z } from "zod";

const addAdminSchema = z.object({
  email: z.string().trim().email("Email inválido"),
});

export async function POST(request: Request) {
  try {
    // Only authenticated admins can add new admins
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json(
        { message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = addAdminSchema.parse(await request.json());
    const newAdmin = await adminRepository.addAdminToWhitelist(body.email);

    return NextResponse.json(
      { message: "Administrador agregado a la lista blanca", admin: newAdmin },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo agregar el administrador";
    return NextResponse.json({ message }, { status: 400 });
  }
}
