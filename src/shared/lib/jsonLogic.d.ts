import type { JsonLogicCondition } from '../types/scenario';
/**
 * Evaluates a JSONLogic condition against a data context.
 * Returns true if the condition matches, false otherwise.
 */
export declare function evaluateCondition(condition: JsonLogicCondition, context: Record<string, unknown>): boolean;
/**
 * Build the JSONLogic evaluation context for a step based on its type and the user's input value.
 *
 * RadioButton:  { value: "selected_option_id" }
 * Select:       { list_id_1: "option_id", list_id_2: "option_id", ... }
 * Checkbox:     { selected: ["id1", "id2", ...] }
 */
export declare function buildContext(stepType: 'RadioButton' | 'Select' | 'Checkbox', value: unknown): Record<string, unknown>;
