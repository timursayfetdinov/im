// ─── Option / List ────────────────────────────────────────────────────────────

export type Option = {
  id: string;
  label: string;
};

export type SelectList = {
  id: string;
  label: string;
  options: Option[];
};

// ─── Step types ───────────────────────────────────────────────────────────────

export type StepType =
  | 'Button'
  | 'Comment'
  | 'Datetime'
  | 'Image'
  | 'RadioButton'
  | 'Select'
  | 'Checkbox';

// ─── View objects (type-specific fields) ─────────────────────────────────────

export type ButtonView = {
  label: string;
};

export type CommentView = {
  label: string;
  default: string;
  required: boolean;
  readonly: boolean;
  minLength: number;
  maxLength: number;
};

export type DatetimeView = {
  label: string;
  required: boolean;
  min: string | null;
  max: string | null;
};

export type ImageSource = 'camera' | 'map' | 'operator' | 'fixed';

export type ImageView = {
  label: string;
  source: ImageSource;
  image: string | null;
};

export type RadioButtonView = {
  label: string;
  required: boolean;
  default: string | null;
  options: Option[];
};

export type CheckboxOption = Option & {
  default: boolean;
};

export type CheckboxView = {
  label: string;
  minSelected: number;
  maxSelected: number | null;
  options: CheckboxOption[];
};

export type SelectView = {
  required: boolean;
  lists: SelectList[];
};

// ─── Transitions ──────────────────────────────────────────────────────────────

/** JSONLogic condition object — evaluated against per-type context */
export type JsonLogicCondition = Record<string, unknown>;

export type Macro = {
  name: string;
  args: Record<string, unknown>;
};

export type TransitionTarget = {
  goto: string | null;
  macro: Macro | null;
};

export type TransitionRule = TransitionTarget & {
  condition: JsonLogicCondition;
};

export type Transitions = {
  default: TransitionTarget;
  rules?: TransitionRule[];
};

// ─── Steps (discriminated union) ─────────────────────────────────────────────

type StepBase = {
  id: string;
  title: string;
  description: string;
  editable: boolean;
  multitasking: boolean;
  report: boolean;
  finish: boolean;
  /** Начальный шаг сценария (в UI выбирается на шаге) */
  initial: boolean;
  transitions: Transitions;
};

export type ButtonStep = StepBase & { type: 'Button'; view: ButtonView };
export type CommentStep = StepBase & { type: 'Comment'; view: CommentView };
export type DatetimeStep = StepBase & { type: 'Datetime'; view: DatetimeView };
export type ImageStep = StepBase & { type: 'Image'; view: ImageView };
export type RadioButtonStep = StepBase & { type: 'RadioButton'; view: RadioButtonView };
export type SelectStep = StepBase & { type: 'Select'; view: SelectView };
export type CheckboxStep = StepBase & { type: 'Checkbox'; view: CheckboxView };

export type Step =
  | ButtonStep
  | CommentStep
  | DatetimeStep
  | ImageStep
  | RadioButtonStep
  | SelectStep
  | CheckboxStep;

// ─── Scenario ─────────────────────────────────────────────────────────────────

export type ScenarioMeta = {
  id: string;
  name: string;
  description: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  initialStep: string;
};

export type Scenario = {
  scenario: ScenarioMeta;
  steps: Step[];
};

// ─── Validation ───────────────────────────────────────────────────────────────

export type ValidationErrorCode =
  | 'DUPLICATE_STEP_ID'
  | 'INVALID_INITIAL_STEP'
  | 'INVALID_GOTO'
  | 'GOTO_NULL_WITHOUT_FINISH'
  | 'DUPLICATE_OPTION_ID'
  | 'INVALID_CONDITION_OPTION_ID'
  | 'INVALID_CONDITION_LIST_KEY'
  | 'STEP_NOT_REACHABLE'
  | 'NO_FINISH_STEP'
  | 'EMPTY_STEP_ID'
  | 'EMPTY_STEP_TITLE'
  | 'EMPTY_INITIAL_STEP';

export type ValidationError = {
  code: ValidationErrorCode;
  message: string;
  stepId?: string;
  field?: string;
  ruleIndex?: number;
};
