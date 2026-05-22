export type NodeKind =
  | "atlas"
  | "software-type"
  | "capability"
  | "runtime"
  | "interface"
  | "data"
  | "flow"
  | "artifact";

export type Metric = {
  label: string;
  value: string;
};

export type SoftwareEdge = {
  from: string;
  to: string;
  label: string;
};

export type SoftwareNode = {
  id: string;
  title: string;
  kind: NodeKind;
  summary: string;
  accent: string;
  status: string;
  metrics: Metric[];
  layout?: {
    x: number;
    y: number;
  };
  children?: SoftwareNode[];
  edges?: SoftwareEdge[];
};

export const softwareAtlas: SoftwareNode = {
  id: "atlas",
  title: "Software Type Atlas",
  kind: "atlas",
  summary:
    "A semantic map for comparing software shapes. Nodes are stable objects; depth is only one way to render abstraction.",
  accent: "#ff6b57",
  status: "Prototype grammar",
  metrics: [
    { label: "Types", value: "6" },
    { label: "Layers", value: "4" },
    { label: "Mode", value: "Node focus" },
  ],
  children: [
    {
      id: "web-app",
      title: "Product Web App",
      kind: "software-type",
      summary:
        "User journeys, screens, components, API contracts, client state, and design primitives.",
      accent: "#ff6b57",
      status: "User-facing surface",
      layout: { x: 18, y: 24 },
      metrics: [
        { label: "Primary layer", value: "Interface" },
        { label: "Pressure", value: "State" },
      ],
      children: [
        {
          id: "product-shell",
          title: "Product Shell",
          kind: "interface",
          summary:
            "The persistent frame: navigation, account state, layout slots, and global actions.",
          accent: "#ff6b57",
          status: "Outer interface",
          layout: { x: 18, y: 20 },
          metrics: [
            { label: "Scope", value: "Global" },
            { label: "Children", value: "4" },
          ],
          children: [
            leaf("top-nav", "Top Navigation", "interface", "Switches primary product areas.", "#ff6b57", 18, 24),
            leaf("command-menu", "Command Menu", "flow", "Cross-product action launcher.", "#f4b942", 52, 18),
            leaf("account-state", "Account State", "data", "Identity, teams, billing, and roles.", "#27c7b8", 78, 40),
            leaf("layout-slots", "Layout Slots", "interface", "Regions where pages and tools mount.", "#56a7ff", 38, 68),
          ],
          edges: [
            { from: "account-state", to: "top-nav", label: "personalizes" },
            { from: "command-menu", to: "layout-slots", label: "opens" },
          ],
        },
        {
          id: "route-system",
          title: "Route System",
          kind: "flow",
          summary: "URLs, page boundaries, loaders, mutations, and navigation history.",
          accent: "#f4b942",
          status: "Navigation layer",
          layout: { x: 45, y: 17 },
          metrics: [
            { label: "Shape", value: "Tree" },
            { label: "Risk", value: "Stale data" },
          ],
        },
        {
          id: "component-system",
          title: "Component System",
          kind: "interface",
          summary:
            "Reusable controls, screen regions, empty states, loading states, and interaction patterns.",
          accent: "#27c7b8",
          status: "Composition layer",
          layout: { x: 72, y: 24 },
          metrics: [
            { label: "Reuse", value: "High" },
            { label: "Pressure", value: "Variants" },
          ],
          children: [
            leaf("forms", "Forms", "interface", "Inputs, validation, submission, and recovery.", "#27c7b8", 18, 26),
            leaf("tables", "Tables", "interface", "Dense comparison, bulk actions, sorting, filtering.", "#56a7ff", 48, 18),
            leaf("feedback", "Feedback States", "interface", "Loading, empty, error, and success states.", "#f4b942", 76, 38),
            leaf("tokens", "Design Tokens", "artifact", "Color, spacing, type, and motion primitives.", "#8f7cf6", 42, 70),
          ],
          edges: [
            { from: "tokens", to: "forms", label: "styles" },
            { from: "tokens", to: "tables", label: "styles" },
            { from: "feedback", to: "forms", label: "wraps" },
          ],
        },
        {
          id: "api-boundary",
          title: "API Boundary",
          kind: "runtime",
          summary:
            "The contract between browser behavior and server authority: queries, mutations, auth, and errors.",
          accent: "#56a7ff",
          status: "Trust boundary",
          layout: { x: 25, y: 70 },
          metrics: [
            { label: "Latency", value: "Human-visible" },
            { label: "Failure", value: "Recoverable" },
          ],
        },
        {
          id: "client-state",
          title: "Client State",
          kind: "data",
          summary:
            "Local caches, optimistic updates, feature flags, user settings, and transient UI state.",
          accent: "#8f7cf6",
          status: "Memory layer",
          layout: { x: 58, y: 72 },
          metrics: [
            { label: "Lifetime", value: "Mixed" },
            { label: "Risk", value: "Drift" },
          ],
        },
      ],
      edges: [
        { from: "product-shell", to: "route-system", label: "hosts" },
        { from: "route-system", to: "component-system", label: "renders" },
        { from: "component-system", to: "api-boundary", label: "calls" },
        { from: "api-boundary", to: "client-state", label: "hydrates" },
        { from: "client-state", to: "component-system", label: "feeds" },
      ],
    },
    {
      id: "agent-system",
      title: "Agentic Software",
      kind: "software-type",
      summary:
        "Goals, plans, tools, memory, policy, evaluation, and traces in one inspectable loop.",
      accent: "#27c7b8",
      status: "Reasoning runtime",
      layout: { x: 52, y: 18 },
      metrics: [
        { label: "Primary layer", value: "Flow" },
        { label: "Pressure", value: "Trust" },
      ],
      children: [
        node("goal-intake", "Goal Intake", "interface", "Turns ambiguous user intent into an executable task frame.", "#27c7b8", 14, 30),
        node("planner", "Planner", "flow", "Breaks work into steps, side tasks, checkpoints, and recovery paths.", "#f4b942", 38, 18, [
          leaf("task-graph", "Task Graph", "flow", "Planned steps, dependencies, and blocking edges.", "#f4b942", 22, 28),
          leaf("context-budget", "Context Budget", "data", "What the agent keeps, summarizes, or drops.", "#8f7cf6", 55, 22),
          leaf("checkpointing", "Checkpointing", "artifact", "Intermediate states that make long work resumable.", "#56a7ff", 72, 58),
        ]),
        node("tool-runtime", "Tool Runtime", "runtime", "Executes bounded actions against files, browsers, APIs, and local apps.", "#56a7ff", 68, 25, [
          leaf("browser-tool", "Browser Tool", "runtime", "Observes and acts through visible webpages.", "#56a7ff", 18, 24),
          leaf("shell-tool", "Shell Tool", "runtime", "Builds, tests, searches, and inspects the workspace.", "#ff6b57", 48, 18),
          leaf("file-patches", "File Patches", "artifact", "Scoped edits with reviewable diffs.", "#27c7b8", 78, 38),
          leaf("approval-model", "Approval Model", "flow", "Classifies actions by risk and permission.", "#f4b942", 44, 70),
        ]),
        node("memory", "Memory", "data", "Facts, artifacts, summaries, preferences, and relationship to prior work.", "#8f7cf6", 24, 70),
        node("evaluator", "Evaluator", "flow", "Checks whether outputs satisfy task, safety, and quality constraints.", "#73d06b", 55, 72),
        node("policy", "Policy Layer", "runtime", "Controls which actions are allowed, escalated, or refused.", "#ff6b57", 82, 62),
      ],
      edges: [
        { from: "goal-intake", to: "planner", label: "frames" },
        { from: "planner", to: "tool-runtime", label: "delegates" },
        { from: "tool-runtime", to: "memory", label: "records" },
        { from: "memory", to: "planner", label: "informs" },
        { from: "tool-runtime", to: "evaluator", label: "proves" },
        { from: "policy", to: "tool-runtime", label: "gates" },
      ],
    },
    {
      id: "distributed-system",
      title: "Distributed System",
      kind: "software-type",
      summary:
        "A runtime graph of gateways, services, events, storage, workers, and observability.",
      accent: "#56a7ff",
      status: "Networked runtime",
      layout: { x: 80, y: 32 },
      metrics: [
        { label: "Primary layer", value: "Runtime" },
        { label: "Pressure", value: "Failure" },
      ],
      children: [
        node("gateway", "Gateway", "runtime", "Ingress, auth, routing, rate limits, and request shaping.", "#56a7ff", 12, 28),
        node("service-mesh", "Service Mesh", "runtime", "Internal service calls, retries, discovery, and contracts.", "#27c7b8", 36, 18),
        node("event-bus", "Event Bus", "flow", "Queues, topics, fanout, replay, and backpressure.", "#f4b942", 63, 25),
        node("workers", "Workers", "runtime", "Async compute, schedulers, jobs, and compensating actions.", "#ff6b57", 80, 55),
        node("data-stores", "Data Stores", "data", "Databases, caches, search indexes, and consistency boundaries.", "#8f7cf6", 45, 74),
        node("observability", "Observability", "artifact", "Traces, metrics, logs, alerts, and incident context.", "#73d06b", 18, 70),
      ],
      edges: [
        { from: "gateway", to: "service-mesh", label: "routes" },
        { from: "service-mesh", to: "event-bus", label: "emits" },
        { from: "event-bus", to: "workers", label: "schedules" },
        { from: "workers", to: "data-stores", label: "writes" },
        { from: "service-mesh", to: "data-stores", label: "queries" },
        { from: "observability", to: "service-mesh", label: "samples" },
      ],
    },
    {
      id: "data-platform",
      title: "Data Platform",
      kind: "software-type",
      summary:
        "Sources, ingestion, transformation, models, semantic contracts, and downstream reports.",
      accent: "#f4b942",
      status: "Knowledge pipeline",
      layout: { x: 22, y: 70 },
      metrics: [
        { label: "Primary layer", value: "Data" },
        { label: "Pressure", value: "Lineage" },
      ],
      children: [
        node("sources", "Sources", "data", "Operational databases, events, files, and third-party feeds.", "#f4b942", 10, 36),
        node("ingestion", "Ingestion", "flow", "Batch, streaming, validation, deduplication, and landing zones.", "#ff6b57", 32, 22),
        node("transforms", "Transforms", "runtime", "Jobs that normalize, join, aggregate, and document datasets.", "#27c7b8", 55, 30),
        node("models", "Models", "artifact", "Versioned datasets with owners, tests, and freshness expectations.", "#56a7ff", 78, 44),
        node("semantic-layer", "Semantic Layer", "interface", "Shared business definitions, metrics, dimensions, and access.", "#8f7cf6", 55, 74),
        node("reports", "Reports", "interface", "Dashboards, exports, notebooks, and decision surfaces.", "#73d06b", 22, 72),
      ],
      edges: [
        { from: "sources", to: "ingestion", label: "feeds" },
        { from: "ingestion", to: "transforms", label: "lands" },
        { from: "transforms", to: "models", label: "builds" },
        { from: "models", to: "semantic-layer", label: "defines" },
        { from: "semantic-layer", to: "reports", label: "serves" },
      ],
    },
    {
      id: "game-engine",
      title: "Game Engine",
      kind: "software-type",
      summary:
        "World state, scenes, entities, systems, assets, rendering, input, and simulation loops.",
      accent: "#73d06b",
      status: "Simulation runtime",
      layout: { x: 50, y: 78 },
      metrics: [
        { label: "Primary layer", value: "Loop" },
        { label: "Pressure", value: "Frame time" },
      ],
      children: [
        node("world", "World", "data", "Persistent simulation state and high-level spatial partitioning.", "#73d06b", 16, 34),
        node("scenes", "Scenes", "artifact", "Loaded level graphs, cameras, lighting, and boundaries.", "#56a7ff", 38, 20),
        node("entities", "Entities", "data", "Actors, components, identity, and lifecycle.", "#f4b942", 62, 28),
        node("systems", "Systems", "runtime", "Physics, AI, animation, input, audio, and gameplay rules.", "#ff6b57", 80, 58),
        node("assets", "Assets", "artifact", "Meshes, textures, rigs, audio, shaders, and imported content.", "#8f7cf6", 48, 76),
        node("renderer", "Renderer", "runtime", "Frame graph, materials, lighting, post-processing, and GPU budget.", "#27c7b8", 18, 74),
      ],
      edges: [
        { from: "world", to: "scenes", label: "loads" },
        { from: "scenes", to: "entities", label: "contains" },
        { from: "entities", to: "systems", label: "updates" },
        { from: "assets", to: "renderer", label: "feeds" },
        { from: "systems", to: "renderer", label: "poses" },
      ],
    },
    {
      id: "operating-system",
      title: "Operating System",
      kind: "software-type",
      summary:
        "A layered machine interface: shell, services, kernel contracts, files, devices, and scheduling.",
      accent: "#8f7cf6",
      status: "Machine boundary",
      layout: { x: 80, y: 76 },
      metrics: [
        { label: "Primary layer", value: "Authority" },
        { label: "Pressure", value: "Isolation" },
      ],
      children: [
        node("shell", "Shell", "interface", "Desktop, terminal, launcher, windows, and human interaction.", "#8f7cf6", 15, 28),
        node("services", "Services", "runtime", "Daemons, background jobs, IPC endpoints, and supervisors.", "#56a7ff", 38, 18),
        node("kernel", "Kernel", "runtime", "Syscalls, memory, permissions, process model, and drivers.", "#ff6b57", 64, 32),
        node("files", "File System", "data", "Paths, permissions, metadata, mounts, and persistence.", "#f4b942", 34, 72),
        node("devices", "Devices", "runtime", "Hardware interfaces, input, display, network, and storage.", "#27c7b8", 78, 68),
      ],
      edges: [
        { from: "shell", to: "services", label: "asks" },
        { from: "services", to: "kernel", label: "calls" },
        { from: "kernel", to: "devices", label: "drives" },
        { from: "kernel", to: "files", label: "guards" },
        { from: "files", to: "shell", label: "presents" },
      ],
    },
  ],
  edges: [
    { from: "web-app", to: "agent-system", label: "interface can host" },
    { from: "agent-system", to: "distributed-system", label: "uses tools through" },
    { from: "distributed-system", to: "data-platform", label: "emits data into" },
    { from: "data-platform", to: "web-app", label: "feeds decisions in" },
    { from: "game-engine", to: "operating-system", label: "depends on" },
    { from: "operating-system", to: "distributed-system", label: "runs" },
  ],
};

