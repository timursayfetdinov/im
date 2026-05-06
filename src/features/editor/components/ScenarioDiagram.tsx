import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import type { Node, NodeDragHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';

import type { Scenario } from '../../../shared/types/scenario';
import { buildDiagramGraph, type StepNodeData } from '../lib/buildDiagramGraph';
import { DiagramEdge } from './DiagramEdge';
import { StepNode } from './StepNode';
import { STEP_META } from '../config/stepMeta';

const NODE_TYPES = { stepNode: StepNode };
const EDGE_TYPES = { diagramEdge: DiagramEdge };

type NodePosition = { x: number; y: number };

function storageKey(scenarioId: string) {
  return `diagram:positions:${scenarioId}`;
}

function loadPositions(scenarioId: string): Record<string, NodePosition> {
  try {
    const raw = localStorage.getItem(storageKey(scenarioId));
    return raw ? (JSON.parse(raw) as Record<string, NodePosition>) : {};
  } catch {
    return {};
  }
}

function savePositions(scenarioId: string, positions: Record<string, NodePosition>) {
  try {
    localStorage.setItem(storageKey(scenarioId), JSON.stringify(positions));
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded)
  }
}

function clearPositions(scenarioId: string) {
  try {
    localStorage.removeItem(storageKey(scenarioId));
  } catch {
    // ignore
  }
}

type Props = {
  scenario: Scenario;
};

function DiagramCanvas({ scenario }: Props) {
  const scenarioId = scenario.scenario.id;
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<StepNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  // Rebuild graph on scenario change, restoring saved positions from localStorage.
  useEffect(() => {
    const { nodes: n, edges: e } = buildDiagramGraph(scenario);
    const saved = loadPositions(scenarioId);
    const merged = n.map((node) =>
      saved[node.id] ? { ...node, position: saved[node.id] } : node,
    );
    setNodes(merged);
    setEdges(e);
  }, [scenario, scenarioId, setNodes, setEdges]);

  // Persist all node positions to localStorage after each drag.
  const handleNodeDragStop: NodeDragHandler = useCallback(
    (_event, _node, draggedNodes) => {
      const saved = loadPositions(scenarioId);
      draggedNodes.forEach((n) => { saved[n.id] = n.position; });
      savePositions(scenarioId, saved);
    },
    [scenarioId],
  );

  // Auto-layout: clear saved positions and re-run dagre.
  const handleAutoLayout = useCallback(() => {
    clearPositions(scenarioId);
    const { nodes: n, edges: e } = buildDiagramGraph(scenario);
    setNodes(n);
    setEdges(e);
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 30);
  }, [scenario, scenarioId, setNodes, setEdges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={handleNodeDragStop}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnScroll
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          const step = (node.data as { step: { type: string } }).step;
          return STEP_META[step.type as keyof typeof STEP_META]?.color ?? '#94a3b8';
        }}
        zoomable
        pannable
      />
      <Panel position="top-right">
        <Tooltip title="Авто-расстановка узлов">
          <IconButton
            size="small"
            onClick={handleAutoLayout}
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <AccountTreeOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Panel>
    </ReactFlow>
  );
}

export function ScenarioDiagram({ scenario }: Props) {
  return (
    <ReactFlowProvider>
      <DiagramCanvas scenario={scenario} />
    </ReactFlowProvider>
  );
}
