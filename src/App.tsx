import {
  ArrowLeft,
  Boxes,
  CircleDot,
  CornerDownRight,
  Focus,
  GitBranch,
  Layers3,
  Network,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  getNodeAtPath,
  getNodesForPath,
  sanitizePath,
  softwareAtlas,
  type SoftwareEdge,
  type SoftwareNode,
} from "./softwareGraph";

type NodeStyle = CSSProperties & Record<"--node-accent", string>;
type AccentStyle = CSSProperties & Record<"--accent", string>;

export default function App() {
  const [path, setPath] = useState<string[]>(() => parseRoutePath());
  const currentNode = useMemo(() => getNodeAtPath(path), [path]);
  const pathNodes = useMemo(() => getNodesForPath(path), [path]);
  const children = currentNode.children ?? [];
  const childSignature = children.map((child) => child.id).join("|");
  const [selectedId, setSelectedId] = useState(
    children[0]?.id ?? currentNode.id,
  );
  const selectedNode =
    children.find((child) => child.id === selectedId) ?? currentNode;

  const navigateTo = useCallback((nextPath: string[], mode: "push" | "replace") => {
    const cleanPath = sanitizePath(nextPath);
    setPath(cleanPath);
    setRoutePath(cleanPath, mode);
  }, []);

  const resetAtlas = useCallback(() => {
    navigateTo([], "push");
  }, [navigateTo]);

  const goUp = useCallback(() => {
    if (!path.length) {
      return;
    }

    navigateTo(path.slice(0, -1), "push");
  }, [navigateTo, path]);

  const focusNode = useCallback(
    (node = selectedNode) => {
      if (!children.some((child) => child.id === node.id) || !node.children?.length) {
        return;
      }

      navigateTo([...path, node.id], "push");
    },
    [children, navigateTo, path, selectedNode],
  );

  const selectSibling = useCallback(
    (offset: number) => {
      if (!children.length) {
        return;
      }

      const currentIndex = Math.max(
        0,
        children.findIndex((child) => child.id === selectedId),
      );
      const nextIndex =
        (currentIndex + offset + children.length) % children.length;
      setSelectedId(children[nextIndex].id);
    },
    [children, selectedId],
  );

  useLayoutEffect(() => {
    setSelectedId(children[0]?.id ?? currentNode.id);
  }, [childSignature, currentNode.id, children]);

  useEffect(() => {
    const onHashChange = () => {
      setPath(parseRoutePath());
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }

      if (event.key === "Escape" || event.key === "Backspace") {
        if (path.length) {
          event.preventDefault();
          goUp();
        }
        return;
      }

      if (event.key === "Enter") {
        if (selectedNode.children?.length) {
          event.preventDefault();
          focusNode(selectedNode);
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        selectSibling(-1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        selectSibling(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusNode, goUp, path.length, selectSibling, selectedNode]);

  return (
    <div
      className="app-shell"
      style={{ "--accent": currentNode.accent } as AccentStyle}
    >
      <header className="topbar">
        <a
          aria-label="Software Atlas home"
          className="brand"
          href="#/"
          onClick={(event) => {
            event.preventDefault();
            resetAtlas();
          }}
        >
          <span className="brand-mark" />
          <span>Software Atlas</span>
        </a>

        <PathTrail nodes={pathNodes} onNavigate={(index) => navigateTo(path.slice(0, index), "push")} />

        <div className="topbar-actions">
          <button
            aria-label="Move to parent node"
            className="icon-button"
            disabled={!path.length}
            onClick={goUp}
            title="Move to parent node"
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            aria-label="Reset atlas"
            className="icon-button"
            onClick={resetAtlas}
            title="Reset atlas"
            type="button"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      <main className="atlas-layout">
        <AtlasMap
          currentPath={path}
          onNavigate={(id) => navigateTo([id], "push")}
          selectedId={selectedNode.id}
        />

        <section className="stage-panel" aria-label={`${currentNode.title} canvas`}>
          <LayerStack nodes={pathNodes} />
          <NodeCanvas
            currentNode={currentNode}
            onFocus={focusNode}
            onSelect={setSelectedId}
            selectedId={selectedNode.id}
          />
        </section>

        <NodeInspector
          currentNode={currentNode}
          onFocus={() => focusNode(selectedNode)}
          onSelect={setSelectedId}
          onUp={goUp}
          pathDepth={path.length}
          selectedNode={selectedNode}
        />
      </main>

      <div className="depth-meter" aria-hidden="true">
        <Layers3 size={18} />
        <div className="meter-track">
          <span
            style={{
              width: `${Math.max(12, (pathNodes.length / 4) * 100)}%`,
            }}
          />
        </div>
        <span>{pathNodes.length - 1}</span>
      </div>
    </div>
  );
}

function PathTrail({
  nodes,
  onNavigate,
}: {
  nodes: SoftwareNode[];
  onNavigate: (index: number) => void;
}) {
  return (
    <nav className="path-trail" aria-label="Focus path">
      {nodes.map((node, index) => (
        <button
          className={index === nodes.length - 1 ? "path-node is-current" : "path-node"}
          key={`${node.id}-${index}`}
          onClick={() => onNavigate(index)}
          type="button"
        >
          <span>{index === 0 ? "Atlas" : node.title}</span>
        </button>
      ))}
    </nav>
  );
}

function AtlasMap({
  currentPath,
  onNavigate,
  selectedId,
}: {
  currentPath: string[];
  onNavigate: (id: string) => void;
  selectedId: string;
}) {
  return (
    <aside className="atlas-map" aria-label="Software types">
      <div className="panel-heading">
        <Network size={17} />
        <span>Type map</span>
      </div>
      <div className="type-list">
        {softwareAtlas.children?.map((node) => (
          <button
            className={
              currentPath[0] === node.id || selectedId === node.id
                ? "type-link is-active"
                : "type-link"
            }
            key={node.id}
            onClick={() => onNavigate(node.id)}
            style={{ "--node-accent": node.accent } as NodeStyle}
            type="button"
          >
            <span />
            <strong>{node.title}</strong>
            <small>{node.kind}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}

function LayerStack({ nodes }: { nodes: SoftwareNode[] }) {
  return (
    <div className="layer-stack" aria-hidden="true">
      {nodes.slice(0, -1).map((node, index) => (
        <div
          className="ghost-layer"
          key={`${node.id}-${index}`}
          style={
            {
              "--node-accent": node.accent,
              transform: `translate3d(${index * 18}px, ${index * 14}px, ${-260 - index * 95}px) rotateX(8deg)`,
            } as NodeStyle
          }
        >
          <span>{node.title}</span>
        </div>
      ))}
    </div>
  );
}

function NodeCanvas({
  currentNode,
  onFocus,
  onSelect,
  selectedId,
}: {
  currentNode: SoftwareNode;
  onFocus: (node: SoftwareNode) => void;
  onSelect: (id: string) => void;
  selectedId: string;
}) {
  const children = currentNode.children ?? [];
  const selectedNode =
    children.find((child) => child.id === selectedId) ?? currentNode;

  return (
    <div className="node-canvas">
      <header className="canvas-header">
        <div>
          <p>{currentNode.kind}</p>
          <h1>{currentNode.title}</h1>
        </div>
        <MetricStrip metrics={currentNode.metrics} />
      </header>

      <p className="canvas-summary">{currentNode.summary}</p>

      <div className="graph-board">
        {children.length ? (
          <>
            <EdgeLayer edges={currentNode.edges ?? []} nodes={children} />
            {children.map((child, index) => (
              <NodeButton
                index={index}
                isSelected={child.id === selectedNode.id}
                key={child.id}
                node={child}
                onDoubleClick={() => onFocus(child)}
                onSelect={() => onSelect(child.id)}
                total={children.length}
              />
            ))}
          </>
        ) : (
          <LeafSurface node={currentNode} />
        )}
      </div>
    </div>
  );
}

function EdgeLayer({
  edges,
  nodes,
}: {
  edges: SoftwareEdge[];
  nodes: SoftwareNode[];
}) {
  const fallbackEdges = nodes.slice(1).map((node, index) => ({
    from: nodes[index].id,
    to: node.id,
    label: "relates",
  }));
  const renderEdges = edges.length ? edges : fallbackEdges;

  return (
    <svg className="edge-layer" viewBox="0 0 100 100" aria-hidden="true">
      {renderEdges.map((edge) => {
        const from = nodes.find((node) => node.id === edge.from);
        const to = nodes.find((node) => node.id === edge.to);

        if (!from || !to) {
          return null;
        }

        const start = layoutFor(from, nodes.indexOf(from), nodes.length);
        const end = layoutFor(to, nodes.indexOf(to), nodes.length);
        const labelX = (start.x + end.x) / 2;
        const labelY = (start.y + end.y) / 2;

        return (
          <g key={`${edge.from}-${edge.to}-${edge.label}`}>
            <line x1={start.x} x2={end.x} y1={start.y} y2={end.y} />
            <text x={labelX} y={labelY}>
              {edge.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function NodeButton({
  index,
  isSelected,
  node,
  onDoubleClick,
  onSelect,
  total,
}: {
  index: number;
  isSelected: boolean;
  node: SoftwareNode;
  onDoubleClick: () => void;
  onSelect: () => void;
  total: number;
}) {
  const position = layoutFor(node, index, total);

  return (
    <button
      className={isSelected ? "software-node is-selected" : "software-node"}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      style={
        {
          "--node-accent": node.accent,
          left: `${position.x}%`,
          top: `${position.y}%`,
        } as NodeStyle
      }
      type="button"
    >
      <span className="node-kind">
        <CircleDot size={13} />
        {node.kind}
      </span>
      <strong>{node.title}</strong>
      <small>{node.summary}</small>
      <span className="node-footer">
        <span>{node.children?.length ?? 0} children</span>
        {node.children?.length ? <CornerDownRight size={15} /> : <CircleDot size={15} />}
      </span>
    </button>
  );
}

function LeafSurface({ node }: { node: SoftwareNode }) {
  return (
    <div className="leaf-surface">
      <div className="leaf-column">
        <span>Observable</span>
        <strong>{node.status}</strong>
        <p>{node.summary}</p>
      </div>
      <div className="leaf-column">
        <span>Contracts</span>
        <strong>{node.kind}</strong>
        <p>Interfaces, ownership, dependencies, runtime behavior, and failure modes can attach here.</p>
      </div>
      <div className="leaf-column">
        <span>Artifacts</span>
        <strong>{node.metrics.length}</strong>
        <p>Docs, traces, source files, dashboards, tests, and decisions become local node material.</p>
      </div>
    </div>
  );
}

function NodeInspector({
  currentNode,
  onFocus,
  onSelect,
  onUp,
  pathDepth,
  selectedNode,
}: {
  currentNode: SoftwareNode;
  onFocus: () => void;
  onSelect: (id: string) => void;
  onUp: () => void;
  pathDepth: number;
  selectedNode: SoftwareNode;
}) {
  const canFocus = Boolean(selectedNode.children?.length);

  return (
    <aside className="node-inspector" aria-label="Selected node">
      <div className="panel-heading">
        <Boxes size={17} />
        <span>Selected node</span>
      </div>

      <div
        className="inspector-hero"
        style={{ "--node-accent": selectedNode.accent } as NodeStyle}
      >
        <span>{selectedNode.kind}</span>
        <h2>{selectedNode.title}</h2>
        <p>{selectedNode.summary}</p>
      </div>

      <MetricStrip metrics={selectedNode.metrics} />

      <div className="inspector-actions">
        <button
          className="primary-action"
          disabled={!canFocus}
          onClick={onFocus}
          type="button"
        >
          <Focus size={17} />
          <span>Focus</span>
        </button>
        <button
          className="secondary-action"
          disabled={!pathDepth}
          onClick={onUp}
          type="button"
        >
          <ArrowLeft size={17} />
          <span>Up</span>
        </button>
      </div>

      <div className="local-children">
        <div className="panel-heading">
          <GitBranch size={17} />
          <span>Current layer</span>
        </div>
        {(currentNode.children ?? [currentNode]).map((node) => (
          <button
            className={
              node.id === selectedNode.id ? "child-row is-selected" : "child-row"
            }
            key={node.id}
            onClick={() => onSelect(node.id)}
            style={{ "--node-accent": node.accent } as NodeStyle}
            type="button"
          >
            <span />
            <strong>{node.title}</strong>
            <small>{node.children?.length ?? 0}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}

function MetricStrip({ metrics }: { metrics: SoftwareNode["metrics"] }) {
  return (
    <div className="metric-strip">
      {metrics.slice(0, 3).map((metric) => (
        <span key={`${metric.label}-${metric.value}`}>
          <small>{metric.label}</small>
          <strong>{metric.value}</strong>
        </span>
      ))}
    </div>
  );
}

function layoutFor(node: SoftwareNode, index: number, total: number) {
  if (node.layout) {
    return node.layout;
  }

  const angle = (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2;

  return {
    x: 50 + Math.cos(angle) * 32,
    y: 50 + Math.sin(angle) * 28,
  };
}

function parseRoutePath() {
  if (typeof window === "undefined") {
    return [];
  }

  const rawHash = decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  return sanitizePath(rawHash.split("/").filter(Boolean));
}

function setRoutePath(path: string[], mode: "push" | "replace") {
  const next = path.length ? `#/${path.join("/")}` : "#/";

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
