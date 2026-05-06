import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';

import type { Scenario, Step } from '../../../shared/types/scenario';

// ─── Types ───────────────────────────────────────────────────────────────────

export type StepNodeData = {
  step: Step;
  isInitial: boolean;
  isOrphan: boolean;
};

export type DiagramEdgeData = {
  condition?: Record<string, unknown>;
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

// ─── Condition humanizer ─────────────────────────────────────────────────────

function buildOptionMap(step: Step): Map<string, string> {
  const map = new Map<string, string>();
  if (step.type === 'RadioButton' || step.type === 'Checkbox') {
    step.view.options.forEach((o) => map.set(o.id, o.label));
  } else if (step.type === 'Select') {
    step.view.lists.forEach((list) => {
      map.set(list.id, list.label);
      list.options.forEach((o) => map.set(o.id, o.label));
    });
  }
  return map;
}

function replaceIds(value: unknown, map: Map<string, string>): unknown {
  if (typeof value === 'string') return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map((v) => replaceIds(v, map));
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, replaceIds(v, map)]),
    );
  }
  return value;
}

function humanizeCondition(
  step: Step,
  condition: Record<string, unknown>,
): Record<string, unknown> {
  const map = buildOptionMap(step);
  return replaceIds(condition, map) as Record<string, unknown>;
}

// ─── Edge label helpers ───────────────────────────────────────────────────────

function ruleLabel(step: Step, ruleIndex: number): string {
  const rule = step.transitions.rules?.[ruleIndex];
  if (!rule) return '';

  if (step.type === 'RadioButton') {
    const cond = rule.condition as Record<string, unknown>;
    const eqOp = cond['=='];
    if (Array.isArray(eqOp) && eqOp.length === 2) {
      const optId = String(eqOp[1]);
      const opt = step.view.options.find((o) => o.id === optId);
      return opt?.label ?? optId;
    }
  }

  if (step.type === 'Checkbox') {
    const cond = rule.condition as Record<string, unknown>;
    const someOp = cond['some'];
    if (Array.isArray(someOp)) {
      return `вариант выбран`;
    }
  }

  return `правило ${ruleIndex + 1}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function buildDiagramGraph(scenario: Scenario): {
  nodes: Node<StepNodeData>[];
  edges: Edge[];
} {
  const { steps, scenario: meta } = scenario;
  const initialStepId = meta.initialStep;

  // 1. Collect all reachable step IDs to detect orphans
  const reachableIds = new Set<string>([initialStepId]);
  for (const step of steps) {
    if (step.transitions.default.goto) reachableIds.add(step.transitions.default.goto);
    for (const rule of step.transitions.rules ?? []) {
      if (rule.goto) reachableIds.add(rule.goto);
    }
  }

  // 2. Build edges
  const edges: Edge<DiagramEdgeData>[] = [];

  for (const step of steps) {
    const { default: def, rules = [] } = step.transitions;

    // Conditional rule edges
    rules.forEach((rule, i) => {
      if (!rule.goto) return;
      edges.push({
        id: `${step.id}__rule${i}__${rule.goto}`,
        source: step.id,
        sourceHandle: `rule-${i}`,
        target: rule.goto,
        label: ruleLabel(step, i),
        type: 'diagramEdge',
        data: { condition: humanizeCondition(step, rule.condition as Record<string, unknown>) },
        style: { stroke: '#f59e0b', strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: '#92400e' },
        labelBgStyle: { fill: '#fef3c7', fillOpacity: 0.9 },
        animated: false,
      });
    });

    // Default edge
    if (def.goto) {
      edges.push({
        id: `${step.id}__default__${def.goto}`,
        source: step.id,
        sourceHandle: 'default',
        target: def.goto,
        label: rules.length > 0 ? 'по умолчанию' : undefined,
        type: 'diagramEdge',
        data: {},
        style: { stroke: '#64748b', strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: '#475569' },
        labelBgStyle: { fill: '#f1f5f9', fillOpacity: 0.9 },
      });
    }
  }

  // 3. Dagre layout
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80, marginx: 40, marginy: 40 });

  for (const step of steps) {
    g.setNode(step.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  // 4. Build nodes with computed positions
  const nodes: Node<StepNodeData>[] = steps.map((step) => {
    const pos = g.node(step.id);
    return {
      id: step.id,
      type: 'stepNode',
      position: {
        x: pos ? pos.x - NODE_WIDTH / 2 : 0,
        y: pos ? pos.y - NODE_HEIGHT / 2 : 0,
      },
      data: {
        step,
        isInitial: step.id === initialStepId,
        isOrphan: !reachableIds.has(step.id),
      },
    };
  });

  return { nodes, edges };
}
