import type { Step } from '../../../shared/types/scenario';
import type { StepValue } from './playerEngine';

/** One completed step in preview player history */
export type PlayerHistoryEntry = {
  step: Step;
  value: StepValue;
  startedAt: string;
  completedAt: string;
};
