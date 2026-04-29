import type { AppDatabase, Equipo, PublicBracketView, RegistrationInput, Torneo, TorneoEstado } from "@/types/tournament";

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