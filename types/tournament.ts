export const teamStatuses = ["PENDIENTE", "APROBADO", "RECHAZADO"] as const;
export type EquipoEstado = (typeof teamStatuses)[number];

export const teamTypes = ["PAREJA", "EQUIPO_3"] as const;
export type EquipoTipo = (typeof teamTypes)[number];

export const tournamentStatuses = ["INSCRIPCION_ABIERTA", "TORNEO_EN_CURSO", "FINALIZADO"] as const;
export type TorneoEstado = (typeof tournamentStatuses)[number];

export interface Jugador {
  id: string;
  nombre: string;
}

export interface Equipo {
  id: string;
  nombre: string;
  tipoEquipo: EquipoTipo;
  jugadores: Jugador[];
  whatsapp: string;
  estado: EquipoEstado;
  creadoEn: string;
  aprobadoEn: string | null;
}

export interface BracketSlot {
  equipoId: string | null;
  sourceLabel: string;
}

export interface PartidoBracket {
  id: string;
  rondaIndex: number;
  partidoIndex: number;
  slotA: BracketSlot;
  slotB: BracketSlot;
  ganadorEquipoId: string | null;
}

export interface Torneo {
  id: string;
  nombre: string;
  totalEquipos: number;
  estado: TorneoEstado;
  rondas: PartidoBracket[][];
  generadoEn: string | null;
}

export interface UsuarioAdmin {
  username: string;
  role: "ADMIN";
}

export interface AppDatabase {
  equipos: Equipo[];
  torneo: Torneo;
}

export interface RegistrationInput {
  nombreEquipo: string;
  tipoEquipo: EquipoTipo;
  jugador1: string;
  jugador2: string;
  jugador3?: string;
  whatsapp: string;
}

export interface PublicBracketView {
  torneo: Torneo;
  equipos: Equipo[];
}