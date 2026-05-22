import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, Stars } from "@react-three/drei";
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowRight,
  CircleDot,
  Compass,
  DoorOpen,
  Layers3,
  Map,
  RotateCcw,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  MathUtils,
  MeshStandardMaterial,
  Points,
  Vector3,
} from "three";
import type { CSSProperties } from "react";
import type { Group } from "three";
import { chapters, type Chapter } from "./chapters";

const scrollPages = chapters.length;
const cameraDistance = 8.4;
const roomOffset = 9.6;

type RouteState = {
  index: number;
  isRoom: boolean;
};

type CorridorPageStyle = CSSProperties &
  Record<"--accent" | "--ink" | "--surface", string>;

export default function App() {
  const initialRoute = useMemo(() => parseHashRoute(), []);
  const progress = useScrollProgress();
  const [portalId, setPortalId] = useState<string | null>(
    initialRoute.isRoom ? chapters[initialRoute.index].id : null,
  );
  const [routeSyncIndex, setRouteSyncIndex] = useState<number | null>(
    initialRoute.index,
  );
  const activeIndex = Math.min(
    chapters.length - 1,
    Math.round(progress * (chapters.length - 1)),
  );
  const activeChapter = chapters[activeIndex];
  const portalChapter =
    chapters.find((chapter) => chapter.id === portalId) ?? null;
  const displayKicker = portalChapter
    ? `${portalChapter.kicker} / Room`
    : activeChapter.kicker;
  const displayTitle = portalChapter
    ? portalChapter.room.title
    : activeChapter.title;
  const displayBody = portalChapter
    ? portalChapter.room.summary
    : activeChapter.body;
  const roomSideLabel =
    activeChapter.side === "left" ? "Turn left" : "Turn right";

  const jumpTo = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const target = (index / (chapters.length - 1)) * maxScroll;
    window.scrollTo({ top: target, behavior });
  }, []);

  const goToChapter = useCallback(
    (index: number) => {
      const chapter = chapters[index];
      setPortalId(null);
      setRouteSyncIndex(index);
      setRouteHash(chapter.id, false, "push");
      jumpTo(index);
    },
    [jumpTo],
  );

  const enterRoom = useCallback(
    (chapter = activeChapter) => {
      const index = chapters.findIndex((item) => item.id === chapter.id);
      setPortalId(chapter.id);
      setRouteSyncIndex(index);
      setRouteHash(chapter.id, true, "push");
      jumpTo(index);
    },
    [activeChapter, jumpTo],
  );

  const exitRoom = useCallback(
    (mode: "push" | "replace" = "push") => {
      const chapter = portalChapter ?? activeChapter;
      const index = chapters.findIndex((item) => item.id === chapter.id);
      setPortalId(null);
      setRouteSyncIndex(index);
      setRouteHash(chapter.id, false, mode);
      jumpTo(index);
    },
    [activeChapter, jumpTo, portalChapter],
  );

  const resetPath = useCallback(() => {
    setPortalId(null);
    setRouteSyncIndex(0);
    setRouteHash(chapters[0].id, false, "push");
    jumpTo(0);
  }, [jumpTo]);

  useEffect(() => {
    const applyRoute = () => {
      const route = parseHashRoute();
      const chapter = chapters[route.index];
      setPortalId(route.isRoom ? chapter.id : null);
      setRouteSyncIndex(route.index);
      requestAnimationFrame(() => jumpTo(route.index, "auto"));
    };

    applyRoute();
    window.addEventListener("hashchange", applyRoute);
    window.addEventListener("popstate", applyRoute);

    return () => {
      window.removeEventListener("hashchange", applyRoute);
      window.removeEventListener("popstate", applyRoute);
    };
  }, [jumpTo]);

  useEffect(() => {
    if (routeSyncIndex !== null) {
      if (routeSyncIndex === activeIndex) {
        setRouteSyncIndex(null);
      }
      return;
    }

    if (!portalChapter) {
      setRouteHash(activeChapter.id, false, "replace");
    }
  }, [activeChapter.id, activeIndex, portalChapter, routeSyncIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = portalChapter ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [portalChapter]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }

      if (event.key === "Escape" && portalChapter) {
        event.preventDefault();
        exitRoom();
        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      const direction = event.key === "ArrowLeft" ? "left" : "right";

      if (portalChapter) {
        const exitDirection = portalChapter.side === "left" ? "right" : "left";

        if (direction === exitDirection) {
          event.preventDefault();
          exitRoom();
        }

        return;
      }

      if (activeChapter.side === direction) {
        event.preventDefault();
        enterRoom(activeChapter);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeChapter, enterRoom, exitRoom, portalChapter]);

  return (
    <div className="app-shell">
      <div className="scene-layer">
        <DepthScene
          activeIndex={activeIndex}
          onEnter={enterRoom}
          onJump={goToChapter}
          portalChapter={portalChapter}
          progress={progress}
        />
      </div>

      <header className="topbar">
        <a
          className="brand"
          href="#threshold"
          onClick={(event) => {
            event.preventDefault();
            resetPath();
          }}
          aria-label="Depth home"
        >
          <span className="brand-mark" />
          <span>Depth</span>
        </a>

        <nav className="chapter-nav" aria-label="Depth chapters">
          {chapters.map((chapter, index) => (
            <button
              aria-label={chapter.title}
              className={index === activeIndex ? "nav-dot is-active" : "nav-dot"}
              key={chapter.id}
              onClick={() => goToChapter(index)}
              title={chapter.title}
              type="button"
            >
              <CircleDot size={16} strokeWidth={2.4} />
            </button>
          ))}
        </nav>

        <button
          aria-label="Return to the first layer"
          className="icon-button"
          onClick={resetPath}
          title="Return to the first layer"
          type="button"
        >
          <RotateCcw size={18} />
        </button>
      </header>

      <aside
        className={portalChapter ? "readout is-room" : "readout"}
        aria-live="polite"
      >
        <div className="readout-kicker">
          <Layers3 size={17} />
          <span>{displayKicker}</span>
        </div>
        <h1>{displayTitle}</h1>
        <p>{displayBody}</p>
        <div className="readout-actions">
          {portalChapter ? (
            <button
              className="primary-action"
              onClick={() => exitRoom()}
              type="button"
            >
              <ArrowLeft size={18} />
              <span>Exit room</span>
            </button>
          ) : (
            <button
              className="primary-action"
              onClick={() => enterRoom(activeChapter)}
              type="button"
            >
              {activeChapter.side === "left" ? (
                <ArrowLeft size={18} />
              ) : (
                <ArrowRight size={18} />
              )}
              <span>{roomSideLabel}</span>
            </button>
          )}
        </div>
      </aside>

      {portalChapter && (
        <button
          aria-label="Close room"
          className="room-close"
          onClick={() => exitRoom()}
          title="Close room"
          type="button"
        >
          <X size={19} />
        </button>
      )}

      <DepthMap
        activeIndex={activeIndex}
        onEnter={enterRoom}
        onJump={goToChapter}
        portalChapter={portalChapter}
      />

      {portalChapter && <RoomPage chapter={portalChapter} onExit={exitRoom} />}

      <div className="depth-meter" aria-hidden="true">
        <Compass size={18} />
        <div className="meter-track">
          <span style={{ height: `${Math.max(8, progress * 100)}%` }} />
        </div>
        <ArrowDownToLine size={18} />
      </div>

      <main
        className="scroll-volume"
        style={{ height: `${scrollPages * 118}vh` }}
      >
        {chapters.map((chapter) => (
          <section
            aria-label={chapter.title}
            className="scroll-slice"
            id={chapter.id}
            key={chapter.id}
          />
        ))}
      </main>
    </div>
  );
}

