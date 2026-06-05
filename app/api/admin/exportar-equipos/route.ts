import { NextResponse } from "next/server";
import { tournamentRepository } from "@/lib/repository";

export async function GET() {
  try {
    // 1. Obtenemos toda la base de datos a través de tu repositorio
    const db = await tournamentRepository.readDatabase();
    
    // 2. FILTRO ESTRICTO: Solo equipos con estado exactamente igual a "APROBADO"
    const aprobados = db.equipos.filter((e) => e.estado === "APROBADO");

    // 3. Generamos el CSV
    const headers = "Nombre Equipo,Jugador 1,Jugador 2,Jugador 3,WhatsApp,Fecha Aprobación\n";
    
    const rows = aprobados.map((e) => {
      // Obtenemos los nombres de forma segura
      const j1 = e.jugadores[0]?.nombre || "-";
      const j2 = e.jugadores[1]?.nombre || "-";
      const j3 = e.jugadores[2]?.nombre || "-";
      
      // Escapamos comillas en los nombres para que el CSV sea válido
      const safeNombre = e.nombre.replace(/"/g, '""');
      const safeJ1 = j1.replace(/"/g, '""');
      const safeJ2 = j2.replace(/"/g, '""');
      const safeJ3 = j3.replace(/"/g, '""');
      
      return `"${safeNombre}","${safeJ1}","${safeJ2}","${safeJ3}","${e.whatsapp}","${e.aprobadoEn || ''}"`;
    }).join("\n");

    // Agregamos el BOM (\uFEFF) para que Excel detecte bien los acentos
    const csvContent = "\uFEFF" + headers + rows;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=equipos_aprobados.csv",
      },
    });
  } catch (error) {
    console.error("Error al exportar aprobados:", error);
    return NextResponse.json({ message: "Error al exportar los datos" }, { status: 500 });
  }
}