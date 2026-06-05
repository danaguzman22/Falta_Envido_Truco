import type { Equipo, PartidoBracket, Torneo } from "@/types/tournament";

export const torneoFases = ["INSCRIPCION", "GRUPOS", "BRACKET"] as const;
export type TorneoFase = (typeof torneoFases)[number];

export const groupPhaseStages = ["FASE_1", "FASE_2"] as const;
export type GroupPhaseStage = (typeof groupPhaseStages)[number];

export const groupPhaseLimits: Record<GroupPhaseStage, number> = {
  FASE_1: 10,
  FASE_2: 4,
};

export type PhaseSnapshot = {
  torneoId: string;
  faseActiva: TorneoFase;
  actualizadoEn: string;
  config: Record<string, unknown>;
};

export type GroupStanding = {
  equipoId: string;
  nombre: string;
  puntos: number;
  partidosJugados: number;
  ganados: number;
  perdidos: number;
  empatados: number;
  diferencia: number;
};

export type GroupBoard = {
  id: string;
  codigo: string;
  nombre: string;
  maxEquipos: number;
  standings: GroupStanding[];
};

export type BracketPreviewMatch = {
  id: string;
  rondaIndex: number;
  partidoIndex: number;
  labelA: string;
  labelB: string;
  equipoAId: string | null;
  equipoBId: string | null;
  winnerEquipoId: string | null;
};

type PhaseSource = Pick<Torneo, "estado"> ;

function isTorneoFase(value: unknown): value is TorneoFase {
  return torneoFases.includes(value as TorneoFase);
}

export function getCurrentTorneoFase(torneo: PhaseSource): TorneoFase {
  // Eliminamos la validación de faseActiva ya que el estado del torneo 
  // ahora se determina exclusivamente por torneo.estado
  
  switch (torneo.estado) {
    case "INSCRIPCION_ABIERTA":
      return "INSCRIPCION";
    case "TORNEO_EN_CURSO":
      return "GRUPOS";
    case "FINALIZADO":
    default:
      return "BRACKET";
  }
}

export function getPhaseLabel(fase: TorneoFase): string {
  switch (fase) {
    case "INSCRIPCION":
      return "Inscripcion";
    case "GRUPOS":
      return "Grupos";
    case "BRACKET":
      return "Bracket";
  }
}

export function getPhaseDescription(fase: TorneoFase): string {
  switch (fase) {
    case "INSCRIPCION":
      return "Alta de equipos abierta y validacion disponible.";
    case "GRUPOS":
      return "Gestión de grupos y puntos con validación manual del admin.";
    case "BRACKET":
      return "Eliminacion directa con cruces y ganadores.";
  }
}

export function getNextTorneoFase(fase: TorneoFase): TorneoFase | null {
  const index = torneoFases.indexOf(fase);
  return torneoFases[index + 1] ?? null;
}

export function canAdvanceTorneoFase(current: TorneoFase, next: TorneoFase | null): boolean {
  if (!next) {
    return false;
  }

  return torneoFases.indexOf(next) === torneoFases.indexOf(current) + 1;
}

export function getGroupPhaseStage(totalGroups: number): GroupPhaseStage {
  return totalGroups > groupPhaseLimits.FASE_2 ? "FASE_1" : "FASE_2";
}

export function getMaxGroupsForStage(stage: GroupPhaseStage): number {
  return groupPhaseLimits[stage];
}

export function distributeTeamsIntoGroups(equipos: readonly Equipo[], groupCount: number): GroupBoard[] {
  const safeGroupCount = Math.max(1, Math.floor(groupCount));
  const sortedTeams = [...equipos].sort((left, right) => left.nombre.localeCompare(right.nombre, "es"));
  const groups: GroupBoard[] = Array.from({ length: safeGroupCount }, (_, index) => {
    const code = String.fromCharCode(65 + index);

    return {
      id: `group-${code}`,
      codigo: code,
      nombre: `Grupo ${code}`,
      maxEquipos: Math.ceil(Math.max(sortedTeams.length, safeGroupCount) / safeGroupCount),
      standings: [],
    };
  });

  sortedTeams.forEach((team, index) => {
    const group = groups[index % safeGroupCount];

    group.standings.push({
      equipoId: team.id,
      nombre: team.nombre,
      puntos: 0,
      partidosJugados: 0,
      ganados: 0,
      perdidos: 0,
      empatados: 0,
      diferencia: 0,
    });
  });

  return groups;
}

export function sortGroupStandings(standings: readonly GroupStanding[]): GroupStanding[] {
  return [...standings].sort((left, right) => {
    if (right.puntos !== left.puntos) {
      return right.puntos - left.puntos;
    }

    if (right.diferencia !== left.diferencia) {
      return right.diferencia - left.diferencia;
    }

    return left.nombre.localeCompare(right.nombre, "es");
  });
}

export function buildBracketPreview(equipos: readonly Equipo[]): BracketPreviewMatch[] {
  const seededTeams = [...equipos].slice(0, 8);
  const pairingMatrix: Array<{
    labelA: string;
    labelB: string;
    indexA: number;
    indexB: number;
  }> = [
    { labelA: "A1", labelB: "C2", indexA: 0, indexB: 5 },
    { labelA: "B1", labelB: "D2", indexA: 1, indexB: 7 },
    { labelA: "C1", labelB: "A2", indexA: 4, indexB: 2 },
    { labelA: "D1", labelB: "B2", indexA: 6, indexB: 3 },
  ];

  return pairingMatrix.map((pairing, index) => ({
    id: `quarterfinal-${index + 1}`,
    rondaIndex: 0,
    partidoIndex: index,
    labelA: pairing.labelA,
    labelB: pairing.labelB,
    equipoAId: seededTeams[pairing.indexA]?.id ?? null,
    equipoBId: seededTeams[pairing.indexB]?.id ?? null,
    winnerEquipoId: null,
  }));
}

export function getBracketRoundTitle(roundIndex: number): string {
  switch (roundIndex) {
    case 0:
      return "Cuartos";
    case 1:
      return "Semis";
    case 2:
      return "Final";
    default:
      return `Ronda ${roundIndex + 1}`;
  }
}

export function flattenBracketMatches(rondas: Torneo["rondas"]): PartidoBracket[] {
  return rondas.flat();
}