function node(
  id: string,
  title: string,
  kind: NodeKind,
  summary: string,
  accent: string,
  x: number,
  y: number,
  children?: SoftwareNode[],
): SoftwareNode {
  return {
    id,
    title,
    kind,
    summary,
    accent,
    status: children?.length ? "Expandable node" : "Leaf node",
    layout: { x, y },
    metrics: [
      { label: "Children", value: `${children?.length ?? 0}` },
      { label: "Kind", value: kind },
    ],
    children,
  };
}

function leaf(
  id: string,
  title: string,
  kind: NodeKind,
  summary: string,
  accent: string,
  x: number,
  y: number,
): SoftwareNode {
  return node(id, title, kind, summary, accent, x, y);
}

export function getNodeAtPath(path: string[]) {
  let cursor: SoftwareNode = softwareAtlas;

  for (const id of path) {
    const next = cursor.children?.find((child) => child.id === id);

    if (!next) {
      return softwareAtlas;
    }

    cursor = next;
  }

  return cursor;
}

export function getNodesForPath(path: string[]) {
  const nodes = [softwareAtlas];
  let cursor = softwareAtlas;

  for (const id of path) {
    const next = cursor.children?.find((child) => child.id === id);

    if (!next) {
      break;
    }

    nodes.push(next);
    cursor = next;
  }

  return nodes;
}

export function sanitizePath(path: string[]) {
  const clean: string[] = [];
  let cursor = softwareAtlas;

  for (const id of path) {
    const next = cursor.children?.find((child) => child.id === id);

    if (!next) {
      break;
    }

    clean.push(next.id);
    cursor = next;
  }

  return clean;
}
