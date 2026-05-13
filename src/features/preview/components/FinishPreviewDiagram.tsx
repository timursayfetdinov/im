import { useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import type { Edge, Node, OnNodeDrag } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { Scenario } from '../../../shared/types/scenario';
import { DiagramEdge } from '../../editor/components/DiagramEdge';
import { StepNode } from '../../editor/components/StepNode';
import { buildDiagramGraph, type DiagramEdgeData, type StepNodeData } from '../../editor/lib/buildDiagramGraph';

const NODE_TYPES = { stepNode: StepNode };
const EDGE_TYPES = { diagramEdge: DiagramEdge };

type NodePosition = { x: number; y: number };

function previewDiagramStorageKey(scenarioId: string) {
  return `diagram:positions:preview:${scenarioId}`;
}

function loadPreviewPositions(scenarioId: string): Record<string, NodePosition> {
  try {
    const raw = localStorage.getItem(previewDiagramStorageKey(scenarioId));
    return raw ? (JSON.parse(raw) as Record<string, NodePosition>) : {};
  } catch {
    return {};
  }
}

function savePreviewPositions(scenarioId: string, positions: Record<string, NodePosition>) {
  try {
    localStorage.setItem(previewDiagramStorageKey(scenarioId), JSON.stringify(positions));
  } catch {
    // quota / private mode
  }
}

type InnerProps = {
  scenario: Scenario;
  visitedStepIds: ReadonlySet<string>;
};

function PreviewFlowInner({ scenario, visitedStepIds }: InnerProps) {
  const scenarioId = scenario.scenario.id;
  const { fitView } = useReactFlow();
  const { nodes: builtNodes, edges: builtEdges } = useMemo(() => buildDiagramGraph(scenario), [scenario]);

  const nodesWithVisit = useMemo(() => {
    const saved = loadPreviewPositions(scenarioId);
    return builtNodes.map(
      (n): Node<StepNodeData> => ({
        ...n,
        position: saved[n.id] ?? n.position,
        data: { ...n.data, visited: visitedStepIds.has(n.id) },
      }),
    );
  }, [builtNodes, visitedStepIds, scenarioId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithVisit);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<DiagramEdgeData>>(builtEdges);

  useEffect(() => {
    setNodes(nodesWithVisit);
    setEdges(builtEdges);
  }, [nodesWithVisit, builtEdges, setNodes, setEdges]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      fitView({ padding: 0.12, duration: 220 });
    });
    return () => cancelAnimationFrame(id);
  }, [fitView, scenarioId]);

  const handleNodeDragStop: OnNodeDrag<Node<StepNodeData>> = useCallback(
    (_event, _node, draggedNodes) => {
      const saved = loadPreviewPositions(scenarioId);
      draggedNodes.forEach((n) => {
        saved[n.id] = n.position;
      });
      savePreviewPositions(scenarioId, saved);
    },
    [scenarioId],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={handleNodeDragStop}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      nodesDraggable
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      zoomOnScroll
      fitView
      fitViewOptions={{ padding: 0.12 }}
      minZoom={0.12}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
    </ReactFlow>
  );
}

type Props = {
  scenario: Scenario;
  visitedStepIds: ReadonlySet<string>;
};

/** Схема сценария на экране завершения: пройденные шаги (`visited`), узлы можно перетаскивать; позиции хранятся отдельно от редактора. */
export function FinishPreviewDiagram({ scenario, visitedStepIds }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', minHeight: 0 }}>
      <Typography variant="overline" color="text.secondary" sx={{ px: 1.5, pt: 1, flexShrink: 0 }}>
        Схема сценария
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <ReactFlowProvider>
          <PreviewFlowInner scenario={scenario} visitedStepIds={visitedStepIds} />
        </ReactFlowProvider>
      </Box>
    </Box>
  );
}
