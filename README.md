# Depth Scroll Experiment

A React and Three.js prototype for a site that scrolls into the page instead of only down it. Normal document scroll drives the camera through a sequence of page-like planes arranged along the Z axis, producing a Prezi-adjacent depth transition while still deploying as a static GitHub Pages site.

## Spatial Model

- The main path is a straight scroll-driven corridor through top-level software areas.
- Corridor panels are real DOM pages mounted into the 3D scene, so the visible cards and actions are clickable instead of baked into textures.
- Each chapter has a left or right room; entering a room turns the camera sideways instead of zooming deeper.
- Rooms are bounded work surfaces: once inside, the 3D depth stops and the room page scrolls normally.
- Hash routes are shareable: `#signal` opens the corridor at a chapter, and `#signal/room` opens that chapter's room.
- Escape, the close button, or the map's main-path button returns from a room to the corridor.

## Run Locally

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

The build emits relative asset paths, so the `dist` output works from a GitHub Pages subpath.
