# Depth Scroll Experiment

A React and Three.js prototype for a site that scrolls into the page instead of only down it. Normal document scroll drives the camera through a sequence of page-like planes arranged along the Z axis, producing a Prezi-adjacent depth transition while still deploying as a static GitHub Pages site.

## Spatial Model

- The main path is scroll-driven and follows the chapter stack in depth.
- Each chapter has an inner room that can be opened from the readout or depth map.
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
