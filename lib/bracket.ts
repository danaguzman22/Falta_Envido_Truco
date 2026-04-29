import { getBracketRoundLabels, isPowerOfTwo } from "@/config/torneoConfig";
import { createId } from "@/lib/id";
import type { BracketSlot, PartidoBracket, Torneo } from "@/types/tournament";

function createSlot(sourceLabel: string, equipoId: string | null = null): BracketSlot {
  return { sourceLabel, equipoId };
}

function buildSourceLabel(roundIndex: number, matchIndex: number): string {
  if (roundIndex === 0) {
    return "A confirmar";
  }

  const previousRoundMatchIndexA = matchIndex * 2 + 1;
  const previousRoundMatchIndexB = matchIndex * 2 + 2;
  return `Ganador ${previousRoundMatchIndexA} / ${previousRoundMatchIndexB}`;
}

export function createEmptyBracket(totalEquipos: number): Torneo["rondas"] {
  if (!isPowerOfTwo(totalEquipos)) {
    throw new Error("TOTAL_EQUIPOS debe ser una potencia de 2");
  }

  const rounds: Torneo["rondas"] = [];
  const roundLabels = getBracketRoundLabels(totalEquipos);

  roundLabels.forEach((_, roundIndex) => {
    const matchCount = totalEquipos / Math.pow(2, roundIndex + 1);
    const roundMatches: PartidoBracket[] = [];

    for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
      roundMatches.push({
        id: createId("match"),
        rondaIndex: roundIndex,
        partidoIndex: matchIndex,
        slotA: createSlot(buildSourceLabel(roundIndex, matchIndex)),
        slotB: createSlot(buildSourceLabel(roundIndex, matchIndex)),
        ganadorEquipoId: null,
      });
    }

    rounds.push(roundMatches);
  });

  return rounds;
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[randomIndex]] = [cloned[randomIndex] as T, cloned[index] as T];
  }

  return cloned;
}

export function assignTeamsToBracket(totalEquipos: number, approvedTeamIds: string[], currentRounds?: Torneo["rondas"]): Torneo["rondas"] {
  const rounds = currentRounds ? structuredClone(currentRounds) : createEmptyBracket(totalEquipos);
  const shuffledTeamIds = shuffleArray(approvedTeamIds).slice(0, totalEquipos);
  const firstRound = rounds[0];

  if (!firstRound) {
    return rounds;
  }

  firstRound.forEach((match, matchIndex) => {
    const teamA = shuffledTeamIds[matchIndex * 2] ?? null;
    const teamB = shuffledTeamIds[matchIndex * 2 + 1] ?? null;

    match.slotA = { sourceLabel: "Equipo confirmado", equipoId: teamA };
    match.slotB = { sourceLabel: "Equipo confirmado", equipoId: teamB };
  });

  return rounds;
}

export function getRoundLabels(totalEquipos: number): string[] {
  return getBracketRoundLabels(totalEquipos);
}