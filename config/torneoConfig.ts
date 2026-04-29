const BASE_TOTAL_EQUIPOS = 32;

export const TOTAL_EQUIPOS = BASE_TOTAL_EQUIPOS;
export const NOMBRE_TORNEO = "Falta Envido y Truco";
export const NOMBRE_UNIVERSIDAD = "UTN-FRSR";
export const NOMBRE_TORNEO_CORTO = "Falta Envido y Truco - UTN";
export const ORGANIZATION_WHATSAPP_NUMBER = "5492604417975";

export function isPowerOfTwo(value: number): boolean {
  return value > 1 && (value & (value - 1)) === 0;
}

export function getBracketRoundLabels(totalEquipos: number): string[] {
  if (!isPowerOfTwo(totalEquipos)) {
    throw new Error("TOTAL_EQUIPOS debe ser una potencia de 2");
  }

  const labels: string[] = [];
  let equiposEnRonda = totalEquipos;

  while (equiposEnRonda >= 2) {
    if (equiposEnRonda === 32) {
      labels.push("Dieciseisavos");
    } else if (equiposEnRonda === 16) {
      labels.push("Octavos");
    } else if (equiposEnRonda === 8) {
      labels.push("Cuartos");
    } else if (equiposEnRonda === 4) {
      labels.push("Semis");
    } else if (equiposEnRonda === 2) {
      labels.push("Final");
    } else {
      labels.push(`Ronda ${labels.length + 1}`);
    }

    equiposEnRonda = equiposEnRonda / 2;
  }

  return labels;
}

export function getRequiredApprovedTeams(): number {
  return TOTAL_EQUIPOS;
}