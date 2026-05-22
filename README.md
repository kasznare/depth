# Software Atlas Prototype

A React prototype for visualizing different kinds of software as semantic node graphs. The stable model is now node-first: software types contain child nodes, child nodes can contain deeper layers, and the depth effect renders the current focus path rather than defining the product concept.

## Spatial Model

- Nodes are stable software objects: types, capabilities, runtimes, interfaces, data, flows, and artifacts.
- Focus paths are hash-routeable: `#/agent-system/tool-runtime` opens a specific abstraction layer.
- Selecting a node updates the inspector and current-layer list.
- Focusing a node with children moves into that node's child canvas.
- Escape or Backspace moves up one layer; left and right arrows traverse sibling nodes.
- Different software types use different local graphs: web app, agentic software, distributed system, data platform, game engine, and operating system.

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
