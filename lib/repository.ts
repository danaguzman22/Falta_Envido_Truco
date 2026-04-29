import "server-only";

import fs from "fs/promises";
import path from "path";

import { TOTAL_EQUIPOS } from "@/config/torneoConfig";
import { assignTeamsToBracket, createEmptyBracket } from "@/lib/bracket";
import { createId } from "@/lib/id";
import { sanitizeWhatsappForStorage } from "@/lib/whatsapp";
import type { TournamentRepository } from "@/lib/repo-types";
import type { AppDatabase, Equipo, PublicBracketView, RegistrationInput, Torneo, TorneoEstado } from "@/types/tournament";

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "tournament-db.json");

function createDefaultTournament(): Torneo {
  return {
    id: "torneo-utn-2026",
    nombre: "Falta Envido y Truco",
    totalEquipos: TOTAL_EQUIPOS,
    estado: "INSCRIPCION_ABIERTA",
    rondas: createEmptyBracket(TOTAL_EQUIPOS),
    generadoEn: null,
  };
}

function createDefaultDatabase(): AppDatabase {
  return {
    equipos: [],
    torneo: createDefaultTournament(),
  };
}

function normalizeEquipo(team: Partial<Equipo> & { jugadores?: Array<{ id?: string; nombre?: string }> }): Equipo {
  const normalizedPlayers = Array.isArray(team.jugadores)
    ? team.jugadores
        .slice(0, team.tipoEquipo === "EQUIPO_3" ? 3 : 2)
        .map((player, index) => {
          const normalizedPlayer = player as { id?: string; nombre?: string };

          return {
            id: normalizedPlayer.id ?? createId(`player${index + 1}`),
            nombre: (normalizedPlayer.nombre ?? "").trim(),
          };
        })
    : [];

  return {
    id: team.id ?? createId("team"),
    nombre: (team.nombre ?? "").trim(),
    tipoEquipo: team.tipoEquipo ?? (normalizedPlayers.length >= 3 ? "EQUIPO_3" : "PAREJA"),
    jugadores: normalizedPlayers,
    whatsapp: (team.whatsapp ?? "").trim(),
    estado: team.estado ?? "PENDIENTE",
    creadoEn: team.creadoEn ?? new Date().toISOString(),
    aprobadoEn: team.aprobadoEn ?? null,
  };
}

async function ensureDatabaseFileExists(): Promise<void> {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(databasePath);
  } catch {
    await fs.writeFile(databasePath, `${JSON.stringify(createDefaultDatabase(), null, 2)}\n`, "utf8");
  }
}

async function readRawDatabase(): Promise<AppDatabase> {
  await ensureDatabaseFileExists();
  const fileContents = await fs.readFile(databasePath, "utf8");
  const parsed = JSON.parse(fileContents) as Partial<AppDatabase>;

  return {
    equipos: Array.isArray(parsed.equipos) ? parsed.equipos.map((team) => normalizeEquipo(team)) : [],
    torneo: parsed.torneo ?? createDefaultTournament(),
  };
}

