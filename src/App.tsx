import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Stars } from "@react-three/drei";
import {
  ArrowDownToLine,
  CircleDot,
  Compass,
  Layers3,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import type { Group } from "three";
import { chapters, type Chapter } from "./chapters";
import { createPanelTexture } from "./panelTexture";

const scrollPages = chapters.length;
const cameraDistance = 8.4;

export default function App() {
  const progress = useScrollProgress();
  const activeIndex = Math.min(
    chapters.length - 1,
    Math.round(progress * (chapters.length - 1)),
  );
  const activeChapter = chapters[activeIndex];

  const jumpTo = (index: number) => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const target = (index / (chapters.length - 1)) * maxScroll;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <div className="scene-layer" aria-hidden="true">
        <DepthScene progress={progress} activeIndex={activeIndex} />
      </div>

      <header className="topbar">
        <a className="brand" href="#threshold" aria-label="Depth home">
          <span className="brand-mark" />
          <span>Depth</span>
        </a>

        <nav className="chapter-nav" aria-label="Depth chapters">
          {chapters.map((chapter, index) => (
            <button
              aria-label={chapter.title}
              className={index === activeIndex ? "nav-dot is-active" : "nav-dot"}
              key={chapter.id}
              onClick={() => jumpTo(index)}
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
          onClick={() => jumpTo(0)}
          title="Return to the first layer"
          type="button"
        >
          <RotateCcw size={18} />
        </button>
      </header>

      <aside className="readout" aria-live="polite">
        <div className="readout-kicker">
          <Layers3 size={17} />
          <span>{activeChapter.kicker}</span>
        </div>
        <h1>{activeChapter.title}</h1>
        <p>{activeChapter.body}</p>
      </aside>

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
  progress: number;
};

function DepthScene({ activeIndex, progress }: DepthSceneProps) {
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
      <CameraRig progress={progress} />
      <DepthRail progress={progress} />
      <ParticleField />
      {chapters.map((chapter, index) => (
        <PagePlane
          chapter={chapter}
          index={index}
          isActive={index === activeIndex}
          key={chapter.id}
          progress={progress}
        />
      ))}
    </Canvas>
  );
}

function CameraRig({ progress }: { progress: number }) {
  const { size } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const lookAt = useMemo(() => new Vector3(), []);

  useFrame(({ camera }) => {
    const current = interpolateChapter(progress);
    const responsiveDistance = size.width < 760 ? 22.5 : cameraDistance;
    target.set(current.x, current.y, current.z + responsiveDistance);
    lookAt.set(current.x, current.y, current.z);
    camera.position.lerp(target, 0.095);
    camera.lookAt(lookAt);
  });

  return null;
}

function PagePlane({
  chapter,
  index,
  isActive,
  progress,
}: {
  chapter: Chapter;
  index: number;
  isActive: boolean;
  progress: number;
}) {
  const texture = useMemo(() => createPanelTexture(chapter, index), [chapter, index]);
  const activeDistance = Math.abs(progress * (chapters.length - 1) - index);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#ffffff",
        emissive: new Color(chapter.accent),
        emissiveIntensity: 0.05,
        map: texture,
        metalness: 0.12,
        roughness: 0.48,
        side: DoubleSide,
      }),
    [chapter.accent, texture],
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

  return (
    <group position={chapter.position} rotation={chapter.rotation}>
      <group scale={isActive ? 1.015 : 1}>
        <mesh material={material}>
          <planeGeometry args={[10.9, 6.7]} />
        </mesh>
        <mesh material={frameMaterial} position={[0, 0, -0.1]}>
          <boxGeometry args={[11.18, 6.98, 0.08]} />
        </mesh>
      </group>
      <DepthEcho chapter={chapter} index={index} strength={activeDistance} />
      <SideTabs chapter={chapter} />
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
