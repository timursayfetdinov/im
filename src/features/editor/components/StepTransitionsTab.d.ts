import type { Step } from '../../../shared/types/scenario';
/**
 * «Переходы» tab rendered inside StepDrawer.
 * Mounted fresh per step via key={step.id} in StepDrawer.
 */
export declare function StepTransitionsTab({ step }: {
    step: Step;
}): import("react/jsx-runtime").JSX.Element;
