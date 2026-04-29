import { AnimatedSection } from "@/components/ui/animated-section";
import { FileText, Download, CheckCircle2 } from "lucide-react";

/**
 * Sección de reglamento del torneo
 * Ajustada para coincidir con el ancho de la sección de inscripción
 */
export function RulesSection() {
  const rules = [
    "Los equipos pueden ser de 2 o 3 jugadores según la categoría elegida.",
    "El pago debe ser confirmado por administración antes de entrar al cuadro.",
    "La generación del torneo se realiza solo cuando se alcanza el cupo total aprobado.",
  ];

  return (
    <AnimatedSection delay={0.4}>
      <section id="reglamento" className="px-4 py-16 md:py-24 bg-tierra-50">
        {/* Cambiamos max-w-4xl por max-w-6xl para que coincida con el ancho de abajo */}
        <div className="mx-auto max-w-6xl"> 
          
          <div className="rounded-[2rem] border-2 border-tierra-900/10 bg-white p-8 md:p-12 shadow-xl">
            
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-tierra-900 mb-3">
                Reglamento
              </h2>
              <p className="text-tierra-600 text-lg">
                Condiciones para participar en el torneo
              </p>
            </div>

            {/* Agregamos un poco de padding horizontal interno para que el texto no quede pegado a los bordes si es muy ancho */}
            <div className="max-w-4xl mx-auto">
              <ul className="space-y-6">
                {rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-4 text-lg text-tierra-800">
                    <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-oro-500" />
                    <span>{rule}</span>
                  </li>
                ))}

                <li className="pt-8 mt-6 border-t border-tierra-100">
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