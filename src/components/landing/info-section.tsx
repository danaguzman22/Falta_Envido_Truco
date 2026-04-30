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
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-tierra-900 mb-4">
              Información del Torneo
            </h2>
            <p className="text-tierra-600 text-lg max-w-2xl mx-auto">
              Todo lo que necesitas saber para participar en nuestro torneo tradicional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Fecha */}
            <div className="rounded-2xl border-2 border-tierra-200 bg-white p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-oro-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-oro-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-tierra-900 mb-2">Fecha</h3>
              <p className="text-tierra-600">Próximamente (Consultar con administración)</p>
            </div>

            {/* Hora */}
            <div className="rounded-2xl border-2 border-tierra-200 bg-white p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-oro-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-oro-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-tierra-900 mb-2">Hora</h3>
              <p className="text-tierra-600">Por confirmar - Dependiendo de inscripciones</p>
            </div>

            {/* Ubicación - EDITADA CON LINK A MAPS */}
            <div className="rounded-2xl border-2 border-tierra-200 bg-white p-8 text-center hover:shadow-lg transition group">
              <div className="w-16 h-16 bg-oro-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-oro-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-serif font-bold text-tierra-900 mb-2">Ubicación</h3>
              <a 
                href="https://maps.app.goo.gl/J1r7CGDdphmuqpXK6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-tierra-600 hover:text-oro-600 transition-colors inline-block"
              >
                📍 UTN - FRSR <br />
                Av. Gral. J. J. de Urquiza 314
              </a>
            </div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}