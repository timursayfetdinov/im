import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { StepType } from '../../../shared/types/scenario';
export type StepMeta = {
    type: StepType;
    label: string;
    description: string;
    color: string;
    Icon: React.ComponentType<SvgIconProps>;
};
export declare const STEP_META: Record<StepType, StepMeta>;
export declare const STEP_TYPES: StepMeta[];
