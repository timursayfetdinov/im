import type { Step, Scenario } from '../../../shared/types/scenario';
import { buildContext, evaluateCondition } from '../../../shared/lib/jsonLogic';

/** Value produced by each step type when the user advances. */
export type StepValue =
  | null                      // Button, Image (no meaningful value)
  | string                    // Comment (text), Datetime (ISO string), RadioButton (option id)
  | Record<string, string[]>  // Select: { listId: [optionId, ...] }
  | string[];                 // Checkbox: selected option ids

/** Find the next step id (or null = scenario end) for the given step + value. */
export function resolveNextStep(step: Step, value: StepValue, scenario: Scenario): string | null {
  const rules = step.transitions.rules ?? [];

  // Only RadioButton / Select / Checkbox can have meaningful branching conditions
  if (
    (step.type === 'RadioButton' || step.type === 'Select' || step.type === 'Checkbox') &&
    rules.length > 0
  ) {
    const context = buildContext(step.type, value);
    for (const rule of rules) {
      if (Object.keys(rule.condition).length > 0 && evaluateCondition(rule.condition, context)) {
        return rule.goto;
      }
    }
  }

  return step.transitions.default.goto;
}

/** Human-readable summary of a value for the finish-screen history. */
export function formatStepValue(step: Step, value: StepValue): string {
  if (value === null) return '—';
  switch (step.type) {
    case 'Button':
      return `(нажата: ${step.view.label})`;
    case 'Comment':
      return typeof value === 'string' && value ? value : '(пусто)';
    case 'Datetime':
      if (typeof value === 'string' && value) {
        try {
          return new Date(value).toLocaleString('ru-RU');
        } catch {
          return value;
        }
      }
      return '(не выбрано)';
    case 'Image':
      return '(фото)';
    case 'RadioButton': {
      if (typeof value !== 'string') return '—';
      const opt = step.view.options.find((o) => o.id === value);
      return opt?.label ?? value;
    }
    case 'Select': {
      if (typeof value !== 'object' || Array.isArray(value)) return '—';
      return step.view.lists
        .map((list) => {
          const selected = (value as Record<string, string[]>)[list.id] ?? [];
          if (selected.length === 0) return `${list.label}: —`;
          const labels = selected
            .map((id) => list.options.find((o) => o.id === id)?.label ?? id)
            .join(', ');
          return `${list.label}: ${labels}`;
        })
        .join(' | ');
    }
    case 'Checkbox': {
      const ids = Array.isArray(value) ? (value as string[]) : [];
      if (ids.length === 0) return '(ничего не выбрано)';
      return ids
        .map((id) => step.view.options.find((o) => o.id === id)?.label ?? id)
        .join(', ');
    }
    default:
      return String(value);
  }
}
