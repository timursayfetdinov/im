import type { Step, Scenario } from '../../../shared/types/scenario';
/** Value produced by each step type when the user advances. */
export type StepValue = null | string | Record<string, string[]> | string[];
/** Find the next step id (or null = scenario end) for the given step + value. */
export declare function resolveNextStep(step: Step, value: StepValue, scenario: Scenario): string | null;
/** Human-readable summary of a value for the finish-screen history. */
export declare function formatStepValue(step: Step, value: StepValue): string;
