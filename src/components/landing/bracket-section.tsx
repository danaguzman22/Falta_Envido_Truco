import { AnimatedSection } from "@/components/ui/animated-section";
import { BracketBoard } from "@/components/features/bracket-board";
import type { PublicBracketView } from "@/types";

interface BracketSectionProps extends PublicBracketView {}

/**
 * Sección del bracket/cuadro del torneo
 * Visualiza todos los partidos y rondas del torneo
 */
export function BracketSection({ torneo, equipos }: BracketSectionProps) {
  return (
    <AnimatedSection delay={0.8}>
      {/* Agregamos el id="cuadro" aquí */}
      <section id="bracket" className="px-4 py-16 md:py-24 bg-tierra-50">
        <div className="mx-auto max-w-full">
          <BracketBoard torneo={torneo} equipos={equipos} title="Cuadro Eliminatorio" />
        </div>
      </section>
    </AnimatedSection>
  );
}