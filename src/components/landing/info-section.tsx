import { Calendar, Clock, MapPin } from "lucide-react";
import { AnimatedSection } from "@/components/ui/animated-section";

/**
 * Sección de información del torneo
 * Muestra detalles como fecha, hora y ubicación
 */
export function InfoSection() {
  return (
    <AnimatedSection delay={0.2}>
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-4xl font-bold text-tierra-900 md:text-5xl">
              Información del Torneo
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-tierra-600">
              Todo lo que necesitas saber para participar en nuestro torneo
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Fecha */}
            <div className="rounded-2xl border-2 border-tierra-200 bg-white p-8 text-center transition hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-oro-100">
                <Calendar className="h-8 w-8 text-oro-600" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-tierra-900">Fecha</h3>
              <p className="font-medium text-tierra-600">Sábado, 20 de Junio de 2026</p>
            </div>

            {/* Hora */}
            <div className="rounded-2xl border-2 border-tierra-200 bg-white p-8 text-center transition hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-oro-100">
                <Clock className="h-8 w-8 text-oro-600" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-tierra-900">Hora</h3>
              <p className="text-tierra-600">15:00 hrs</p>
            </div>

            {/* Ubicación */}
            <div className="group rounded-2xl border-2 border-tierra-200 bg-white p-8 text-center transition hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-oro-100">
                <MapPin className="h-8 w-8 text-oro-600 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold text-tierra-900">Ubicación</h3>
              <a
                href="https://maps.google.com/?q=UTN+FRSR+Av.+Gral.+J.+J.+de+Urquiza+314,+San+Rafael,+Mendoza"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex flex-col items-center gap-1 text-tierra-600 transition-colors hover:text-oro-600"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin size={16} className="text-tierra-900" /> UTN - FRSR
                </span>
                <span className="text-sm">Av. Gral. J. J. de Urquiza 314</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}