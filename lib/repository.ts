import { createClient } from '@supabase/supabase-js';
import { TOTAL_EQUIPOS } from "@/config/torneoConfig";
import { createEmptyBracket, assignTeamsToBracket } from "@/lib/bracket";
import { createId } from "@/lib/id";
import { sanitizeWhatsappForStorage } from "@/lib/whatsapp";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { 
  Admin, AppDatabase, Equipo, PublicBracketView, 
  RegistrationInput, Torneo, TorneoEstado 
} from "@/types/tournament";

// 1. Definición de la Interfaz (Contrato)
export interface TournamentRepository {
  readDatabase(): Promise<AppDatabase>;
  writeDatabase(database: AppDatabase): Promise<void>;
  createRegistration(input: RegistrationInput): Promise<Equipo>; 
  approveTeam(teamId: string): Promise<Equipo>;
  updateTournamentSettings(input: { totalTeams: number; estado: TorneoEstado }): Promise<Torneo>;
  updateTeam(teamId: string, input: RegistrationInput): Promise<Equipo>; 
  deleteTeam(teamId: string): Promise<void>;
  generateTournament(): Promise<Torneo>;
  getPublicBracketView(): Promise<PublicBracketView>;
}

// 2. Configuración de Conexión a Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function fetchFullDatabase(): Promise<AppDatabase> {
  const [
    { data: equiposRaw },
    { data: torneoRaw },
    { data: adminsRaw }
  ] = await Promise.all([
    supabase.from('equipos').select('*').order('creado_en', { ascending: false }),
    supabase.from('torneo').select('*').eq('id', 'torneo-utn-2026').single(),
    supabase.from('admins').select('*')
  ]);

  const equipos: Equipo[] = (equiposRaw || []).map(e => ({
    id: e.id,
    nombre: e.nombre,
    // Eliminado: tipoEquipo: e.tipo_equipo
    jugadores: e.jugadores,
    whatsapp: e.whatsapp,
    estado: e.estado,
    creadoEn: e.creado_en,
    aprobadoEn: e.aprobado_en
  }));

  const admins: Admin[] = (adminsRaw || []).map(a => ({
    email: a.email,
    passwordHash: a.password_hash,
    status: a.status,
    creadoEn: a.creado_en,
    ultimoIngresoEn: a.ultimo_ingreso_en
  }));

  const torneo: Torneo = torneoRaw ? {
    id: torneoRaw.id,
    nombre: torneoRaw.nombre,
    totalEquipos: torneoRaw.total_equipos,
    estado: torneoRaw.estado,
    rondas: torneoRaw.rondas,
    generadoEn: torneoRaw.generado_en
  } : createDefaultTournament();

  return { equipos, torneo, admins };
}

