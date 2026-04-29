import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { tournamentRepository } from "@/lib/repository";

interface RouteContext {
  params: Promise<{ teamId: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  try {
    const { teamId } = await params;
    await tournamentRepository.approveTeam(teamId);
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo aprobar el equipo";
    return NextResponse.json({ message }, { status: 400 });
  }
}