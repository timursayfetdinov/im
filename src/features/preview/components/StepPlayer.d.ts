import type { Step } from '../../../shared/types/scenario';
import type { StepValue } from '../lib/playerEngine';
type StepPlayerProps = {
    step: Step;
    onAdvance: (value: StepValue) => void;
};
export declare function StepPlayer({ step, onAdvance }: StepPlayerProps): import("react/jsx-runtime").JSX.Element;
export {};
