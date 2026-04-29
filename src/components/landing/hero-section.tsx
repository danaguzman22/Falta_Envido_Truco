import Image from "next/image";
import { Calendar, Clock, Users, Trophy } from "lucide-react";
import { NOMBRE_TORNEO, NOMBRE_UNIVERSIDAD } from "@/config/torneoConfig";

interface HeroSectionProps {
  approvedPairs: number; // Equipos de 2 aprobados
  approvedTrios: number; // Equipos de 3 aprobados
  totalTeams: number;    // Total general de inscriptos
}

/**
 * Sección Hero de la página de inicio
 * Muestra el título, descripción y estadísticas separadas por categoría
 */
export function HeroSection({ approvedPairs, approvedTrios, totalTeams }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[600px] w-full items-center overflow-hidden">
      {/* IMAGEN DE FONDO */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/fondo_titulo.png"
          alt="Fondo Torneo de Truco"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col items-center justify-center">
          <div className="text-center text-white">
            <p className="mb-3 text-sm uppercase tracking-widest text-oro-400 font-bold drop-shadow-md">
              Torneo de Truco - UTN FRSR
            </p>

            <h1 className="mb-6 font-serif text-5xl font-bold leading-tight text-white drop-shadow-2xl md:text-6xl lg:text-8xl">
              {NOMBRE_TORNEO}
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-slate-100 font-medium drop-shadow-md md:text-xl">
              Plataforma de inscripción, validación y generación de llave eliminatoria para {NOMBRE_UNIVERSIDAD}. 
              Únete a este torneo tradicional de truco donde la estrategia y el conocimiento se encuentran.
            </p>

            {/* BADGES CENTRALES MODIFICADOS */}
            <div className="flex flex-col items-center justify-center gap-6 pt-6 sm:flex-row">
              <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-oro-400" />
                <span className="font-medium">Próximamente</span>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Users className="w-5 h-5 text-oro-400" />
                <span className="font-medium">Torneo en Parejas</span>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-oro-400" />
                <span className="font-medium">Torneo en Grupo</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS MODIFICADAS POR CATEGORÍA */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Tarjeta 1: Total general */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur-xl transition-transform hover:scale-105">
            <Users className="mb-3 h-8 w-8 text-oro-400" />
            <div className="text-4xl font-bold text-white">{totalTeams}</div>
            <div className="mt-1 text-sm uppercase tracking-wider text-slate-300">Equipos Registrados</div>
          </div>

          {/* Tarjeta 2: Cupo Parejas */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur-xl transition-transform hover:scale-105">
            <Trophy className="mb-3 h-8 w-8 text-oro-400" />
            <div className="text-4xl font-bold text-white">{approvedPairs}/32</div>
            <div className="mt-1 text-sm uppercase tracking-wider text-slate-300">Cupo disponible en parejas</div>
          </div>

          {/* Tarjeta 3: Cupo Equipos de 3 */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur-xl transition-transform hover:scale-105">
            <Clock className="mb-3 h-8 w-8 text-oro-400" />
            <div className="text-4xl font-bold text-white">{approvedTrios}/32</div>
            <div className="mt-1 text-sm uppercase tracking-wider text-slate-300">Cupo disponible en grupos</div>
          </div>
        </div>
      </div>
    </section>
  );
}