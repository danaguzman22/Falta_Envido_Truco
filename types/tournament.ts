export const teamStatuses = ["PENDIENTE", "APROBADO", "RECHAZADO"] as const;
export type EquipoEstado = (typeof teamStatuses)[number];


export const tournamentStatuses = ["INSCRIPCION_ABIERTA", "TORNEO_EN_CURSO", "FINALIZADO"] as const;
export type TorneoEstado = (typeof tournamentStatuses)[number];

export interface Jugador {
  id: string;
  nombre: string;
}

export interface Equipo {
  id: string;
  nombre: string;
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

export const adminStatuses = ["pendiente", "activo"] as const;
export type AdminStatus = (typeof adminStatuses)[number];

export interface Admin {
  email: string;
  passwordHash: string | null; // null = primer ingreso, no ha creado contraseña
  status: AdminStatus;
  creadoEn: string;
  ultimoIngresoEn: string | null;
}

export interface AppDatabase {
  equipos: Equipo[];
  torneo: Torneo;
  admins: Admin[];
}

export interface RegistrationInput {
  nombreEquipo: string;
  jugador1: string;
  jugador2: string;
  jugador3: string;
  whatsapp: string;
}

export interface PublicBracketView {
  torneo: Torneo;
  equipos: Equipo[];
}