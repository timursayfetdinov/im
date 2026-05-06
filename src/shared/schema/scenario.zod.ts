import { z } from 'zod';

// ─── Primitives ───────────────────────────────────────────────────────────────

const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

const selectListSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  options: z.array(optionSchema).min(1, 'Список должен содержать хотя бы одну опцию'),
});

const macroSchema = z.object({
  name: z.string().min(1),
  args: z.record(z.string(), z.unknown()),
});

const jsonLogicConditionSchema = z.record(z.string(), z.unknown());

const transitionTargetSchema = z.object({
  goto: z.string().nullable(),
  macro: macroSchema.nullable(),
});

const transitionRuleSchema = transitionTargetSchema.extend({
  condition: jsonLogicConditionSchema,
});

const transitionsSchema = z.object({
  default: transitionTargetSchema,
  rules: z.array(transitionRuleSchema).optional(),
});

// ─── Step base ────────────────────────────────────────────────────────────────

const stepBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  editable: z.boolean(),
  multitasking: z.boolean(),
  report: z.boolean(),
  finish: z.boolean(),
  transitions: transitionsSchema,
});

// ─── View schemas ─────────────────────────────────────────────────────────────

const buttonViewSchema = z.object({
  label: z.string(),
});

const commentViewSchema = z.object({
  label: z.string(),
  default: z.string(),
  required: z.boolean(),
  readonly: z.boolean(),
  minLength: z.number().int().min(0),
  maxLength: z.number().int().min(0),
});

const datetimeViewSchema = z.object({
  label: z.string(),
  required: z.boolean(),
  min: z.string().nullable(),
  max: z.string().nullable(),
});

const imageViewSchema = z.object({
  label: z.string(),
  source: z.enum(['camera', 'map', 'operator', 'fixed']),
  image: z.string().nullable(),
});

const radioButtonViewSchema = z.object({
  label: z.string(),
  required: z.boolean(),
  default: z.string().nullable(),
  options: z.array(optionSchema),
});

const checkboxOptionSchema = optionSchema.extend({
  default: z.boolean(),
});

const checkboxViewSchema = z.object({
  label: z.string(),
  minSelected: z.number().int().min(0),
  maxSelected: z.number().int().min(0).nullable(),
  options: z.array(checkboxOptionSchema),
});

const selectViewSchema = z.object({
  required: z.boolean(),
  lists: z.array(selectListSchema).min(1),
});

// ─── Step schemas ─────────────────────────────────────────────────────────────

const buttonStepSchema = stepBaseSchema.extend({ type: z.literal('Button'), view: buttonViewSchema });
const commentStepSchema = stepBaseSchema.extend({ type: z.literal('Comment'), view: commentViewSchema });
const datetimeStepSchema = stepBaseSchema.extend({ type: z.literal('Datetime'), view: datetimeViewSchema });
const imageStepSchema = stepBaseSchema.extend({ type: z.literal('Image'), view: imageViewSchema });
const radioButtonStepSchema = stepBaseSchema.extend({ type: z.literal('RadioButton'), view: radioButtonViewSchema });
const selectStepSchema = stepBaseSchema.extend({ type: z.literal('Select'), view: selectViewSchema });
const checkboxStepSchema = stepBaseSchema.extend({ type: z.literal('Checkbox'), view: checkboxViewSchema });

export const stepSchema = z.discriminatedUnion('type', [
  buttonStepSchema,
  commentStepSchema,
  datetimeStepSchema,
  imageStepSchema,
  radioButtonStepSchema,
  selectStepSchema,
  checkboxStepSchema,
]);

// ─── Scenario ─────────────────────────────────────────────────────────────────

const scenarioMetaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  version: z.number().int().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  initialStep: z.string().min(1),
});

export const scenarioSchema = z.object({
  scenario: scenarioMetaSchema,
  steps: z.array(stepSchema),
});

export type ScenarioInput = z.input<typeof scenarioSchema>;
