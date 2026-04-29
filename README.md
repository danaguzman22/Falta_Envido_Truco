# Falta Envido y Truco - UTN

Plataforma web en Next.js App Router para gestionar inscripcion, aprobacion y generacion del bracket del torneo de truco.

## Stack

- Next.js 16 con App Router
- TypeScript en modo estricto
- Tailwind CSS
- Zod + React Hook Form
- Persistencia JSON local, lista para migrar a Prisma + PostgreSQL

## Variables de entorno

Usa `.env.local` con:

- `ADMIN_USER`
- `ADMIN_PASS`
- `ORGANIZATION_WHATSAPP_NUMBER`

## Flujo principal

- La landing publica permite inscribir equipos con validacion de Zod.
- La API de inscripcion guarda el equipo como `PENDIENTE` y devuelve el enlace de WhatsApp de la organizacion.
- El panel `/admin` inicia sesion con credenciales de entorno, aprueba pagos y genera el torneo cuando hay suficientes equipos aprobados.

## Desarrollo local

1. Ejecuta `npm install` si aun faltan dependencias.
2. Ejecuta `npm run dev`.
3. Abre `http://localhost:3000`.

## Notas tecnicas

- El bracket responde al valor centralizado `TOTAL_EQUIPOS` en `config/torneoConfig.ts`.
- El cuadro se genera en una llave de eliminacion directa y se puede extender para 32 equipos cambiando solo la configuracion y la semilla de datos.
- La autenticacion de admin usa una cookie simple, suficiente para esta version inicial.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
