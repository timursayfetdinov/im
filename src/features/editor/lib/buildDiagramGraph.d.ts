import type { Edge, Node } from '@xyflow/react';
import type { Scenario, Step } from '../../../shared/types/scenario';
export type StepNodeData = {
    step: Step;
    isInitial: boolean;
    isOrphan: boolean;
};
export type DiagramEdgeData = {
    condition?: Record<string, unknown>;
};
export declare function buildDiagramGraph(scenario: Scenario): {
    nodes: Node<StepNodeData>[];
    edges: Edge[];
};
