import jsonLogic from 'json-logic-js';
import type { JsonLogicCondition } from '../types/scenario';

// ─── Multi-select operator extensions ────────────────────────────────────────
//
// Select steps produce { listId: string[] } contexts (multiple selection).
// Standard JSONLogic operators use JavaScript loose equality/coercion with arrays
// which gives wrong results:
//
//   []  != "optId"     →  "" != "optId"  → true  (ALWAYS, even with empty selection)
//   ["a","b"] != "a"   →  "a,b" != "a"  → true  (even though "a" IS selected)
//
// We override ==, !=, and in once at module load time to use Set-membership
// semantics for array-vs-scalar comparisons:
//
//   ==([a,b],  "a")    → true   (array contains scalar)
//   ==("a",    "b")    → false  (original behaviour, unchanged)
//   !=([a,b],  "a")    → false  (array contains scalar → NOT different)
//   !=([a,b],  "c")    → true   (array does NOT contain scalar)
//
// For array-vs-array in(needle, haystack):
//   Semantics: ALL values from haystack (condition) must be present in needle (selection).
//   i.e. haystack ⊆ needle — "the user must have selected AT LEAST all specified values".
//
//   in([a,b],   [a,b])  → true  (user selected exactly a and b, all required)
//   in([a,b,c], [a,b])  → true  (user selected a and b plus extra, all required present)
//   in([a],     [a,b])  → false (user only selected a, b is required but missing)
//   in([],      [a,b])  → false (nothing selected, requirements not met)
//   in([a,b],   [])     → false (empty condition never matches)
//   in("a",     [a,b])  → true  (scalar, original behaviour)

jsonLogic.add_operation('in', (needle: unknown, haystack: unknown): boolean => {
  if (Array.isArray(haystack)) {
    if (Array.isArray(needle)) {
      // Both arrays: ALL condition values (haystack) must appear in the selection (needle).
      // Empty condition or empty selection → no match.
      if (haystack.length === 0 || needle.length === 0) return false;
      return (haystack as unknown[]).every((item) => (needle as unknown[]).includes(item));
    }
    return (haystack as unknown[]).includes(needle);
  }
  if (typeof haystack === 'string') {
    if (Array.isArray(needle)) {
      return (needle as unknown[]).some((item) => haystack.includes(String(item)));
    }
    return haystack.includes(String(needle));
  }
  return false;
});

jsonLogic.add_operation('==', (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && !Array.isArray(b)) return (a as unknown[]).includes(b);
  if (Array.isArray(b) && !Array.isArray(a)) return (b as unknown[]).includes(a);
  // eslint-disable-next-line eqeqeq
  return a == b;
});

jsonLogic.add_operation('!=', (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && !Array.isArray(b)) return !(a as unknown[]).includes(b);
  if (Array.isArray(b) && !Array.isArray(a)) return !(b as unknown[]).includes(a);
  // eslint-disable-next-line eqeqeq
  return a != b;
});

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Evaluates a JSONLogic condition against a data context.
 * Returns true if the condition matches, false otherwise.
 */
export function evaluateCondition(
  condition: JsonLogicCondition,
  context: Record<string, unknown>
): boolean {
  try {
    return Boolean(jsonLogic.apply(condition as Parameters<typeof jsonLogic.apply>[0], context));
  } catch {
    return false;
  }
}

/**
 * Build the JSONLogic evaluation context for a step based on its type and the user's input value.
 *
 * RadioButton:  { value: "selected_option_id" }
 * Select:       { list_id_1: "option_id", list_id_2: "option_id", ... }
 * Checkbox:     { selected: ["id1", "id2", ...] }
 */
export function buildContext(
  stepType: 'RadioButton' | 'Select' | 'Checkbox',
  value: unknown
): Record<string, unknown> {
  switch (stepType) {
    case 'RadioButton':
      return { value };
    case 'Select':
      return typeof value === 'object' && value !== null
        ? (value as Record<string, unknown>)
        : {};
    case 'Checkbox':
      return { selected: Array.isArray(value) ? value : [] };
  }
}
