import { BracketSection } from "@/components/landing/bracket-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { InfoSection } from "@/components/landing/info-section";
import { RegistrationSection } from "@/components/landing/registration-section";
import { RulesSection } from "@/components/landing/rules-section";
import { tournamentRepository } from "@/lib/repository";

export default async function Home() {
  const publicView = await tournamentRepository.getPublicBracketView();
  return (
    <main className="min-h-screen bg-tierra-50">
      <HeroSection
        approvedTeams={publicView.equipos.filter((equipo) => equipo.estado === "APROBADO").length}
        totalTeams={publicView.equipos.length}
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
