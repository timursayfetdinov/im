import type { Step } from '../../../shared/types/scenario';
/**
 * «Настройки» tab — type-specific view fields for each step type.
 * Mounted fresh per step via key={step.id} in StepDrawer.
 */
export declare function StepSettingsTab({ step }: {
    step: Step;
}): import("react/jsx-runtime").JSX.Element;
