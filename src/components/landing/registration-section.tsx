import { AnimatedSection } from "@/components/ui/animated-section";
import { RegistrationForm } from "@/components/features/registration-form";
import type { Torneo } from "@/types";
import { MessageCircle } from "lucide-react";

interface RegistrationSectionProps {
  torneo: Torneo;
}

export function RegistrationSection({ torneo }: RegistrationSectionProps) {
  const isOpen = torneo.estado === "INSCRIPCION_ABIERTA";

  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const message = "Hola! Soy [Ingresar nombre]. Quería consultarte acerca de: ";
  const encodedMessage = encodeURIComponent(message);

  return (
    <AnimatedSection delay={0.6}>
      <section id="inscripcion" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-stretch gap-8 lg:grid-cols-3">
            
            {/* COLUMNA IZQUIERDA: Formulario */}
            <div className="lg:col-span-2">
              <RegistrationForm isOpen={isOpen} />
            </div>

            {/* COLUMNA DERECHA: Sidebar ajustado (gap reducido) */}
            <div className="flex h-full flex-col gap-5">
              
              {/* Tarjeta 1: Estado del Torneo (Paddings y textos reducidos) */}
              <div className="flex flex-1 flex-col justify-center rounded-[2rem] border-2 border-tierra-900/10 bg-white p-6 shadow-xl">
                <h3 className="mb-5 font-serif text-xl font-bold text-tierra-900">Estado Actual</h3>
                
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-tierra-500">
                      Status del Torneo
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {torneo.estado === "INSCRIPCION_ABIERTA" && "🔓"}
                        {torneo.estado === "TORNEO_EN_CURSO" && "⚔️"}
                        {torneo.estado === "FINALIZADO" && "✓"}
                      </span>
                      <span className="text-base font-bold text-tierra-900">
                        {torneo.estado === "INSCRIPCION_ABIERTA" && "Abierto"}
                        {torneo.estado === "TORNEO_EN_CURSO" && "En Curso"}
                        {torneo.estado === "FINALIZADO" && "Finalizado"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-tierra-500">
                      Nombre
                    </p>
                    <p className="text-base font-bold text-tierra-900">{torneo.nombre}</p>
                  </div>

                  <div>
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-tierra-500">
                      Modalidad
                    </p>
                    <p className="text-base font-bold text-tierra-900">Equipos de 3 jugadores</p>
                  </div>
                </div>
              </div>

              {/* Tarjeta Intermedia: Texto punteado (letra más chica) */}
              <div className="rounded-2xl border border-dashed border-tierra-900/30 bg-tierra-900/5 p-4 text-center shadow-sm">
                <p className="text-[13px] font-medium leading-relaxed text-tierra-800">
                  💡 Completá el formulario para pre-inscribir a tu grupo. Los cupos se asignan por orden de llegada y confirmación.
                </p>
              </div>

              {/* Tarjeta 3: Dudas (Paddings y textos reducidos) */}
              <div className="rounded-[2rem] border-2 border-tierra-900/10 bg-white p-6 shadow-xl">
                <h3 className="mb-2 font-serif text-lg font-bold text-tierra-900">¿Tenés dudas?</h3>
                <p className="mb-4 text-[13px] leading-relaxed text-tierra-600">
                  Si necesitás ayuda con la inscripción o tenés alguna consulta, escribinos directamente.
                </p>
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-tierra-100 bg-transparent py-2.5 text-sm font-bold text-tierra-900 shadow-sm transition-all hover:border-oro-500 hover:bg-oro-50 active:scale-95"
                >
                  <MessageCircle className="h-[18px] w-[18px] text-[#25D366] transition-transform group-hover:scale-110" />
                  <span>Comunicate con nosotros</span>
                </a>
              </div>
              
            </div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