async function persistDatabase(database: AppDatabase): Promise<void> {
  await ensureDatabaseFileExists();
  await fs.writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

function validateTournament(database: AppDatabase): AppDatabase {
  if (!database.torneo.rondas.length) {
    return {
      ...database,
      torneo: {
        ...database.torneo,
        rondas: createEmptyBracket(database.torneo.totalEquipos),
      },
    };
  }

  return database;
}

export const tournamentRepository: TournamentRepository = {
  async readDatabase(): Promise<AppDatabase> {
    const database = await readRawDatabase();
    return validateTournament(database);
  },

  async writeDatabase(database: AppDatabase): Promise<void> {
    await persistDatabase(database);
  },

  async createRegistration(input: RegistrationInput): Promise<Equipo> {
    const database = await this.readDatabase();

    if (database.torneo.estado !== "INSCRIPCION_ABIERTA") {
      throw new Error("Las inscripciones ya estan cerradas");
    }

    const normalizedEquipoName = input.nombreEquipo.trim();
    const duplicateTeam = database.equipos.find((equipo) => equipo.nombre.toLowerCase() === normalizedEquipoName.toLowerCase());

    if (duplicateTeam) {
      throw new Error("Ya existe un equipo con ese nombre");
    }

    const newEquipo: Equipo = {
      id: createId("team"),
      nombre: normalizedEquipoName,
      tipoEquipo: input.tipoEquipo,
      jugadores: [
        { id: createId("player"), nombre: input.jugador1.trim() },
        { id: createId("player"), nombre: input.jugador2.trim() },
        ...(input.tipoEquipo === "EQUIPO_3" && input.jugador3?.trim()
          ? [{ id: createId("player"), nombre: input.jugador3.trim() }]
          : []),
      ],
      whatsapp: sanitizeWhatsappForStorage(input.whatsapp),
      estado: "PENDIENTE",
      creadoEn: new Date().toISOString(),
      aprobadoEn: null,
    };

    const nextDatabase: AppDatabase = {
      ...database,
      equipos: [newEquipo, ...database.equipos],
    };

    await persistDatabase(nextDatabase);
    return newEquipo;
  },

  async approveTeam(teamId: string): Promise<Equipo> {
    const database = await this.readDatabase();
    const targetTeamIndex = database.equipos.findIndex((equipo) => equipo.id === teamId);

    if (targetTeamIndex < 0) {
      throw new Error("Equipo no encontrado");
    }

    const targetTeam = database.equipos[targetTeamIndex];
    const approvedTeam: Equipo = {
      ...targetTeam,
      estado: "APROBADO",
      aprobadoEn: new Date().toISOString(),
    };

    const nextTeams = [...database.equipos];
    nextTeams[targetTeamIndex] = approvedTeam;

    await persistDatabase({
      ...database,
      equipos: nextTeams,
    });

    return approvedTeam;
  },

  async updateTeam(
    teamId: string,
    input: RegistrationInput
  ): Promise<Equipo> {
    const database = await this.readDatabase();
    const targetTeamIndex = database.equipos.findIndex((equipo) => equipo.id === teamId);

    if (targetTeamIndex < 0) {
      throw new Error("Equipo no encontrado");
    }

    const normalizedEquipoName = input.nombreEquipo.trim();
    if (!normalizedEquipoName) {
      throw new Error("El nombre del equipo es obligatorio");
    }

    const duplicateTeam = database.equipos.find(
      (equipo) => equipo.id !== teamId && equipo.nombre.toLowerCase() === normalizedEquipoName.toLowerCase()
    );

    if (duplicateTeam) {
      throw new Error("Ya existe un equipo con ese nombre");
    }

    const targetTeam = database.equipos[targetTeamIndex];
    const updatedTeam: Equipo = {
      ...targetTeam,
      nombre: normalizedEquipoName,
      tipoEquipo: input.tipoEquipo,
      jugadores: [
        { ...targetTeam.jugadores[0], nombre: input.jugador1.trim() },
        { ...targetTeam.jugadores[1], nombre: input.jugador2.trim() },
        ...(input.tipoEquipo === "EQUIPO_3"
          ? [
              {
                id: targetTeam.jugadores[2]?.id ?? createId("player"),
                nombre: input.jugador3?.trim() ?? targetTeam.jugadores[2]?.nombre ?? "",
              },
            ]
          : []),
      ],
      whatsapp: sanitizeWhatsappForStorage(input.whatsapp),
    };

    const nextTeams = [...database.equipos];
    nextTeams[targetTeamIndex] = updatedTeam;

    await persistDatabase({
      ...database,
      equipos: nextTeams,
    });

    return updatedTeam;
  },

  async deleteTeam(teamId: string): Promise<void> {
    const database = await this.readDatabase();

    if (database.torneo.estado !== "INSCRIPCION_ABIERTA") {
      throw new Error("Solo se pueden eliminar equipos con las inscripciones abiertas");
    }

    const nextTeams = database.equipos.filter((equipo) => equipo.id !== teamId);

    if (nextTeams.length === database.equipos.length) {
      throw new Error("Equipo no encontrado");
    }

    await persistDatabase({
      ...database,
      equipos: nextTeams,
    });
  },

  async updateTournamentSettings(input: { totalTeams: number; estado: TorneoEstado }): Promise<Torneo> {
    const database = await this.readDatabase();
    const nextState = input.estado;

    const approvedTeams = database.equipos.filter((equipo) => equipo.estado === "APROBADO");
    const nextCapacity = input.totalTeams;

    if (database.torneo.estado !== "INSCRIPCION_ABIERTA" && nextCapacity !== database.torneo.totalEquipos) {
      throw new Error("El cupo solo se puede modificar con las inscripciones abiertas");
    }

    if (nextState === "INSCRIPCION_ABIERTA") {
      const updatedTournament: Torneo = {
        ...database.torneo,
        totalEquipos: nextCapacity,
        estado: nextState,
        rondas: createEmptyBracket(nextCapacity),
        generadoEn: null,
      };

      await persistDatabase({
        ...database,
        torneo: updatedTournament,
      });

      return updatedTournament;
    }

    if (nextState === "TORNEO_EN_CURSO" && approvedTeams.length < nextCapacity) {
      throw new Error(`Se necesitan al menos ${nextCapacity} equipos aprobados`);
    }

    const approvedTeamIds = approvedTeams.slice(0, nextCapacity).map((equipo) => equipo.id);
    const currentRounds =
      database.torneo.rondas.length > 0 ? database.torneo.rondas : createEmptyBracket(nextCapacity);
    const bracketRounds =
      nextState === "TORNEO_EN_CURSO"
        ? assignTeamsToBracket(nextCapacity, approvedTeamIds, currentRounds)
        : currentRounds;

    if (approvedTeams.length > nextCapacity) {
      throw new Error("No se puede reducir el cupo por debajo de la cantidad de equipos aprobados");
    }

    const updatedTournament: Torneo = {
      ...database.torneo,
      totalEquipos: nextCapacity,
      estado: nextState,
      rondas: bracketRounds,
      generadoEn: nextState === "TORNEO_EN_CURSO" ? new Date().toISOString() : database.torneo.generadoEn,
    };

    await persistDatabase({
      ...database,
      torneo: updatedTournament,
    });

    return updatedTournament;
  },

  async generateTournament(): Promise<Torneo> {
    const database = await this.readDatabase();

    if (database.torneo.estado === "TORNEO_EN_CURSO") {
      throw new Error("El torneo ya fue generado");
    }

    const approvedTeams = database.equipos.filter((equipo) => equipo.estado === "APROBADO");

    if (approvedTeams.length < database.torneo.totalEquipos) {
      throw new Error(`Se necesitan al menos ${database.torneo.totalEquipos} equipos aprobados`);
    }

    const approvedTeamIds = approvedTeams.slice(0, database.torneo.totalEquipos).map((equipo) => equipo.id);
    const bracketRounds = assignTeamsToBracket(database.torneo.totalEquipos, approvedTeamIds, database.torneo.rondas);

    const updatedTournament: Torneo = {
      ...database.torneo,
      estado: "TORNEO_EN_CURSO",
      rondas: bracketRounds,
      generadoEn: new Date().toISOString(),
    };

    await persistDatabase({
      ...database,
      torneo: updatedTournament,
    });

    return updatedTournament;
  },

  async getPublicBracketView(): Promise<PublicBracketView> {
    const database = await this.readDatabase();

    return {
      torneo: database.torneo,
      equipos: database.equipos,
    };
  },
};
