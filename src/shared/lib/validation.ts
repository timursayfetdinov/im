import type { Scenario, Step, ValidationError } from '../types/scenario';

export function validateScenario(scenario: Scenario): ValidationError[] {
  const errors: ValidationError[] = [];
  const { steps, scenario: meta } = scenario;

  const resolvedInitial = meta.initialStep;

  // Rule 9: At least one finish step
  if (!steps.some(s => s.finish)) {
    errors.push({ code: 'NO_FINISH_STEP', message: 'Сценарий должен содержать хотя бы один финальный шаг (finish: true)' });
  }

  if (!meta.initialStep) {
    errors.push({ code: 'EMPTY_INITIAL_STEP', message: 'Не указан начальный шаг сценария', field: 'initialStep' });
  }

  const stepIds = new Set<string>();
  const seenIds = new Set<string>();

  for (const step of steps) {
    // Rule: empty id / title
    if (!step.id) {
      errors.push({ code: 'EMPTY_STEP_ID', message: 'ID шага не может быть пустым', stepId: step.id, field: 'id' });
    }
    if (!step.title) {
      errors.push({ code: 'EMPTY_STEP_TITLE', message: 'Название шага не может быть пустым', stepId: step.id, field: 'title' });
    }

    // Rule 1: Unique step ids
    if (step.id) {
      if (seenIds.has(step.id)) {
        errors.push({ code: 'DUPLICATE_STEP_ID', message: `Дублирующийся ID шага: "${step.id}"`, stepId: step.id, field: 'id' });
      }
      seenIds.add(step.id);
      stepIds.add(step.id);
    }
  }

  // Rule 2: initialStep references existing step
  if (resolvedInitial && !stepIds.has(resolvedInitial)) {
    errors.push({
      code: 'INVALID_INITIAL_STEP',
      message: `Начальный шаг "${resolvedInitial}" не найден среди шагов`,
      field: 'initialStep',
    });
  }

  for (const step of steps) {
    const allRules = step.transitions.rules ?? [];
    const allTargets = [step.transitions.default, ...allRules];

    for (let i = 0; i < allTargets.length; i++) {
      const target = allTargets[i];
      const isRule = i > 0;
      const ruleIndex = isRule ? i - 1 : undefined;

      // Rule 3: goto references existing step
      if (target.goto !== null && !stepIds.has(target.goto)) {
        errors.push({
          code: 'INVALID_GOTO',
          message: `Шаг "${step.id}": переход к несуществующему шагу "${target.goto}"`,
          stepId: step.id,
          field: 'transitions',
          ruleIndex,
        });
      }

      // Rule 4: goto null requires finish: true
      if (target.goto === null && !step.finish) {
        errors.push({
          code: 'GOTO_NULL_WITHOUT_FINISH',
          message: `Шаг "${step.id}": goto: null возможен только при finish: true`,
          stepId: step.id,
          field: 'finish',
          ruleIndex,
        });
      }
    }

    // Rule 5 & 6 & 7: Option ids and condition references
    checkStepOptions(step, errors);
  }

  // Rule 8: All steps reachable from initialStep
  if (resolvedInitial && stepIds.has(resolvedInitial)) {
    const reachable = getReachableSteps(resolvedInitial, steps);
    for (const step of steps) {
      if (step.id && !reachable.has(step.id) && step.id !== resolvedInitial) {
        errors.push({
          code: 'STEP_NOT_REACHABLE',
          message: `Шаг "${step.id}" недостижим из начального шага`,
          stepId: step.id,
        });
      }
    }
  }

  return errors;
}

function checkStepOptions(step: Step, errors: ValidationError[]) {
  if (step.type === 'RadioButton' || step.type === 'Checkbox') {
    const optionIds = new Set<string>();
    const seen = new Set<string>();
    for (const opt of step.view.options) {
      if (seen.has(opt.id)) {
        errors.push({
          code: 'DUPLICATE_OPTION_ID',
          message: `Шаг "${step.id}": дублирующийся id опции "${opt.id}"`,
          stepId: step.id,
          field: 'view.options',
        });
      }
      seen.add(opt.id);
      optionIds.add(opt.id);
    }

    for (let i = 0; i < (step.transitions.rules ?? []).length; i++) {
      const rule = step.transitions.rules![i];
      checkConditionOptionIds(step.id, rule.condition, optionIds, errors, i);
    }
  }

  if (step.type === 'Select') {
    const listIds = new Set(step.view.lists.map(l => l.id));
    for (const list of step.view.lists) {
      const optionIds = new Set<string>();
      const seen = new Set<string>();
      for (const opt of list.options) {
        if (seen.has(opt.id)) {
          errors.push({
            code: 'DUPLICATE_OPTION_ID',
            message: `Шаг "${step.id}", список "${list.id}": дублирующийся id опции "${opt.id}"`,
            stepId: step.id,
            field: `view.lists.${list.id}.options`,
          });
        }
        seen.add(opt.id);
        optionIds.add(opt.id);
      }
    }

    for (let i = 0; i < (step.transitions.rules ?? []).length; i++) {
      const rule = step.transitions.rules![i];
      checkConditionListKeys(step.id, rule.condition, listIds, errors, i);
    }
  }
}

function checkConditionOptionIds(
  stepId: string,
  condition: Record<string, unknown>,
  validIds: Set<string>,
  errors: ValidationError[],
  ruleIndex: number
) {
  const json = JSON.stringify(condition);
  const refs = extractStringValues(condition);
  for (const ref of refs) {
    if (ref && !validIds.has(ref) && !isOperator(ref)) {
      errors.push({
        code: 'INVALID_CONDITION_OPTION_ID',
        message: `Шаг "${stepId}", правило ${ruleIndex + 1}: ID опции "${ref}" не существует`,
        stepId,
        field: 'transitions',
        ruleIndex,
      });
    }
  }
  void json;
}

function checkConditionListKeys(
  stepId: string,
  condition: Record<string, unknown>,
  validListIds: Set<string>,
  errors: ValidationError[],
  ruleIndex: number
) {
  const varRefs = extractVarRefs(condition);
  for (const ref of varRefs) {
    if (!validListIds.has(ref)) {
      errors.push({
        code: 'INVALID_CONDITION_LIST_KEY',
        message: `Шаг "${stepId}", правило ${ruleIndex + 1}: ключ списка "${ref}" не существует`,
        stepId,
        field: 'transitions',
        ruleIndex,
      });
    }
  }
}

function extractStringValues(obj: unknown): string[] {
  if (typeof obj === 'string') return [obj];
  if (Array.isArray(obj)) return obj.flatMap(extractStringValues);
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj as Record<string, unknown>).flatMap(extractStringValues);
  }
  return [];
}

function extractVarRefs(obj: unknown): string[] {
  if (typeof obj !== 'object' || obj === null) return [];
  const o = obj as Record<string, unknown>;
  if ('var' in o && typeof o.var === 'string') return [o.var];
  return Object.values(o).flatMap(extractVarRefs);
}

function isOperator(s: string): boolean {
  return ['value', 'selected', 'accumulator', 'current'].includes(s);
}

function getReachableSteps(initialStepId: string, steps: Step[]): Set<string> {
  const stepMap = new Map(steps.map(s => [s.id, s]));
  const reachable = new Set<string>();
  const queue = [initialStepId];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);

    const step = stepMap.get(id);
    if (!step) continue;

    const targets = [
      step.transitions.default.goto,
      ...(step.transitions.rules ?? []).map(r => r.goto),
    ];

    for (const goto of targets) {
      if (goto && !reachable.has(goto)) {
        queue.push(goto);
      }
    }
  }

  return reachable;
}
