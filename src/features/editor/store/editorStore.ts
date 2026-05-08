import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type {
  Scenario,
  Step,
  StepType,
  TransitionRule,
  TransitionTarget,
  ValidationError,
} from '../../../shared/types/scenario';
import { validateScenario } from '../../../shared/lib/validation';
import { createDefaultStep } from './defaultViews';

type DrawerTab = 0 | 1 | 2; // Основное | Настройки | Переходы

type EditorState = {
  scenario: Scenario | null;
  validationErrors: ValidationError[];
  isDirty: boolean;
  openStepId: string | null;
  drawerTab: DrawerTab;
};

type EditorActions = {
  // Scenario-level
  loadScenario: (scenario: Scenario) => void;
  updateMeta: (patch: Partial<Scenario['scenario']>) => void;
  clearScenario: () => void;

  // Steps
  addStep: (type: StepType) => void;
  updateStep: (id: string, patch: Partial<Omit<Step, 'type' | 'view' | 'transitions'>>) => void;
  updateStepView: (id: string, view: Step['view']) => void;
  removeStep: (id: string) => void;
  duplicateStep: (id: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;

  // Transitions
  updateDefault: (stepId: string, patch: Partial<TransitionTarget>) => void;
  addRule: (stepId: string) => void;
  updateRule: (stepId: string, ruleIndex: number, patch: Partial<TransitionRule>) => void;
  removeRule: (stepId: string, ruleIndex: number) => void;
  reorderRules: (stepId: string, fromIndex: number, toIndex: number) => void;

  // Drawer UI
  openStep: (id: string, tab?: DrawerTab) => void;
  closeDrawer: () => void;
  setDrawerTab: (tab: DrawerTab) => void;
};

function revalidate(state: EditorState) {
  if (state.scenario) {
    state.validationErrors = validateScenario(state.scenario);
  }
}

export const useEditorStore = create<EditorState & EditorActions>()(
  immer(set => ({
    scenario: null,
    validationErrors: [],
    isDirty: false,
    openStepId: null,
    drawerTab: 0,

    loadScenario: scenario =>
      set(s => {
        // Hydrate per-step `initial` flag from scenario meta for legacy data shape
        const initialId = scenario.scenario.initialStep;
        const hydrated: Scenario = {
          ...scenario,
          scenario: { ...scenario.scenario },
          steps: scenario.steps.map(st => ({ ...st, initial: st.id === initialId })),
        };

        s.scenario = hydrated;
        s.isDirty = false;
        s.openStepId = null;
        revalidate(s);
      }),

    updateMeta: patch =>
      set(s => {
        if (!s.scenario) return;
        Object.assign(s.scenario.scenario, patch);
        s.isDirty = true;
        revalidate(s);
      }),

    clearScenario: () =>
      set(s => {
        s.scenario = null;
        s.validationErrors = [];
        s.isDirty = false;
        s.openStepId = null;
      }),

    addStep: type =>
      set(s => {
        if (!s.scenario) return;
        const step = createDefaultStep(type);
        step.id = nanoid();
        // If it's the first step (or initial not set), make it initial by default
        if (!s.scenario.scenario.initialStep) {
          step.initial = true;
          s.scenario.scenario.initialStep = step.id;
        }
        s.scenario.steps.push(step as Step);
        s.openStepId = step.id;
        s.drawerTab = 0;
        s.isDirty = true;
        revalidate(s);
      }),

    updateStep: (id, patch) =>
      set(s => {
        if (!s.scenario) return;
        const step = s.scenario.steps.find(st => st.id === id);
        if (!step) return;
        Object.assign(step, patch);

        // Keep scenario meta initialStep in sync with per-step `initial` flag.
        if ('initial' in patch) {
          if (patch.initial) {
            for (const st of s.scenario.steps) st.initial = st.id === step.id;
            s.scenario.scenario.initialStep = step.id;
          } else {
            // If user unsets the current initial step, clear meta too.
            if (s.scenario.scenario.initialStep === step.id) {
              s.scenario.scenario.initialStep = '';
            }
          }
        }

        // Keep openStepId in sync when the step's own id changes
        if ('id' in patch && patch.id && s.openStepId === id) {
          s.openStepId = patch.id as string;
        }

        // If this step is initial, update meta.initialStep when its id changes
        if ('id' in patch && patch.id) {
          const newId = patch.id as string;
          if (s.scenario.scenario.initialStep === id) {
            s.scenario.scenario.initialStep = newId;
          }
        }
        s.isDirty = true;
        revalidate(s);
      }),

    updateStepView: (id, view) =>
      set(s => {
        if (!s.scenario) return;
        const step = s.scenario.steps.find(st => st.id === id);
        if (!step) return;
        (step as Step).view = view as Step['view'];
        s.isDirty = true;
        revalidate(s);
      }),

    removeStep: id =>
      set(s => {
        if (!s.scenario) return;
        s.scenario.steps = s.scenario.steps.filter(st => st.id !== id);
        // Nullify any goto references to the removed step
        for (const st of s.scenario.steps) {
          if (st.transitions.default.goto === id) {
            st.transitions.default.goto = null;
          }
          for (const rule of st.transitions.rules ?? []) {
            if (rule.goto === id) rule.goto = null;
          }
        }
        if (s.openStepId === id) s.openStepId = null;
        s.isDirty = true;
        revalidate(s);
      }),

    duplicateStep: id =>
      set(s => {
        if (!s.scenario) return;
        const original = s.scenario.steps.find(st => st.id === id);
        if (!original) return;
        const clone = JSON.parse(JSON.stringify(original)) as Step;
        clone.id = nanoid();
        clone.title = `${clone.title} (копия)`;
        const idx = s.scenario.steps.findIndex(st => st.id === id);
        s.scenario.steps.splice(idx + 1, 0, clone);
        s.openStepId = clone.id;
        s.drawerTab = 0;
        s.isDirty = true;
        revalidate(s);
      }),

    reorderSteps: (fromIndex, toIndex) =>
      set(s => {
        if (!s.scenario) return;
        const steps = s.scenario.steps;
        const [moved] = steps.splice(fromIndex, 1);
        steps.splice(toIndex, 0, moved);
        s.isDirty = true;
      }),

    updateDefault: (stepId, patch) =>
      set(s => {
        if (!s.scenario) return;
        const step = s.scenario.steps.find(st => st.id === stepId);
        if (!step) return;
        Object.assign(step.transitions.default, patch);
        s.isDirty = true;
        revalidate(s);
      }),

    addRule: stepId =>
      set(s => {
        if (!s.scenario) return;
        const step = s.scenario.steps.find(st => st.id === stepId);
        if (!step) return;
        if (!step.transitions.rules) step.transitions.rules = [];
        step.transitions.rules.push({ condition: {}, goto: null, macro: null });
        s.isDirty = true;
        revalidate(s);
      }),

    updateRule: (stepId, ruleIndex, patch) =>
      set(s => {
        if (!s.scenario) return;
        const step = s.scenario.steps.find(st => st.id === stepId);
        if (!step?.transitions.rules) return;
        Object.assign(step.transitions.rules[ruleIndex], patch);
        s.isDirty = true;
        revalidate(s);
      }),

    removeRule: (stepId, ruleIndex) =>
      set(s => {
        if (!s.scenario) return;
        const step = s.scenario.steps.find(st => st.id === stepId);
        if (!step?.transitions.rules) return;
        step.transitions.rules.splice(ruleIndex, 1);
        s.isDirty = true;
        revalidate(s);
      }),

    reorderRules: (stepId, fromIndex, toIndex) =>
      set(s => {
        if (!s.scenario) return;
        const step = s.scenario.steps.find(st => st.id === stepId);
        if (!step?.transitions.rules) return;
        const [moved] = step.transitions.rules.splice(fromIndex, 1);
        step.transitions.rules.splice(toIndex, 0, moved);
        s.isDirty = true;
      }),

    openStep: (id, tab = 0) =>
      set(s => {
        s.openStepId = id;
        s.drawerTab = tab;
      }),

    closeDrawer: () =>
      set(s => {
        s.openStepId = null;
      }),

    setDrawerTab: tab =>
      set(s => {
        s.drawerTab = tab;
      }),
  }))
);
