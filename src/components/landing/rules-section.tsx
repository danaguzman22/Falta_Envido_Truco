import { AnimatedSection } from "@/components/ui/animated-section";

const rules = [
  "Cada equipo esta compuesto por dos jugadores.",
  "El pago debe ser confirmado por administracion antes de entrar al cuadro.",
  "La generacion del torneo se realiza solo cuando se alcanza el cupo total aprobado.",
  "El cuadro se actualiza con el mismo modelo de datos que luego se puede conectar a Prisma.",
];

/**
 * Sección de reglamento del torneo
 * Muestra las reglas y bases de participación
 */
export function RulesSection() {
  return (
    <AnimatedSection delay={0.4}>
      <section className="px-4 py-16 md:py-24 bg-tierra-50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-tierra-900 mb-4">
              Reglamento
            </h2>
            <p className="text-tierra-600 text-lg max-w-2xl mx-auto">
              Condiciones para participar en el torneo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="rounded-xl border-l-4 border-oro-500 bg-white px-6 py-4 shadow-sm hover:shadow-md transition"
              >
                <p className="text-tierra-700">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
