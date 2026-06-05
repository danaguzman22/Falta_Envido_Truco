import { BracketSection } from "@/components/landing/bracket-section";
import { FooterSection } from "@/components/landing/footer-section";
import { HeroSection } from "@/components/landing/hero-section";
import { InfoSection } from "@/components/landing/info-section";
import { RegistrationSection } from "@/components/landing/registration-section";
import { RulesSection } from "@/components/landing/rules-section";
import { GroupManager } from "@/components/admin/GroupManager";
import { BracketManager } from "@/components/admin/BracketManager";
import { buildBracketPreview, distributeTeamsIntoGroups, getCurrentTorneoFase, getGroupPhaseStage, groupPhaseLimits } from "@/lib/torneoState";
import type { PublicBracketView } from "@/types";

type TournamentViewProps = {
  publicView: PublicBracketView;
};

export function TournamentView({ publicView }: TournamentViewProps) {
  const currentPhase = getCurrentTorneoFase(publicView.torneo);
  const approvedTeams = publicView.equipos.filter((equipo) => equipo.estado === "APROBADO");
  const waitingTeams = publicView.equipos.filter((equipo) => equipo.estado === "PENDIENTE").length;

  switch (currentPhase) {
    case "INSCRIPCION":
      return (
        <main className="min-h-screen bg-tierra-50">
          <HeroSection waitingTeams={waitingTeams} approvedTeams={approvedTeams.length} />
          <InfoSection />
          <RulesSection />
          <div className="h-1 bg-tierra-900" />
          <RegistrationSection torneo={publicView.torneo} />
          <BracketSection torneo={publicView.torneo} equipos={publicView.equipos} />
          <FooterSection />
        </main>
      );

    case "GRUPOS": {
      const stage = getGroupPhaseStage(approvedTeams.length > groupPhaseLimits.FASE_1 ? 10 : 4);
      const groups = distributeTeamsIntoGroups(approvedTeams, stage === "FASE_1" ? groupPhaseLimits.FASE_1 : groupPhaseLimits.FASE_2);

      return (
        <main className="min-h-screen bg-tierra-50">
          <HeroSection waitingTeams={waitingTeams} approvedTeams={approvedTeams.length} />
          <InfoSection />
          <RulesSection />
          <div className="h-1 bg-tierra-900" />
          <section className="px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl space-y-5">
              <GroupManager groups={groups} stage={stage} readOnly />
            </div>
          </section>
          <FooterSection />
        </main>
      );
    }

    case "BRACKET":
    default:
      return (
        <main className="min-h-screen bg-tierra-50">
          <HeroSection waitingTeams={waitingTeams} approvedTeams={approvedTeams.length} />
          <InfoSection />
          <RulesSection />
          <div className="h-1 bg-tierra-900" />
          <section className="px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <BracketManager torneo={publicView.torneo} equipos={publicView.equipos} readOnly />
            </div>
          </section>
          <FooterSection />
        </main>
      );
  }
}