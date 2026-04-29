import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { tournamentRepository } from "@/lib/repository";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  try {
    const publicView = await tournamentRepository.getPublicBracketView();
    const approvedTeams = publicView.equipos.filter((equipo) => equipo.estado === "APROBADO").length;
    const requiredTeams = publicView.torneo.totalEquipos;

    if (approvedTeams < requiredTeams) {
      return NextResponse.json({ message: `Se requieren ${requiredTeams} equipos aprobados` }, { status: 400 });
    }

    await tournamentRepository.generateTournament();
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo generar el torneo";
    return NextResponse.json({ message }, { status: 400 });
  }
}