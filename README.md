# Lynx — Núcleo Inteligente

Visualización interactiva a pantalla completa: el logo de Lynx en el centro,
12 iconos de industrias distribuidos en círculo y un mapa de calor orgánico
(generado por código, sin video ni GIF) que se expande desde el núcleo.

## Stack

Next.js 15 (App Router) · React 18 · TypeScript · TailwindCSS · Framer Motion
· Canvas 2D (mapa de calor procedural con ruido tipo Perlin, sin dependencias
externas de shaders).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Deploy en Vercel

```bash
npm install -g vercel   # si no lo tienes
vercel
```

O conecta el repo directamente desde el dashboard de Vercel — no requiere
configuración adicional, es un proyecto Next.js estándar.

## Estructura

```
app/
  page.tsx          -> monta <AnimationController />
  layout.tsx / globals.css
components/
  AnimationController.tsx  -> máquina de estados de las 3 etapas y timing
  Heatmap.tsx               -> composición visual (capas)
  CenterLogo.tsx            -> logo Lynx, fade + scale inicial
  IndustryIcons.tsx         -> 12 iconos en círculo, glass + glow turquesa
  HeatField.tsx             -> mapa de calor procedural en Canvas 2D
lib/
  industries.ts     -> datos de las 12 industrias (ángulo, prioridad)
  icons.tsx         -> set de iconos outline (SVG a mano, sin librería)
  noise.ts          -> ruido 2D tipo Perlin + fbm, sin dependencias
```

## Ajustar el timing

Todas las constantes de tiempo (duración del logo, cadencia de iconos,
duración de expansión) están al inicio de `AnimationController.tsx`.

## Ajustar el rendimiento del heatmap

`HeatField.tsx` simula el campo en una grilla de baja resolución
(`gridSize`, por defecto 72×72) y la escala vía CSS + `blur()` — así el
costo por frame es bajo incluso en equipos de gama media. Si el equipo es
muy potente y quieres más detalle, sube `gridSize` (ej. 96); si necesitas
más rendimiento, bájalo (ej. 56).

## Sectores prioritarios

`Artificial Intelligence`, `Sustainability` y `Digital Twins` están
marcados como `priority: true` en `lib/industries.ts` — reciben mayor
intensidad (más rojo, más brillo) a medida que el campo madura. Para
cambiar qué industrias son prioritarias, edita ese archivo.