// 3. Implementación del Repositorio
export const tournamentRepository: TournamentRepository = {
  async readDatabase(): Promise<AppDatabase> {
    return await fetchFullDatabase();
  },

  async writeDatabase(database: AppDatabase): Promise<void> {
    const { error } = await supabase
      .from('torneo')
      .upsert({
        id: database.torneo.id,
        nombre: database.torneo.nombre,
        total_equipos: database.torneo.totalEquipos,
        estado: database.torneo.estado,
        rondas: database.torneo.rondas,
        generado_en: database.torneo.generadoEn
      });
    if (error) throw error;
  },

  async createRegistration(input: RegistrationInput): Promise<Equipo> {
    const db = await this.readDatabase();
    if (db.torneo.estado !== "INSCRIPCION_ABIERTA") throw new Error("Inscripciones cerradas");

    const newEquipoSQL = {
      id: createId("team"),
      nombre: input.nombreEquipo.trim(),
      tipo_equipo: "EQUIPO_3", // Se mantiene en SQL por si la columna es obligatoria en Supabase
      jugadores: [
        { id: createId("player"), nombre: input.jugador1.trim() },
        { id: createId("player"), nombre: input.jugador2.trim() },
        { id: createId("player"), nombre: input.jugador3?.trim() || "" }, 
      ],
      whatsapp: sanitizeWhatsappForStorage(input.whatsapp),
      estado: "PENDIENTE",
      creado_en: new Date().toISOString()
    };

    const { error } = await supabase.from('equipos').insert([newEquipoSQL]);
    if (error) throw error;

    return {
      id: newEquipoSQL.id,
      nombre: newEquipoSQL.nombre,
      // Eliminado: tipoEquipo
      jugadores: newEquipoSQL.jugadores,
      whatsapp: newEquipoSQL.whatsapp,
      estado: newEquipoSQL.estado as any,
      creadoEn: newEquipoSQL.creado_en,
      aprobadoEn: null
    };
  },

  async approveTeam(teamId: string): Promise<Equipo> {
    const { data, error } = await supabase
      .from('equipos')
      .update({ 
        estado: "APROBADO", 
        aprobado_en: new Date().toISOString() 
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return {
        id: data.id,
        nombre: data.nombre,
        // Eliminado: tipoEquipo
        jugadores: data.jugadores,
        whatsapp: data.whatsapp,
        estado: data.estado,
        creadoEn: data.creado_en,
        aprobadoEn: data.aprobado_en
    };
  },

  async updateTeam(teamId: string, input: RegistrationInput): Promise<Equipo> {
    const { data, error } = await supabase
      .from('equipos')
      .update({
        nombre: input.nombreEquipo.trim(),
        tipo_equipo: "EQUIPO_3", // Se mantiene en SQL
        jugadores: [
          { id: createId("player"), nombre: input.jugador1.trim() },
          { id: createId("player"), nombre: input.jugador2.trim() },
          { id: createId("player"), nombre: input.jugador3?.trim() || "" },
        ],
        whatsapp: sanitizeWhatsappForStorage(input.whatsapp),
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      nombre: data.nombre,
      // Eliminado: tipoEquipo
      jugadores: data.jugadores,
      whatsapp: data.whatsapp,
      estado: data.estado,
      creadoEn: data.creado_en,
      aprobadoEn: data.aprobado_en
    };
  },

  async deleteTeam(teamId: string): Promise<void> {
    const { error } = await supabase.from('equipos').delete().eq('id', teamId);
    if (error) throw error;
  },

  async updateTournamentSettings(input: { totalTeams: number; estado: TorneoEstado }): Promise<Torneo> {
    const database = await this.readDatabase();
    const updatedTournament: Torneo = {
      ...database.torneo,
      estado: input.estado,
      totalEquipos: 100 // Ajuste dinámico de ser necesario
    };

    await this.writeDatabase({ ...database, torneo: updatedTournament });
    return updatedTournament;
  },

  async generateTournament(): Promise<Torneo> {
    const database = await this.readDatabase();
    const approvedTeams = database.equipos.filter((e) => e.estado === "APROBADO");
    const capacity = database.torneo.totalEquipos;

    if (approvedTeams.length < capacity) {
      throw new Error(`Se necesitan al menos ${capacity} equipos aprobados.`);
    }

    const teamIds = approvedTeams.slice(0, capacity).map(e => e.id);
    const generatedRondas = assignTeamsToBracket(capacity, teamIds, createEmptyBracket(capacity));

    const updatedTournament: Torneo = {
      ...database.torneo,
      estado: "TORNEO_EN_CURSO",
      rondas: generatedRondas,
      generadoEn: new Date().toISOString(),
    };

    await this.writeDatabase({ ...database, torneo: updatedTournament });
    return updatedTournament;
  },

  async getPublicBracketView(): Promise<PublicBracketView> {
    const db = await fetchFullDatabase();
    return { torneo: db.torneo, equipos: db.equipos };
  },
};

export const adminRepository = {
  async findAdminByEmail(email: string): Promise<Admin | null> {
    const { data } = await supabase
      .from('admins')
      .select('*')
      .ilike('email', email)
      .single();
    
    if (!data) return null;
    return {
        email: data.email,
        passwordHash: data.password_hash,
        status: data.status,
        creadoEn: data.creado_en,
        ultimoIngresoEn: data.ultimo_ingreso_en
    };
  },

  async registerAdminWithPassword(email: string, password: string): Promise<Admin> {
    const passwordHash = await hashPassword(password);
    const { data, error } = await supabase
      .from('admins')
      .update({ 
        password_hash: passwordHash, 
        status: "activo" 
      })
      .ilike('email', email)
      .select()
      .single();

    if (error) throw error;
    return {
        email: data.email,
        passwordHash: data.password_hash,
        status: data.status,
        creadoEn: data.creado_en,
        ultimoIngresoEn: data.ultimo_ingreso_en
    } as any;
  },

  async authenticateAdmin(email: string, password: string): Promise<Admin> {
    const admin = await this.findAdminByEmail(email);
    if (!admin || admin.status !== "activo" || !admin.passwordHash) {
      throw new Error("Credenciales inválidas");
    }

    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) throw new Error("Credenciales inválidas");

    return admin;
  },

  async updateLastLogin(email: string): Promise<void> {
    await supabase
      .from('admins')
      .update({ ultimo_ingreso_en: new Date().toISOString() })
      .ilike('email', email);
  },

  async addAdminToWhitelist(email: string): Promise<Admin> {
    const { data, error } = await supabase
      .from('admins')
      .insert([
        { 
          email: email.toLowerCase().trim(), 
          status: 'pendiente',
          creado_en: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return {
      email: data.email,
      passwordHash: data.password_hash,
      status: data.status,
      creadoEn: data.creado_en,
      ultimoIngresoEn: data.ultimo_ingreso_en
    };
  }
};