# Depth Scroll Experiment

A React and Three.js prototype for a site that scrolls into the page instead of only down it. Normal document scroll drives the camera through a sequence of page-like planes arranged along the Z axis, producing a Prezi-adjacent depth transition while still deploying as a static GitHub Pages site.

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
