import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { tournamentRepository } from "@/lib/repository";
import type { TorneoEstado } from "@/types/tournament";

function parseTotalTeams(value: string | null): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 2) {
    throw new Error("El cupo debe ser un numero entero valido");
  }

  return parsedValue;
}

function parseTournamentState(value: string | null): TorneoEstado {
  if (value === "INSCRIPCION_ABIERTA" || value === "TORNEO_EN_CURSO" || value === "FINALIZADO") {
    return value;
  }

  throw new Error("El estado del torneo no es valido");
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  try {
    const formData = await request.formData();
    const totalTeams = parseTotalTeams(formData.get("totalTeams")?.toString() ?? null);
    const estado = parseTournamentState(formData.get("estado")?.toString() ?? null);

    await tournamentRepository.updateTournamentSettings({ totalTeams, estado });

    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el cupo";
    return NextResponse.json({ message }, { status: 400 });
  }
}