import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { tournamentRepository } from "@/lib/repository";
import { registrationSchema } from "@/lib/validation";

interface RouteContext {
  params: Promise<{ teamId: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  try {
    const { teamId } = await params;
    const body = registrationSchema.parse(await request.json());

    const updatedTeam = await tournamentRepository.updateTeam(teamId, body);

    return NextResponse.json({ message: "Equipo actualizado correctamente", team: updatedTeam }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el equipo";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  try {
    const { teamId } = await params;
    await tournamentRepository.deleteTeam(teamId);

    return NextResponse.json({ message: "Equipo eliminado correctamente" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar el equipo";
    return NextResponse.json({ message }, { status: 400 });
  }
}