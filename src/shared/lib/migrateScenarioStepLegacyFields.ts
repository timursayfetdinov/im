/**
 * Normalizes deprecated step fields in parsed JSON before Zod parse / editor load.
 * - Drops legacy `initial` (replaced by scenario.initialStep).
 * - Renames legacy `editable` → `revisitable` when `revisitable` is absent.
 */
export function migrateScenarioStepLegacyFields(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  const root = data as { steps?: unknown[] };
  if (!Array.isArray(root.steps)) return data;
  return {
    ...root,
    steps: root.steps.map(normalizeStepRecord),
  };
}

function normalizeStepRecord(step: unknown): unknown {
  if (!step || typeof step !== 'object') return step;
  const x = { ...(step as Record<string, unknown>) };
  delete x.initial;
  if (!('revisitable' in x) && 'editable' in x && typeof x.editable === 'boolean') {
    x.revisitable = x.editable;
  }
  delete x.editable;
  return x;
}
