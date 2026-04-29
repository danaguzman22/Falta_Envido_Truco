# Imágenes del Torneo

Esta carpeta está destinada a almacenar las imágenes para la página del torneo.

## Estructura recomendada

```
images/
├── hero/          # Imágenes para la sección hero
├── tournament/    # Imágenes del torneo (cartas, mate, etc.)
├── teams/         # Logos o imágenes de equipos
└── banners/       # Banners y promocionales
```

## Cómo usar las imágenes

Una vez subidas las imágenes a esta carpeta, puedes referenciarte a ellas en el código usando rutas relativas:

```tsx
<img src="/images/hero/tu-imagen.jpg" alt="Descripción" />
```

## Formatos soportados

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- SVG (.svg)

## Notas

- Las imágenes deben estar optimizadas para web
- Considera usar componentes `<Image>` de Next.js para mejor rendimiento
- Mantén un registro de las imágenes y sus ubicaciones en este README
