import { NextResponse } from "next/server";

import { buildOrganizationWhatsappUrl } from "@/lib/whatsapp";
import { registrationSchema } from "@/lib/validation";
import { tournamentRepository } from "@/lib/repository";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const payload = registrationSchema.parse(rawBody);

    const team = await tournamentRepository.createRegistration(payload);
    const whatsappUrl = buildOrganizationWhatsappUrl({
      nombreEquipo: team.nombre,
      jugador1: team.jugadores[0].nombre,
      jugador2: team.jugadores[1].nombre,
      jugador3: team.jugadores[2].nombre,
      whatsapp: team.whatsapp,
    });

    return NextResponse.json({ message: "Equipo registrado correctamente", team, whatsappUrl }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo registrar el equipo";
    return NextResponse.json({ message }, { status: 400 });
  }
}