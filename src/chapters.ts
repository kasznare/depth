export type RoomSection = {
  eyebrow: string;
  title: string;
  body: string;
};

export type Chapter = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  side: "left" | "right";
  room: {
    kind:
      | "essay"
      | "map"
      | "dashboard"
      | "archive"
      | "workbench"
      | "constellation";
    title: string;
    summary: string;
    sections: RoomSection[];
  };
  accent: string;
  surface: string;
  ink: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

export const chapters: Chapter[] = [
  {
    id: "threshold",
    kicker: "Depth 00",
    title: "Core hallway",
    body: "The straight spine is the operating layer: move forward to switch areas, turn sideways to enter a focused workspace.",
    side: "left",
    room: {
      kind: "essay",
      title: "Kernel Notes",
      summary:
        "The principles of the system: what belongs in the corridor, what belongs in rooms, and what stays flat.",
      sections: [
        {
          eyebrow: "Principle",
          title: "The corridor is navigation, not content",
          body: "Forward movement means switching areas at the same conceptual level. It should feel like walking through the top bar of an operating system, only spatial.",
        },
        {
          eyebrow: "Rule",
          title: "Rooms are work surfaces",
          body: "Once you turn into a room, depth stops. The room behaves like a normal page or tool so the user can read, scan, filter, and act without fighting the camera.",
        },
        {
          eyebrow: "Meaning",
          title: "Place equals mode",
          body: "Left and right are not decoration. They can separate creation from inspection, global from local, planning from execution, or public from private state.",
        },
      ],
    },
    accent: "#ff6b57",
    surface: "#f7eee3",
    ink: "#231f20",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  {
    id: "atlas",
    kicker: "Depth 01",
    title: "Navigation atlas",
    body: "A map room sits off the spine so orientation is available without becoming the main task.",
    side: "right",
    room: {
      kind: "map",
      title: "Atlas Room",
      summary:
        "A navigable index of areas, shortcuts, dependencies, and recent places.",
      sections: [
        {
          eyebrow: "Wayfinding",
          title: "Where am I?",
          body: "The map should answer location, nearby rooms, active branch, and return path at a glance.",
        },
        {
          eyebrow: "Shortcut",
          title: "Jump without losing the model",
          body: "Direct jumps should still animate through the corridor enough to preserve spatial memory.",
        },
        {
          eyebrow: "Mega software",
          title: "This is the OS switcher",
          body: "The atlas can become a command-center layer for a large product: apps, projects, data sources, people, agents, and logs.",
        },
      ],
    },
    accent: "#27c7b8",
    surface: "#dff8f1",
    ink: "#112322",
    position: [0, 0, -16],
    rotation: [0, 0, 0],
  },
  {
    id: "signal",
    kicker: "Depth 02",
    title: "Signal desk",
    body: "Inspection and telemetry live to the left: dashboards, traces, health, and live state.",
    side: "left",
    room: {
      kind: "dashboard",
      title: "Signal Room",
      summary: "A dashboard page with metrics, traces, alerts, and explanatory notes.",
      sections: [
        {
          eyebrow: "Telemetry",
          title: "System pulse",
          body: "A mega tool needs a place to see what is alive, blocked, noisy, or changing too quickly.",
        },
        {
          eyebrow: "Debugging",
          title: "Evidence near the work",
          body: "The room can keep logs, screenshots, events, and outcomes close to the thing they explain.",
        },
        {
          eyebrow: "Pattern",
          title: "Left as inspection",
          body: "If left always means inspect or understand, users start building a body memory for the software.",
        },
      ],
    },
    accent: "#f4b942",
    surface: "#fff5cf",
    ink: "#211a0b",
    position: [0, 0, -32],
    rotation: [0, 0, 0],
  },
  {
    id: "archive",
    kicker: "Depth 03",
    title: "Archive stacks",
    body: "Reference belongs off the main path: searchable, scrollable, and dense, but never blocking forward motion.",
    side: "right",
    room: {
      kind: "archive",
      title: "Archive Room",
      summary:
        "A document page for saved artifacts, history, source material, and memory.",
      sections: [
        {
          eyebrow: "Memory",
          title: "Everything the system has touched",
          body: "Docs, uploaded files, generated drafts, previous decisions, and source links can live in one library-like surface.",
        },
        {
          eyebrow: "Retrieval",
          title: "Search is a room, not a modal",
          body: "Deep software often needs retrieval as a first-class place where results can be compared and pinned.",
        },
        {
          eyebrow: "Pattern",
          title: "Right as reference",
          body: "If right means library, source, and context, the spatial language starts doing actual product work.",
        },
      ],
    },
    accent: "#8f7cf6",
    surface: "#eee9ff",
    ink: "#1c1833",
    position: [0, 0, -48],
    rotation: [0, 0, 0],
  },
  {
    id: "workshop",
    kicker: "Depth 04",
    title: "Workshop bay",
    body: "Creation lives off the spine: tools, editors, canvases, and experiments that need their own local scroll.",
    side: "left",
    room: {
      kind: "workbench",
      title: "Workshop Room",
      summary:
        "A scrollable work page with tool panels, object state, variants, and actions.",
      sections: [
        {
          eyebrow: "Making",
          title: "A place for messy work",
          body: "Editors and tools need persistence: settings, versions, previews, and undo trails should remain in one stable room.",
        },
        {
          eyebrow: "Comparison",
          title: "Keep variants side by side",
          body: "Spatial rooms can give comparison more area without hiding the rest of the system behind tabs.",
        },
        {
          eyebrow: "Pattern",
          title: "Left can also mean active work",
          body: "Inspection and creation might share the left side if both are active, while right remains context and memory.",
        },
      ],
    },
    accent: "#73d06b",
    surface: "#ecf8df",
    ink: "#172114",
    position: [0, 0, -64],
    rotation: [0, 0, 0],
  },
  {
    id: "afterimage",
    kicker: "Depth 05",
    title: "Graph overlook",
    body: "At the end of the corridor, the whole system becomes a graph of places, work, and relationships.",
    side: "right",
    room: {
      kind: "constellation",
      title: "Graph Room",
      summary:
        "A relationship page that connects areas, artifacts, actions, and people.",
      sections: [
        {
          eyebrow: "Overview",
          title: "The system as a graph",
          body: "A mega software environment eventually needs a place where work objects reveal their connections.",
        },
        {
          eyebrow: "Recovery",
          title: "Return to any state",
          body: "Spatial memory can support history: where you came from, what changed, and how to get back.",
        },
        {
          eyebrow: "Meaning",
          title: "Distance can encode scope",
          body: "Near means current work. Far means system-level structure. Side rooms mean local tasks with bounded depth.",
        },
      ],
    },
    accent: "#56a7ff",
    surface: "#e7f2ff",
    ink: "#111827",
    position: [0, 0, -80],
    rotation: [0, 0, 0],
  },
];
