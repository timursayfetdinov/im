import type { Step } from '../../../shared/types/scenario';
type Props = {
    step: Step;
};
/**
 * «Основное» tab rendered inside StepDrawer.
 * Mounts fresh for each step (key={step.id} in parent), so defaultValues are always correct.
 */
export declare function StepBasicTab({ step }: Props): import("react/jsx-runtime").JSX.Element;
export {};