function parseHashRoute(): RouteState {
  if (typeof window === "undefined") {
    return { index: 0, isRoom: false };
  }

  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  const [id, mode] = hash.split("/");
  const index = chapters.findIndex((chapter) => chapter.id === id);

  return {
    index: index >= 0 ? index : 0,
    isRoom: mode === "room" && index >= 0,
  };
}

function setRouteHash(
  chapterId: string,
  isRoom: boolean,
  mode: "push" | "replace",
) {
  const next = `#${chapterId}${isRoom ? "/room" : ""}`;

  if (window.location.hash === next) {
    return;
  }

  if (mode === "push") {
    window.history.pushState(null, "", next);
  } else {
    window.history.replaceState(null, "", next);
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

function DepthMap({
  activeIndex,
  onEnter,
  onJump,
  portalChapter,
}: {
  activeIndex: number;
  onEnter: (chapter?: Chapter) => void;
  onJump: (index: number) => void;
  portalChapter: Chapter | null;
}) {
  const points = useMemo(
    () =>
      chapters.map((chapter) => ({
        x: 50,
        y: 9 + Math.abs(chapter.position[2]) * 1.02,
        branchX: chapter.side === "left" ? 24 : 76,
      })),
    [],
  );
  const activeRoomIndex = portalChapter
    ? chapters.findIndex((chapter) => chapter.id === portalChapter.id)
    : activeIndex;
  const activeChapter = chapters[activeRoomIndex];

  return (
    <aside className="depth-map" aria-label="Depth map">
      <div className="map-heading">
        <Map size={17} />
        <span>{portalChapter ? portalChapter.room.title : "Depth map"}</span>
      </div>
      <div className="map-canvas">
        <svg aria-hidden="true" viewBox="0 0 100 100">
          <polyline
            className="map-path"
            points={points.map((point) => `${point.x},${point.y}`).join(" ")}
          />
          {portalChapter && (
            <line
              className="map-branch"
              x1={points[activeRoomIndex].x}
              x2={points[activeRoomIndex].branchX}
              y1={points[activeRoomIndex].y}
              y2={points[activeRoomIndex].y}
            />
          )}
        </svg>
        {chapters.map((chapter, index) => (
          <button
            aria-label={chapter.title}
            className={
              index === activeRoomIndex ? "map-node is-active" : "map-node"
            }
            key={chapter.id}
            onClick={() => onJump(index)}
            style={{ left: `${points[index].x}%`, top: `${points[index].y}%` }}
            title={chapter.title}
            type="button"
          />
        ))}
      </div>
      <button
        className="map-room-button"
        onClick={() =>
          portalChapter ? onJump(activeRoomIndex) : onEnter(activeChapter)
        }
        type="button"
      >
        {portalChapter ? <ArrowLeft size={16} /> : <DoorOpen size={16} />}
        <span>
          {portalChapter
            ? "Main path"
            : activeChapter.side === "left"
              ? "Open left room"
              : "Open right room"}
        </span>
      </button>
    </aside>
  );
}

function RoomPage({
  chapter,
  onExit,
}: {
  chapter: Chapter;
  onExit: () => void;
}) {
  return (
    <section className={`room-page room-page--${chapter.side}`}>
      <header className="room-page-header">
        <div>
          <p>{chapter.kicker} / {chapter.side} room</p>
          <h2>{chapter.room.title}</h2>
        </div>
        <button
          aria-label="Return to corridor"
          className="room-page-close"
          onClick={onExit}
          title="Return to corridor"
          type="button"
        >
          <ArrowLeft size={18} />
        </button>
      </header>

      <div className="room-page-body">
        <div className="room-page-summary">
          <span>{chapter.room.kind}</span>
          <p>{chapter.room.summary}</p>
        </div>

        <div className={`room-content-grid room-content-grid--${chapter.room.kind}`}>
          {chapter.room.sections.map((section) => (
            <article className="room-card" key={section.title}>
              <span>{section.eyebrow}</span>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </article>
          ))}
        </div>

        <RoomWorkbench chapter={chapter} />

        <nav className="room-local-nav" aria-label={`${chapter.room.title} sections`}>
          {["Overview", "Objects", "Activity", "Settings"].map((label) => (
            <button key={label} type="button">
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}

function RoomWorkbench({ chapter }: { chapter: Chapter }) {
  if (chapter.room.kind === "dashboard") {
    return (
      <div className="room-workbench room-workbench--dashboard">
        <div className="metric-tile">
          <span>Latency</span>
          <strong>42ms</strong>
        </div>
        <div className="metric-tile">
          <span>Agents</span>
          <strong>18</strong>
        </div>
        <div className="metric-tile">
          <span>Risk</span>
          <strong>Low</strong>
        </div>
        <div className="trace-list">
          <p>Recent signal</p>
          <span>Build passed</span>
          <span>Memory indexed</span>
          <span>UI branch active</span>
        </div>
      </div>
    );
  }

  if (chapter.room.kind === "archive") {
    return (
      <div className="room-workbench room-workbench--archive">
        {["Design notes", "Run logs", "Screenshots", "Research", "Decisions", "Drafts"].map(
          (label) => (
            <button key={label} type="button">
              <span>{label}</span>
            </button>
          ),
        )}
      </div>
    );
  }

  if (chapter.room.kind === "workbench") {
    return (
      <div className="room-workbench room-workbench--tools">
        {["Canvas", "Prompt", "Preview", "Diff"].map((label, index) => (
          <div className="tool-column" key={label}>
            <span>{label}</span>
            <div style={{ height: `${72 + index * 28}px` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="room-workbench">
      <p>
        Spatial meaning hypothesis: the corridor is global context, rooms are
        bounded work modes, and side direction can encode what kind of thinking
        the user is doing.
      </p>
    </div>
  );
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        const next = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        setProgress(MathUtils.clamp(next, 0, 1));
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return progress;
}

type DepthSceneProps = {
  activeIndex: number;
  onEnter: (chapter?: Chapter) => void;
  onJump: (index: number) => void;
  portalChapter: Chapter | null;
  progress: number;
};

function DepthScene({
  activeIndex,
  onEnter,
  onJump,
  portalChapter,
  progress,
}: DepthSceneProps) {
  return (
    <Canvas
      camera={{ fov: 45, position: [0, 0, cameraDistance], near: 0.1, far: 150 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: false }}
    >
      <color args={["#11100f"]} attach="background" />
      <fog attach="fog" args={["#11100f", 12, 92]} />
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#fff4d3", "#15100d", 1.8]} />
      <directionalLight color="#fff2d6" intensity={2.2} position={[6, 5, 10]} />
      <directionalLight color="#8be3ff" intensity={1.6} position={[-7, -4, -6]} />
      <Stars
        count={900}
        depth={80}
        factor={4}
        fade
        radius={95}
        saturation={0.2}
        speed={0.35}
      />
      <CameraRig portalChapter={portalChapter} progress={progress} />
      {!portalChapter && <DepthRail progress={progress} />}
      <ParticleField />
      {!portalChapter &&
        chapters.map((chapter, index) => (
          <PagePlane
            chapter={chapter}
            index={index}
            isActive={index === activeIndex}
            key={chapter.id}
            onEnter={onEnter}
            onJump={onJump}
            portalChapter={portalChapter}
            progress={progress}
          />
        ))}
      {portalChapter && <PortalRoom chapter={portalChapter} />}
    </Canvas>
  );
}

function CameraRig({
  portalChapter,
  progress,
}: {
  portalChapter: Chapter | null;
  progress: number;
}) {
  const { size } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const lookAt = useMemo(() => new Vector3(), []);

  useFrame(({ camera }) => {
    const current = interpolateChapter(progress);
    const responsiveDistance = size.width < 760 ? 22.5 : cameraDistance;

    if (portalChapter) {
      const [x, y, z] = portalChapter.position;
      const side = portalChapter.side === "right" ? 1 : -1;
      target.set(x + side * 2.2, y - 0.1, z + 0.25);
      lookAt.set(x + side * roomOffset, y - 0.1, z);
    } else {
      target.set(current.x, current.y, current.z + responsiveDistance);
      lookAt.set(current.x, current.y, current.z);
    }

    camera.position.lerp(target, 0.095);
    camera.lookAt(lookAt);
  });

  return null;
}

function PagePlane({
  chapter,
  index,
  isActive,
  onEnter,
  onJump,
  portalChapter,
  progress,
}: {
  chapter: Chapter;
  index: number;
  isActive: boolean;
  onEnter: (chapter?: Chapter) => void;
  onJump: (index: number) => void;
  portalChapter: Chapter | null;
  progress: number;
}) {
  const { size } = useThree();
  const activeDistance = Math.abs(progress * (chapters.length - 1) - index);
  const htmlDistanceFactor = size.width < 760 ? 4.2 : 5.08;
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: chapter.surface,
        emissive: new Color(chapter.accent),
        emissiveIntensity: isActive ? 0.08 : 0.035,
        metalness: 0.12,
        roughness: 0.48,
        side: DoubleSide,
      }),
    [chapter.accent, chapter.surface, isActive],
  );

  const frameMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: chapter.accent,
        emissive: new Color(chapter.accent),
        emissiveIntensity: isActive ? 0.28 : 0.09,
        metalness: 0.35,
        roughness: 0.38,
      }),
    [chapter.accent, isActive],
  );

  const isPortalSource = portalChapter?.id === chapter.id;

  return (
    <group
      position={chapter.position}
      rotation={chapter.rotation}
      scale={isPortalSource ? 1.08 : 1}
    >
      <group scale={isActive ? 1.015 : 1}>
        <mesh material={material}>
          <planeGeometry args={[10.9, 6.7]} />
        </mesh>
        <mesh material={frameMaterial} position={[0, 0, -0.1]}>
          <boxGeometry args={[11.18, 6.98, 0.08]} />
        </mesh>
      </group>
      <Html
        center
        className="corridor-html-wrap"
        distanceFactor={htmlDistanceFactor}
        position={[0, 0, 0.16]}
        transform
      >
        <CorridorPage
          chapter={chapter}
          index={index}
          isActive={isActive}
          onEnter={onEnter}
          onJump={onJump}
        />
      </Html>
      {isActive && !portalChapter && <PortalGlyph chapter={chapter} />}
      <DepthEcho chapter={chapter} index={index} strength={activeDistance} />
      <SideTabs chapter={chapter} />
    </group>
  );
}

function CorridorPage({
  chapter,
  index,
  isActive,
  onEnter,
  onJump,
}: {
  chapter: Chapter;
  index: number;
  isActive: boolean;
  onEnter: (chapter?: Chapter) => void;
  onJump: (index: number) => void;
}) {
  const nextIndex = Math.min(chapters.length - 1, index + 1);

  return (
    <article
      aria-hidden={!isActive}
      className={isActive ? "corridor-page is-active" : "corridor-page"}
      style={
        {
          "--accent": chapter.accent,
          "--ink": chapter.ink,
          "--surface": chapter.surface,
        } as CorridorPageStyle
      }
    >
      <header className="corridor-page-header">
        <div>
          <p>{chapter.kicker}</p>
          <h2>{chapter.title}</h2>
        </div>
        <span className="corridor-side">{chapter.side}</span>
      </header>

      <p className="corridor-page-copy">{chapter.body}</p>

      <div className="corridor-panel-grid">
        {chapter.room.sections.slice(0, 3).map((section) => (
          <button
            className="corridor-mini-panel"
            disabled={!isActive}
            key={section.title}
            onClick={() => onEnter(chapter)}
            type="button"
          >
            <span>{section.eyebrow}</span>
            <strong>{section.title}</strong>
          </button>
        ))}
      </div>

      <footer className="corridor-page-actions">
        <button
          className="corridor-primary"
          disabled={!isActive}
          onClick={() => onEnter(chapter)}
          type="button"
        >
          {chapter.side === "left" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          <span>{chapter.side === "left" ? "Turn left" : "Turn right"}</span>
        </button>
        <button
          className="corridor-secondary"
          disabled={!isActive || nextIndex === index}
          onClick={() => onJump(nextIndex)}
          type="button"
        >
          <span>Next area</span>
        </button>
      </footer>
    </article>
  );
}

function PortalGlyph({ chapter }: { chapter: Chapter }) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.035;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0.09]}>
      <mesh>
        <ringGeometry args={[0.48, 0.66, 54]} />
        <meshBasicMaterial color="#fff8e8" opacity={0.86} transparent />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[0.88, 0.92, 54]} />
        <meshBasicMaterial color={chapter.accent} opacity={0.62} transparent />
      </mesh>
    </group>
  );
}

function PortalRoom({ chapter }: { chapter: Chapter }) {
  const [x, y, z] = chapter.position;
  const side = chapter.side === "right" ? 1 : -1;

  return (
    <group
      position={[x + side * roomOffset, y, z]}
      rotation={[0, -side * Math.PI * 0.5, 0]}
    >
      <mesh position={[0, 0, -0.24]}>
        <planeGeometry args={[13.4, 8.2]} />
        <meshStandardMaterial
          color={chapter.ink}
          emissive={chapter.accent}
          emissiveIntensity={0.08}
          opacity={0.94}
          roughness={0.62}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <mesh position={[0, 0, -0.18]}>
        <planeGeometry args={[12.6, 7.4]} />
        <meshBasicMaterial
          color={chapter.surface}
          opacity={0.08}
          side={DoubleSide}
          transparent
        />
      </mesh>
      <RoomFrame chapter={chapter} />
      <RoomContent chapter={chapter} />
    </group>
  );
}

function RoomFrame({ chapter }: { chapter: Chapter }) {
  return (
    <group>
      <mesh position={[0, 3.92, 0]}>
        <boxGeometry args={[12.8, 0.08, 0.08]} />
        <meshBasicMaterial color={chapter.accent} />
      </mesh>
      <mesh position={[0, -3.92, 0]}>
        <boxGeometry args={[12.8, 0.08, 0.08]} />
        <meshBasicMaterial color={chapter.accent} />
      </mesh>
      <mesh position={[-6.4, 0, 0]}>
        <boxGeometry args={[0.08, 7.9, 0.08]} />
        <meshBasicMaterial color={chapter.accent} />
      </mesh>
      <mesh position={[6.4, 0, 0]}>
        <boxGeometry args={[0.08, 7.9, 0.08]} />
        <meshBasicMaterial color={chapter.accent} />
      </mesh>
    </group>
  );
}

function RoomContent({ chapter }: { chapter: Chapter }) {
  switch (chapter.room.kind) {
    case "map":
      return <MapRoom chapter={chapter} />;
    case "dashboard":
      return <DashboardRoom chapter={chapter} />;
    case "archive":
      return <ArchiveRoom chapter={chapter} />;
    case "workbench":
      return <WorkbenchRoom chapter={chapter} />;
    case "constellation":
      return <ConstellationRoom chapter={chapter} />;
    case "essay":
    default:
      return <EssayRoom chapter={chapter} />;
  }
}

function EssayRoom({ chapter }: { chapter: Chapter }) {
  return (
    <group>
      {[-4.3, -1.45, 1.45, 4.3].map((x, index) => (
        <mesh key={x} position={[x, 0.25 - index * 0.08, 0.06]}>
          <planeGeometry args={[2.18, 5.4 - index * 0.35]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? chapter.surface : "#fffaf0"}
            opacity={index % 2 === 0 ? 0.72 : 0.52}
            side={DoubleSide}
            transparent
          />
        </mesh>
      ))}
      {[-2.25, -0.75, 0.75, 2.25].map((y, index) => (
        <mesh key={y} position={[0, y, 0.16]}>
          <boxGeometry args={[8.8 - index * 0.92, 0.08, 0.08]} />
          <meshBasicMaterial color={index % 2 === 0 ? chapter.accent : chapter.ink} />
        </mesh>
      ))}
    </group>
  );
}

function MapRoom({ chapter }: { chapter: Chapter }) {
  const nodes = [
    new Vector3(-4.5, 1.8, 0.12),
    new Vector3(-2.2, -0.5, 0.12),
    new Vector3(0.4, 1.1, 0.12),
    new Vector3(2.2, -1.4, 0.12),
    new Vector3(4.6, 1.5, 0.12),
  ];

  return (
    <group>
      <Line color={chapter.accent} lineWidth={2} opacity={0.75} points={nodes} transparent />
      {nodes.map((node, index) => (
        <mesh key={`${node.x}-${node.y}`} position={node.toArray()}>
          <sphereGeometry args={[index === 2 ? 0.34 : 0.24, 28, 28]} />
          <meshStandardMaterial
            color={index === 2 ? chapter.accent : chapter.surface}
            emissive={chapter.accent}
            emissiveIntensity={0.18}
            roughness={0.32}
          />
        </mesh>
      ))}
      {[-3.2, 0, 3.2].map((x, index) => (
        <mesh key={x} position={[x, -2.65, 0.08]}>
          <planeGeometry args={[1.8, 0.64 + index * 0.12]} />
          <meshBasicMaterial color={chapter.surface} opacity={0.46} transparent />
        </mesh>
      ))}
    </group>
  );
}

function DashboardRoom({ chapter }: { chapter: Chapter }) {
  const bars = [1.2, 2.4, 1.7, 3.1, 2.2, 3.55, 2.8];

  return (
    <group>
      {bars.map((height, index) => (
        <mesh
          key={`${height}-${index}`}
          position={[-4.6 + index * 1.45, -2.5 + height / 2, 0.1]}
        >
          <boxGeometry args={[0.72, height, 0.28]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? chapter.accent : chapter.surface}
            emissive={chapter.accent}
            emissiveIntensity={0.1}
            roughness={0.36}
          />
        </mesh>
      ))}
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[-3.7 + index * 3.7, 2.35, 0.12]}>
          <planeGeometry args={[2.4, 1.1]} />
          <meshBasicMaterial
            color={index === 1 ? chapter.accent : chapter.surface}
            opacity={index === 1 ? 0.74 : 0.44}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

function ArchiveRoom({ chapter }: { chapter: Chapter }) {
  return (
    <group>
      {Array.from({ length: 15 }).map((_, index) => {
        const column = index % 5;
        const row = Math.floor(index / 5);
        return (
          <mesh
            key={index}
            position={[-4.8 + column * 2.4, 2.1 - row * 2, 0.1 + index * 0.002]}
            rotation={[0, 0, (column - 2) * 0.015]}
          >
            <planeGeometry args={[1.75, 1.18]} />
            <meshBasicMaterial
              color={(index + row) % 3 === 0 ? chapter.accent : chapter.surface}
              opacity={(index + row) % 3 === 0 ? 0.72 : 0.52}
              side={DoubleSide}
              transparent
            />
          </mesh>
        );
      })}
    </group>
  );
}

function WorkbenchRoom({ chapter }: { chapter: Chapter }) {
  return (
    <group>
      <mesh position={[0, -2.7, 0.08]}>
        <boxGeometry args={[10.5, 0.18, 0.28]} />
        <meshBasicMaterial color={chapter.accent} />
      </mesh>
      {[-3.6, -1.2, 1.2, 3.6].map((x, index) => (
        <group key={x} position={[x, 0, 0.1]}>
          <mesh position={[0, 1.1, 0]}>
            <planeGeometry args={[1.6, 2.2]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? chapter.surface : chapter.accent}
              opacity={0.62}
              side={DoubleSide}
              transparent
            />
          </mesh>
          <mesh position={[0, -0.65, 0.1]}>
            <boxGeometry args={[1.72, 0.1, 0.12]} />
            <meshBasicMaterial color="#fffaf0" opacity={0.68} transparent />
          </mesh>
          <mesh position={[-0.36 + index * 0.22, -0.65, 0.18]}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshBasicMaterial color={chapter.accent} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ConstellationRoom({ chapter }: { chapter: Chapter }) {
  const stars = [
    new Vector3(-4.4, -1.8, 0.1),
    new Vector3(-2.7, 1.7, 0.1),
    new Vector3(-0.7, -0.1, 0.1),
    new Vector3(1.6, 2.1, 0.1),
    new Vector3(4.4, -1.2, 0.1),
  ];

  return (
    <group>
      <Line color={chapter.accent} lineWidth={1.6} opacity={0.6} points={stars} transparent />
      {stars.map((star, index) => (
        <mesh key={`${star.x}-${star.y}`} position={star.toArray()}>
          <sphereGeometry args={[0.24 + index * 0.035, 32, 32]} />
          <meshStandardMaterial
            color={index === stars.length - 1 ? chapter.accent : "#fffaf0"}
            emissive={chapter.accent}
            emissiveIntensity={0.22}
            roughness={0.24}
          />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((index) => (
        <mesh key={index} position={[-3 + index * 2, -3, 0.08]}>
          <ringGeometry args={[0.4 + index * 0.18, 0.43 + index * 0.18, 44]} />
          <meshBasicMaterial color={chapter.surface} opacity={0.35} transparent />
        </mesh>
      ))}
    </group>
  );
}

function DepthEcho({
  chapter,
  index,
  strength,
}: {
  chapter: Chapter;
  index: number;
  strength: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z =
        Math.sin(clock.elapsedTime * 0.25 + index) * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((layer) => (
        <mesh key={layer} position={[0, 0, -0.18 - layer * 0.22]}>
          <planeGeometry args={[10.9 + layer * 0.32, 6.7 + layer * 0.22]} />
          <meshBasicMaterial
            color={chapter.accent}
            opacity={Math.max(0.035, 0.11 - strength * 0.03 - layer * 0.02)}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

function SideTabs({ chapter }: { chapter: Chapter }) {
  return (
    <group>
      {[-2.1, -0.7, 0.7, 2.1].map((y, index) => (
        <mesh key={y} position={[5.85, y, -0.15]}>
          <boxGeometry args={[0.32, 0.72, 0.08]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? chapter.accent : chapter.surface}
            emissive={chapter.accent}
            emissiveIntensity={0.07}
            roughness={0.45}
          />
        </mesh>
      ))}
    </group>
  );
}

function DepthRail({ progress }: { progress: number }) {
  const points = useMemo(
    () => chapters.map((chapter) => new Vector3(...chapter.position)),
    [],
  );

  return (
    <group>
      <Line color="#f2e7cf" lineWidth={1} opacity={0.4} points={points} transparent />
      <mesh position={interpolateChapter(progress).toArray()}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<Points>(null);
  const geometry = useMemo(() => {
    const dots = new Float32Array(720 * 3);

    for (let i = 0; i < dots.length; i += 3) {
      dots[i] = MathUtils.randFloatSpread(16);
      dots[i + 1] = MathUtils.randFloatSpread(10);
      dots[i + 2] = MathUtils.randFloat(-88, 6);
    }

    const pointGeometry = new BufferGeometry();
    pointGeometry.setAttribute("position", new BufferAttribute(dots, 3));
    return pointGeometry;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z = clock.elapsedTime * 0.012;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        blending={AdditiveBlending}
        color="#ffe6bb"
        opacity={0.58}
        size={0.028}
        transparent
      />
    </points>
  );
}

function interpolateChapter(progress: number) {
  const scaled = MathUtils.clamp(progress, 0, 1) * (chapters.length - 1);
  const startIndex = Math.floor(scaled);
  const endIndex = Math.min(chapters.length - 1, startIndex + 1);
  const local = scaled - startIndex;
  const eased = local * local * (3 - 2 * local);
  const start = chapters[startIndex].position;
  const end = chapters[endIndex].position;

  return new Vector3(
    MathUtils.lerp(start[0], end[0], eased),
    MathUtils.lerp(start[1], end[1], eased),
    MathUtils.lerp(start[2], end[2], eased),
  );
}
