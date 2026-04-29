import { NOMBRE_TORNEO, NOMBRE_UNIVERSIDAD, ORGANIZATION_WHATSAPP_NUMBER } from "@/config/torneoConfig";
import { MapPin, Mail, MessageCircle, ChevronRight } from "lucide-react";

/**
 * Sección del footer de la página
 * Contiene información de contacto, copyright y navegación con fondo Marrón Oscuro
 */
export function FooterSection() {
  const currentYear = new Date().getFullYear();
  // Usamos el número de la organización para el link de WhatsApp
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ORGANIZATION_WHATSAPP_NUMBER;

  return (
    <footer 
      className="text-white py-12 md:py-16 border-t border-white/5"
      style={{ backgroundColor: "#2D241E" }} // Marrón oscuro rústico
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          
          {/* Acerca del Torneo */}
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-oro-400">
              {NOMBRE_TORNEO}
            </h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Plataforma de inscripción y gestión del torneo de truco de {NOMBRE_UNIVERSIDAD}.
              Un espacio para competir, disfrutar y compartir la tradición del juego más argentino.
            </p>
          </div>

          {/* Contacto con Google Maps */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-4 border-b border-oro-500/30 pb-2 inline-block">
              Contacto
            </h3>
            <ul className="space-y-4 text-stone-300 text-sm mt-4">
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-oro-500" />
                <a href="mailto:info@utn.edu.ar" className="hover:text-oro-400 transition-colors">
                  info@utn.edu.ar
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={18} className="text-oro-500" />
                <a 
                  href={`https://wa.me/${whatsappNumber}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-oro-400 transition-colors font-semibold text-green-500"
                >
                  WhatsApp Organización
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-oro-500 mt-1" />
                {/* HIPERVÍNCULO A GOOGLE MAPS */}
                <a 
                  href="https://maps.app.goo.gl/J1r7CGDdphmuqpXK6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-oro-400 transition-colors leading-relaxed"
                >
                  📍 UTN - FRSR. <br />
                  Av. Gral. J. J. de Urquiza 314
                </a>
              </li>
            </ul>
          </div>

          {/* Navegación Interna */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-4 border-b border-oro-500/30 pb-2 inline-block">
              Navegación
            </h3>
            <ul className="space-y-3 text-stone-300 text-sm mt-4">
              <li>
                <a href="#reglamento" className="hover:text-oro-400 transition-all flex items-center gap-2">
                  <ChevronRight size={14} className="text-oro-500" /> Reglamento
                </a>
              </li>
              <li>
                <a href="#inscripcion" className="hover:text-oro-400 transition-all flex items-center gap-2">
                  <ChevronRight size={14} className="text-oro-500" /> Inscripción
                </a>
              </li>
              <li>
                <a href="#bracket" className="hover:text-oro-400 transition-all flex items-center gap-2">
                  <ChevronRight size={14} className="text-oro-500" /> Cuadro de Torneo
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider Estilizado */}
        <div className="h-px bg-gradient-to-r from-transparent via-oro-500/20 to-transparent my-10" />

        {/* Copyright */}
        <div className="text-center text-stone-500 text-xs tracking-widest uppercase">
          <p>© {currentYear} <span className="text-stone-400">{NOMBRE_TORNEO}</span>. Todos los derechos reservados.</p>
          <p className="mt-3 font-medium">
            Desarrollado para <span className="text-oro-600/80">{NOMBRE_UNIVERSIDAD}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}