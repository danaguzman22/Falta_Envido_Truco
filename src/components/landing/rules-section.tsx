import { AnimatedSection } from "@/components/ui/animated-section";
import { FileText, Download, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * Sección de reglamento del torneo
 * Ajustada para coincidir con el ancho de la sección de inscripción
 */
export function RulesSection() {
  const rules = [
    "Modalidades: Jugamos principalmente en equipos de 3 integrantes, con la dinámica \"Punta y Hacha\" cuando la partida lo requiere.",
    "Juego limpio: Nuestras reglas están pensadas para que todos compitamos en igualdad de condiciones y disfrutemos de cada mano.",
    "Guía de juego: Este reglamento es nuestra hoja de ruta; ante cualquier duda durante la partida, lo consultamos para resolverlo y seguir disfrutando.",
  ];

  return (
    <AnimatedSection delay={0.4}>
      <section id="reglamento" className="bg-tierra-50 px-4 py-16 md:py-24">
        {/* Cambiamos max-w-4xl por max-w-6xl para que coincida con el ancho de abajo */}
        <div className="mx-auto max-w-6xl">
          
          <div className="rounded-[2rem] border-2 border-tierra-900/10 bg-white p-8 shadow-xl md:p-12">
            
            <div className="mb-12 text-center">
              <h2 className="mb-3 font-serif text-4xl font-bold text-tierra-900 md:text-5xl">
                Reglamento
              </h2>
              <p className="text-lg text-tierra-600">
                Condiciones operativas para participar en el torneo
              </p>
            </div>

            {/* Subtítulo alineado a la izquierda */}
            <div className="mx-auto mb-8 max-w-4xl">
              <p className="text-lg font-bold text-tierra-900">
                Lo que necesitás saber antes de empezar:
              </p>
            </div>

            {/* Lista de Reglas y Botón PDF */}
            <div className="mx-auto max-w-4xl">
              <ul className="space-y-6">
                {rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-4 text-lg text-tierra-800">
                    <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-oro-500" />
                    <span>{rule}</span>
                  </li>
                ))}

                {/* Alerta de Descalificación */}
                <li className="mt-8 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <AlertTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-600" />
                  <p className="text-base font-medium text-amber-800">
                    Juego Limpio: Cualquier falta de respeto hacia la organización, los rivales o las instalaciones de la facultad será motivo de descalificación automática del equipo completo, sin derecho a reclamo.
                  </p>
                </li>

                {/* Botón de descarga de PDF */}
                <li className="mt-8 border-t border-tierra-100 pt-8">
                  <a
                    href="/doc/reglas/REGLAMENTOS.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-2xl bg-tierra-900 p-6 text-white transition-all hover:bg-tierra-800 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-oro-500 p-3 text-tierra-900">
                        <FileText size={28} />
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-bold">Reglamento Completo</p>
                        <p className="text-sm text-tierra-400">PDF Oficial · Click para leer y descargar</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-white/10 p-3 transition-transform group-hover:scale-110">
                      <Download size={24} className="text-oro-400" />
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}