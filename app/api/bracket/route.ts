import { NextResponse } from "next/server";

import { tournamentRepository } from "@/lib/repository";

export async function GET() {
  const publicView = await tournamentRepository.getPublicBracketView();
  return NextResponse.json(publicView);
}