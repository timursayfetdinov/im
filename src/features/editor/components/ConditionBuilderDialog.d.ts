/**
 * ConditionBuilderDialog
 *
 * Two-tab dialog for editing JSONLogic transition conditions:
 *   • "Конструктор" — visual row-based builder (RadioButton / Checkbox / Select)
 *   • "JSON"         — raw JSON editor (always available as fallback)
 *
 * JSONLogic variable context per step type:
 *   RadioButton  → { value: "selected_option_id" }
 *   Checkbox     → { selected: ["opt1", "opt2", …] }
 *   Select       → { list_id: "selected_option_id", … }
 *   others       → raw JSON only
 */
import type { JsonLogicCondition, Step } from '../../../shared/types/scenario';
type Props = {
    open: boolean;
    step: Step;
    condition: JsonLogicCondition;
    onClose: () => void;
    onSave: (c: JsonLogicCondition) => void;
};
export declare function ConditionBuilderDialog({ open, step, condition, onClose, onSave }: Props): import("react/jsx-runtime").JSX.Element;
export {};
