import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { RoadmapDef, RoadmapNodeData } from '../../data/roadmaps';

// ─── Catppuccin Frappé palette (hex) ─────────────────────────────────────────
const C = {
  base: '#303446',
  mantle: '#292c3c',
  crust: '#232634',
  surface0: '#414559',
  surface1: '#51576d',
  surface2: '#626880',
  text: '#c6d0f5',
  subtext1: '#b5bfe2',
  subtext0: '#a5adce',
  overlay1: '#838ba7',
  blue: '#8caaee',
  lavender: '#babbf1',
  sapphire: '#85c1dc',
  green: '#a6d189',
  yellow: '#e5c890',
  peach: '#ef9f76',
  red: '#e78284',
  mauve: '#ca9ee6',
  pink: '#f4b8e4',
  teal: '#81c8be',
} as const;

// ─── Difficulty colors ────────────────────────────────────────────────────────
const difficultyColor: Record<string, string> = {
  beginner: C.green,
  intermediate: C.yellow,
  advanced: C.red,
};

const difficultyLabel: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

// ─── Custom Node ──────────────────────────────────────────────────────────────
interface CustomNodeProps extends NodeProps {
  data: RoadmapNodeData & { completed?: boolean; accent?: string };
}

function CustomNode({ data, selected }: CustomNodeProps) {
  const diffColor = difficultyColor[data.difficulty] ?? C.blue;
  const isCompleted = data.completed ?? false;
  const isStart = data.type === 'start';
  const isMilestone = data.type === 'milestone';

  const borderStyle = isCompleted
    ? `2px solid ${data.accent ?? diffColor}`
    : `1.5px dashed ${C.surface1}`;

  const bgColor = isCompleted
    ? `${data.accent ?? diffColor}18`
    : isStart
    ? `${C.surface0}cc`
    : C.surface0;

  const nodeShape: React.CSSProperties = isMilestone
    ? { borderRadius: '16px' }
    : isStart
    ? { borderRadius: '12px' }
    : { borderRadius: '10px' };

  return (
    <div
      style={{
        background: bgColor,
        border: selected ? `2px solid ${C.lavender}` : borderStyle,
        padding: '12px 16px',
        minWidth: '160px',
        maxWidth: '200px',
        cursor: 'pointer',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        boxShadow: isCompleted
          ? `0 0 14px ${data.accent ?? diffColor}30, 0 4px 12px rgba(0,0,0,0.3)`
          : selected
          ? `0 0 12px ${C.lavender}40, 0 4px 12px rgba(0,0,0,0.3)`
          : '0 4px 12px rgba(0,0,0,0.25)',
        position: 'relative',
        ...nodeShape,
      }}
      className="roadmap-node"
    >
      {/* Top accent glow for start nodes */}
      {isStart && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${C.blue}, ${C.lavender}, ${C.mauve})`,
            borderRadius: '10px 10px 0 0',
          }}
        />
      )}

      {/* Milestone diamond accent */}
      {isMilestone && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${data.accent ?? C.peach}, ${C.lavender})`,
            borderRadius: '16px 16px 0 0',
          }}
        />
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: C.surface1, border: `1px solid ${C.surface2}`, width: 8, height: 8 }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        {/* Difficulty dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: diffColor,
            marginTop: 5,
            flexShrink: 0,
            boxShadow: `0 0 6px ${diffColor}80`,
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: C.text,
              lineHeight: 1.3,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ flex: 1 }}>{data.label}</span>
            {isCompleted && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: data.accent ?? diffColor,
                  color: C.crust,
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: C.overlay1,
              marginTop: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Fase {data.phase} · {isMilestone ? 'Hito' : isStart ? 'Inicio' : 'Concepto'}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: C.surface1, border: `1px solid ${C.surface2}`, width: 8, height: 8 }}
      />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

// ─── Info Panel ───────────────────────────────────────────────────────────────
interface InfoPanelProps {
  node: Node | null;
  accent: string;
  completedIds: Set<string>;
  onToggleComplete: (id: string) => void;
  onClose: () => void;
}

function InfoPanel({ node, accent, completedIds, onToggleComplete, onClose }: InfoPanelProps) {
  const isOpen = node !== null;
  const data = node?.data as (RoadmapNodeData & { completed?: boolean; accent?: string }) | undefined;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '300px',
        background: C.mantle,
        borderLeft: `1px solid ${C.surface1}`,
        zIndex: 10,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: isOpen ? 'auto' : 'none',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {data && (
        <>
          {/* Header */}
          <div
            style={{
              padding: '20px 20px 16px',
              borderBottom: `1px solid ${C.surface1}`,
              background: `${accent}10`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: accent,
                    fontWeight: 600,
                    marginBottom: '4px',
                  }}
                >
                  Fase {data.phase}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.2 }}>
                  {data.label}
                </h3>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: C.surface0,
                  border: `1px solid ${C.surface1}`,
                  borderRadius: '8px',
                  color: C.subtext1,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  flexShrink: 0,
                }}
                aria-label="Cerrar panel"
              >
                ×
              </button>
            </div>

            {/* Difficulty badge */}
            <div style={{ marginTop: '10px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: `${difficultyColor[data.difficulty]}20`,
                  color: difficultyColor[data.difficulty],
                  border: `1px solid ${difficultyColor[data.difficulty]}40`,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: difficultyColor[data.difficulty],
                  }}
                />
                {difficultyLabel[data.difficulty]}
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <p style={{ fontSize: '14px', color: C.subtext1, lineHeight: 1.6, margin: '0 0 20px' }}>
              {data.description}
            </p>

            {/* DevVault link */}
            {data.devvaultLink && (
              <a
                href={data.devvaultLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: `${accent}18`,
                  border: `1px solid ${accent}40`,
                  color: accent,
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginBottom: '20px',
                  transition: 'background 150ms ease',
                }}
              >
                <span>🔍</span>
                <span>Ver en DevVault</span>
                <span style={{ marginLeft: 'auto', opacity: 0.7 }}>→</span>
              </a>
            )}

            {/* Resources */}
            {data.resources && data.resources.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: C.overlay1,
                    fontWeight: 600,
                    marginBottom: '10px',
                  }}
                >
                  Recursos
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {data.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: C.surface0,
                        border: `1px solid ${C.surface1}`,
                        color: C.text,
                        fontSize: '13px',
                        textDecoration: 'none',
                        transition: 'border-color 150ms ease',
                      }}
                    >
                      <span style={{ color: C.blue, flexShrink: 0 }}>↗</span>
                      <span style={{ flex: 1 }}>{r.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer — Complete toggle */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: `1px solid ${C.surface1}`,
            }}
          >
            <button
              onClick={() => node && onToggleComplete(node.id)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: `2px solid ${
                  node && completedIds.has(node.id) ? accent : C.surface1
                }`,
                background: node && completedIds.has(node.id) ? `${accent}20` : C.surface0,
                color: node && completedIds.has(node.id) ? accent : C.subtext1,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 200ms ease',
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '6px',
                  border: `2px solid ${
                    node && completedIds.has(node.id) ? accent : C.surface2
                  }`,
                  background: node && completedIds.has(node.id) ? accent : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: C.crust,
                  fontWeight: 700,
                }}
              >
                {node && completedIds.has(node.id) ? '✓' : ''}
              </span>
              {node && completedIds.has(node.id) ? 'Completado' : 'Marcar como completado'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({
  completed,
  total,
  accent,
}: {
  completed: number;
  total: number;
  accent: string;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      style={{
        padding: '10px 16px',
        background: C.mantle,
        borderBottom: `1px solid ${C.surface1}`,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: '6px',
            background: C.surface0,
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${accent}, ${C.lavender})`,
              borderRadius: '99px',
              transition: 'width 400ms cubic-bezier(0.22, 1, 0.36, 1)',
              boxShadow: `0 0 8px ${accent}60`,
            }}
          />
        </div>
      </div>
      <div style={{ fontSize: '13px', color: C.subtext1, whiteSpace: 'nowrap', flexShrink: 0 }}>
        <span style={{ color: accent, fontWeight: 700 }}>{completed}</span>
        <span style={{ color: C.overlay1 }}> / {total} nodos</span>
        <span
          style={{
            marginLeft: '8px',
            padding: '1px 7px',
            borderRadius: '99px',
            background: `${accent}20`,
            color: accent,
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ─── Main Canvas ──────────────────────────────────────────────────────────────
interface RoadmapCanvasProps {
  roadmap: RoadmapDef;
  slug: string;
}

export default function RoadmapCanvas({ roadmap, slug }: RoadmapCanvasProps) {
  const storageKey = `devvault-roadmap-${slug}`;
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Build RF nodes with completion & accent data
  const buildNodes = useCallback(
    (completed: Set<string>): Node[] =>
      roadmap.nodes.map((n) => ({
        id: n.id,
        position: n.position,
        type: 'custom',
        data: {
          ...n.data,
          completed: completed.has(n.id),
          accent: roadmap.accent,
        },
      })),
    [roadmap.nodes, roadmap.accent]
  );

  const buildEdges = useCallback(
    (): Edge[] =>
      roadmap.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated ?? false,
        type: 'smoothstep',
        style: {
          stroke: e.animated ? roadmap.accent : C.surface2,
          strokeWidth: e.animated ? 2 : 1.5,
          opacity: e.animated ? 0.8 : 0.5,
        },
        markerEnd: {
          type: 'arrowclosed' as const,
          color: e.animated ? roadmap.accent : C.surface2,
          width: 16,
          height: 16,
        },
      })),
    [roadmap.edges, roadmap.accent]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes(completedIds));
  const [edges, , onEdgesChange] = useEdgesState(buildEdges());

  // Sync nodes when completedIds changes
  useEffect(() => {
    setNodes(buildNodes(completedIds));
  }, [completedIds, buildNodes, setNodes]);

  const persistCompleted = useCallback(
    (next: Set<string>) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // ignore
      }
    },
    [storageKey]
  );

  const handleToggleComplete = useCallback(
    (id: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        persistCompleted(next);
        return next;
      });
      // Update selected node display
      setSelectedNode((prev) => {
        if (!prev || prev.id !== id) return prev;
        return { ...prev };
      });
    },
    [persistCompleted]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ProgressBar
        completed={completedIds.size}
        total={roadmap.nodes.length}
        accent={roadmap.accent}
      />

      <div style={{ flex: 1, position: 'relative' }}>
        <style>{`
          .react-flow__background { background: ${C.base}; }
          .react-flow__controls { border-radius: 10px; overflow: hidden; border: 1px solid ${C.surface1}; }
          .react-flow__controls-button { background: ${C.mantle} !important; border-bottom: 1px solid ${C.surface1} !important; color: ${C.subtext1} !important; fill: ${C.subtext1} !important; transition: background 150ms ease; }
          .react-flow__controls-button:hover { background: ${C.surface0} !important; }
          .react-flow__controls-button svg { fill: ${C.subtext1}; }
          .react-flow__minimap { border-radius: 10px; border: 1px solid ${C.surface1}; overflow: hidden; }
          .react-flow__panel { z-index: 5; }
          .roadmap-node:hover { transform: scale(1.04) !important; }
          .react-flow__edge-path { transition: stroke 200ms ease; }
          .react-flow__attribution { display: none; }
        `}</style>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={1.8}
          style={{ background: C.base }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.2}
            color={C.surface0}
          />
          <Controls
            position="bottom-left"
            style={{ bottom: 16, left: 16 }}
            showInteractive={false}
          />
          <MiniMap
            position="bottom-right"
            style={{ bottom: 16, right: selectedNode ? 316 : 16, background: C.mantle, transition: 'right 280ms cubic-bezier(0.22, 1, 0.36, 1)' }}
            nodeColor={(n) => {
              const data = n.data as RoadmapNodeData & { completed?: boolean };
              if (data.completed) return roadmap.accent;
              return difficultyColor[data.difficulty] ?? C.blue;
            }}
            maskColor={`${C.mantle}cc`}
          />
        </ReactFlow>

        {/* Info Panel overlay */}
        <InfoPanel
          node={selectedNode}
          accent={roadmap.accent}
          completedIds={completedIds}
          onToggleComplete={handleToggleComplete}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
}
