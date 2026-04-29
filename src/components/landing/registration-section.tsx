import { AnimatedSection } from "@/components/ui/animated-section";
import { RegistrationForm } from "@/components/features/registration-form";
import type { Torneo } from "@/types";

interface RegistrationSectionProps {
  torneo: Torneo;
}

/**
 * Sección de registro de equipos
 * Contiene el formulario de inscripción y estado del torneo
 */
export function RegistrationSection({ torneo }: RegistrationSectionProps) {
  const isOpen = torneo.estado === "INSCRIPCION_ABIERTA";

  return (
    <AnimatedSection delay={0.6}>
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Formulario */}
            <div className="lg:col-span-2">
              <RegistrationForm isOpen={isOpen} />
            </div>

            {/* Estado del Torneo */}
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-tierra-200 bg-white p-6">
                <h3 className="text-lg font-serif font-bold text-tierra-900 mb-4">Estado Actual</h3>

                <div className="space-y-4">
                  <div className="rounded-xl bg-tierra-50 p-4">
                    <p className="text-sm uppercase tracking-widest text-tierra-600 font-semibold">
                      Status del Torneo
                    </p>
                    <p className="text-lg font-bold text-tierra-900 mt-2">
                      {torneo.estado === "INSCRIPCION_ABIERTA" && "🔓 Abierto"}
                      {torneo.estado === "TORNEO_EN_CURSO" && "⚔️ En Curso"}
                      {torneo.estado === "FINALIZADO" && "✓ Finalizado"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-oro-50 p-4">
                    <p className="text-sm uppercase tracking-widest text-oro-600 font-semibold">
                      Nombre
                    </p>
                    <p className="text-lg font-bold text-tierra-900 mt-2">{torneo.nombre}</p>
                  </div>

                  <div className="rounded-xl bg-tierra-50 p-4">
                    <p className="text-sm uppercase tracking-widest text-tierra-600 font-semibold">
                      Total de Rondas
                    </p>
                    <p className="text-lg font-bold text-tierra-900 mt-2">{torneo.rondas.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
