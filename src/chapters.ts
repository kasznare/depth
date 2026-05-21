export type Chapter = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  room: {
    kind: "essay" | "map" | "dashboard" | "archive" | "workbench" | "constellation";
    title: string;
    summary: string;
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
    title: "The page grows a hallway",
    body: "A familiar article surface becomes a room with distance, layers, and a horizon line.",
    room: {
      kind: "essay",
      title: "Reading Room",
      summary: "A decomposed article: notes, pull quotes, and marginalia held at different distances.",
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
    title: "An index you can enter",
    body: "The table of contents stops being a list and starts behaving like an architectural cutaway.",
    room: {
      kind: "map",
      title: "Atlas Room",
      summary: "A navigable map of sections, side paths, and shortcuts through the whole document.",
    },
    accent: "#27c7b8",
    surface: "#dff8f1",
    ink: "#112322",
    position: [-3.5, 1.2, -15],
    rotation: [0.03, 0.16, -0.02],
  },
  {
    id: "signal",
    kicker: "Depth 02",
    title: "Data appears behind glass",
    body: "Metrics and narrative can occupy different depths, letting the viewer steer attention by moving forward.",
    room: {
      kind: "dashboard",
      title: "Signal Room",
      summary: "Metrics, chart fragments, and annotations arranged like an instrument panel.",
    },
    accent: "#f4b942",
    surface: "#fff5cf",
    ink: "#211a0b",
    position: [3.2, -0.9, -31],
    rotation: [-0.02, -0.18, 0.02],
  },
  {
    id: "archive",
    kicker: "Depth 03",
    title: "Side pages become chambers",
    body: "Reference material sits off-axis, visible enough to invite exploration without flattening the main path.",
    room: {
      kind: "archive",
      title: "Archive Room",
      summary: "A wall of documents and media tiles that can branch away from the main corridor.",
    },
    accent: "#8f7cf6",
    surface: "#eee9ff",
    ink: "#1c1833",
    position: [-2.2, -1.4, -47],
    rotation: [0.04, 0.1, 0.035],
  },
  {
    id: "workshop",
    kicker: "Depth 04",
    title: "The interface remembers scale",
    body: "Micro and macro views can live in one continuous motion, more like zooming through a map than changing routes.",
    room: {
      kind: "workbench",
      title: "Workshop Room",
      summary: "A tool surface for changing scale, comparing states, and inspecting interface parts.",
    },
    accent: "#73d06b",
    surface: "#ecf8df",
    ink: "#172114",
    position: [2.8, 1.35, -63],
    rotation: [-0.03, -0.12, -0.035],
  },
  {
    id: "afterimage",
    kicker: "Depth 05",
    title: "Every layer stays in relation",
    body: "The end state is still one website: linkable, static, and scroll-driven, just with actual spatial memory.",
    room: {
      kind: "constellation",
      title: "Afterimage Room",
      summary: "The full path becomes a constellation of remembered moves and return points.",
    },
    accent: "#56a7ff",
    surface: "#e7f2ff",
    ink: "#111827",
    position: [0, 0, -80],
    rotation: [0, 0, 0],
  },
];
