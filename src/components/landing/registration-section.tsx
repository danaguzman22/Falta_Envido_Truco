import { AnimatedSection } from "@/components/ui/animated-section";
import { RegistrationForm } from "@/components/features/registration-form";
import type { Torneo } from "@/types";
import { MessageCircle } from "lucide-react";

interface RegistrationSectionProps {
  torneo: Torneo;
}

export function RegistrationSection({ torneo }: RegistrationSectionProps) {
  const isOpen = torneo.estado === "INSCRIPCION_ABIERTA";

  // 1. Llamamos a la variable de entorno (Asegurate que empiece con NEXT_PUBLIC_)
  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  
  // 2. Definimos el mensaje y lo preparamos para la URL
  const message = "Hola! Soy [Ingresar nombre]. Queria consultarte acerca de: ";
  const encodedMessage = encodeURIComponent(message);

  return (
    <AnimatedSection delay={0.6}>
      <section id="inscripcion" className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Formulario */}
            <div className="lg:col-span-2">
              <RegistrationForm isOpen={isOpen} />
            </div>

            {/* Columna Lateral (Sidebar) */}
            <div className="space-y-6">
              {/* Estado del Torneo */}
              <div className="rounded-2xl border-2 border-tierra-200 bg-white p-6 shadow-sm">
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

              {/* CUADRO DE CONSULTAS DINÁMICO */}
              <div className="rounded-2xl border-2 border-tierra-200 bg-white p-6 shadow-lg">
                <h3 className="text-lg font-serif font-bold text-tierra-900 mb-2">¿Tenés dudas?</h3>
                <p className="text-tierra-600 text-sm mb-6 leading-relaxed">
                  Si necesitás ayuda con la inscripción o tenés alguna consulta, escribinos directamente.
                </p>
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 border-1.5 border-tierra-900/10 bg-tierra-50/50 hover:bg-tierra-100 hover:border-tierra-900/20 text-tierra-900 font-bold rounded-xl transition-all shadow-sm active:scale-95 group"
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform" />
                  <span className="text-tierra-800">Comunicate con nosotros</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}