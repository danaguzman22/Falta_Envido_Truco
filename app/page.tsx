import { BracketSection } from "@/components/landing/bracket-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { InfoSection } from "@/components/landing/info-section";
import { RegistrationSection } from "@/components/landing/registration-section";
import { RulesSection } from "@/components/landing/rules-section";
import { tournamentRepository } from "@/lib/repository";

// Función auxiliar para identificar el tipo de equipo (la misma que usamos en el admin)
function getTeamType(team: any) {
  return team.tipoEquipo ?? (team.jugadores.length >= 3 ? "EQUIPO_3" : "PAREJA");
}

export default async function Home() {
  const publicView = await tournamentRepository.getPublicBracketView();

  // 1. Calculamos los aprobados por categoría para el Hero
  const approvedPairs = publicView.equipos.filter(
    (e) => e.estado === "APROBADO" && getTeamType(e) === "PAREJA"
  ).length;

  const approvedTrios = publicView.equipos.filter(
    (e) => e.estado === "APROBADO" && getTeamType(e) === "EQUIPO_3"
  ).length;

  // 2. El total general de inscriptos
  const totalTeamsCount = publicView.equipos.length;

  return (
    <main className="min-h-screen bg-tierra-50">
      <HeroSection
        approvedPairs={approvedPairs}
        approvedTrios={approvedTrios}
        totalTeams={totalTeamsCount}
      />
      <InfoSection />
      <RulesSection />
      <div className="h-1 bg-tierra-900" />
      <RegistrationSection torneo={publicView.torneo} />
      <BracketSection torneo={publicView.torneo} equipos={publicView.equipos} />
      <FooterSection />
    </main>
  );
}