import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { InfoSection } from "@/components/landing/info-section";
import { RegistrationSection } from "@/components/landing/registration-section";
import { RulesSection } from "@/components/landing/rules-section";
import { tournamentRepository } from "@/lib/repository";

export const revalidate = 0; 

export default async function Home() {
  const publicView = await tournamentRepository.getPublicBracketView();

  // Calculamos los totales necesarios para el Hero
  const approvedTeams = publicView.equipos.filter((e) => e.estado === "APROBADO").length;
  const waitingTeams = publicView.equipos.filter((e) => e.estado === "PENDIENTE").length;

  return (
    <main className="min-h-screen bg-tierra-50">
      <HeroSection 
        waitingTeams={waitingTeams} 
        approvedTeams={approvedTeams} 
      />
      <InfoSection />
      <RulesSection />
      
      <div className="h-1 bg-tierra-900" />
      
      {/* Mantenemos únicamente el formulario de inscripción pública */}
      <RegistrationSection torneo={publicView.torneo} />
      
      <FooterSection />
    </main>
  );
}