import type { StepType } from '../../../shared/types/scenario';
type Props = {
    open: boolean;
    onClose: () => void;
    onSelect: (type: StepType) => void;
};
export declare function AddStepDialog({ open, onClose, onSelect }: Props): import("react/jsx-runtime").JSX.Element;
export {};
