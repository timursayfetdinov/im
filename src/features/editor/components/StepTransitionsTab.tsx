import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import type {
  Macro,
  Step,
  TransitionRule,
  TransitionTarget,
} from '../../../shared/types/scenario';
import { useEditorStore } from '../store/editorStore';
import { ConditionBuilderDialog } from './ConditionBuilderDialog';

// Sentinel value for "goto: null" (end of scenario) inside MUI Select
const GOTO_END = '__END__';

const EMPTY_STEPS: Step[] = [];

function gotoToValue(goto: string | null): string {
  return goto === null ? GOTO_END : goto;
}
function valueToGoto(value: string): string | null {
  return value === GOTO_END ? null : value;
}

// ─── Condition chip + edit button ─────────────────────────────────────────────

function ConditionRow({
  step,
  condition,
  onUpdate,
}: {
  step: Step;
  condition: TransitionRule['condition'];
  onUpdate: (c: TransitionRule['condition']) => void;
}) {
  const [open, setOpen] = useState(false);
  const isEmpty = Object.keys(condition).length === 0;
  const preview = isEmpty ? 'Условие не задано' : JSON.stringify(condition);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={preview.length > 55 ? preview.slice(0, 52) + '…' : preview}
          size="small"
          variant={isEmpty ? 'outlined' : 'filled'}
          color={isEmpty ? 'default' : 'primary'}
          sx={{ fontFamily: 'monospace', fontSize: '0.72rem', flexGrow: 1, justifyContent: 'flex-start' }}
        />
        <Tooltip title="Редактировать условие">
          <IconButton size="small" onClick={() => setOpen(true)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <ConditionBuilderDialog
        open={open}
        step={step}
        condition={condition}
        onClose={() => setOpen(false)}
        onSave={onUpdate}
      />
    </>
  );
}

// ─── Goto select ──────────────────────────────────────────────────────────────

function GotoSelect({
  value,
  steps,
  onChange,
}: {
  value: string | null;
  steps: Step[];
  onChange: (goto: string | null) => void;
}) {
  return (
    <TextField
      select
      label="Перейти к"
      size="small"
      fullWidth
      value={gotoToValue(value)}
      onChange={(e) => onChange(valueToGoto(e.target.value))}
    >
      <MenuItem value={GOTO_END}>
        <em>— Завершение сценария —</em>
      </MenuItem>
      {steps.map((s) => (
        <MenuItem key={s.id} value={s.id}>
          {s.title ? `${s.title} (${s.id})` : s.id}
        </MenuItem>
      ))}
    </TextField>
  );
}

// ─── Macro field ──────────────────────────────────────────────────────────────

function MacroField({
  macro,
  onChange,
}: {
  macro: Macro | null;
  onChange: (macro: Macro | null) => void;
}) {
  return (
    <TextField
      label="Макрос (опционально)"
      size="small"
      fullWidth
      value={macro?.name ?? ''}
      helperText={macro ? `args: ${JSON.stringify(macro.args)}` : 'Оставьте пустым, чтобы не использовать'}
      onChange={(e) => {
        const name = e.target.value.trim();
        onChange(name ? { name, args: macro?.args ?? {} } : null);
      }}
    />
  );
}

// ─── Single rule row ──────────────────────────────────────────────────────────

function RuleRow({
  rule,
  index,
  total,
  step,
  steps,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  rule: TransitionRule;
  index: number;
  total: number;
  step: Step;
  steps: Step[];
  onUpdate: (patch: Partial<TransitionRule>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <Card variant="outlined" sx={{ p: 1.5, mb: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Правило {index + 1}
        </Typography>
        <Tooltip title="Выше">
          <span>
            <IconButton size="small" onClick={onMoveUp} disabled={index === 0}>
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Ниже">
          <span>
            <IconButton size="small" onClick={onMoveDown} disabled={index === total - 1}>
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Удалить правило">
          <IconButton size="small" color="error" onClick={onRemove}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Stack spacing={1.5}>
        {/* Condition */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Если выполнено условие
          </Typography>
          <ConditionRow
            step={step}
            condition={rule.condition}
            onUpdate={(c) => onUpdate({ condition: c })}
          />
        </Box>

        {/* Goto */}
        <GotoSelect
          value={rule.goto}
          steps={steps}
          onChange={(goto) => onUpdate({ goto })}
        />

        {/* Macro */}
        <MacroField
          macro={rule.macro}
          onChange={(macro) => onUpdate({ macro })}
        />
      </Stack>
    </Card>
  );
}

// ─── TransitionTarget section (default or rule) ───────────────────────────────

function DefaultSection({
  target,
  steps,
  stepId,
}: {
  target: TransitionTarget;
  steps: Step[];
  stepId: string;
}) {
  const updateDefault = useEditorStore((s) => s.updateDefault);

  return (
    <Stack spacing={1.5}>
      <GotoSelect
        value={target.goto}
        steps={steps}
        onChange={(goto) => updateDefault(stepId, { goto })}
      />
      <MacroField
        macro={target.macro}
        onChange={(macro) => updateDefault(stepId, { macro })}
      />
    </Stack>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * «Переходы» tab rendered inside StepDrawer.
 * Mounted fresh per step via key={step.id} in StepDrawer.
 */
export function StepTransitionsTab({ step }: { step: Step }) {
  const allSteps = useEditorStore((s) => s.scenario?.steps ?? EMPTY_STEPS);
  const addRule = useEditorStore((s) => s.addRule);
  const updateRule = useEditorStore((s) => s.updateRule);
  const removeRule = useEditorStore((s) => s.removeRule);
  const reorderRules = useEditorStore((s) => s.reorderRules);

  const rules: TransitionRule[] = step.transitions.rules ?? [];
  // All steps except the current one for goto options
  const otherSteps = allSteps.filter((s) => s.id !== step.id);

  return (
    <Stack spacing={2.5} sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1 }}>
      {/* Default transition */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Переход по умолчанию
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Выполняется, если ни одно правило не совпало
        </Typography>
        <DefaultSection
          target={step.transitions.default}
          steps={otherSteps}
          stepId={step.id}
        />
      </Box>

      <Divider />

      {/* Conditional rules */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            Правила ({rules.length})
          </Typography>
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => addRule(step.id)}
          >
            Добавить
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Правила проверяются сверху вниз. Первое совпавшее условие определяет переход.
        </Typography>

        {rules.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
            Нет правил — всегда используется переход по умолчанию
          </Typography>
        ) : (
          rules.map((rule, idx) => (
            <RuleRow
              key={idx}
              rule={rule}
              index={idx}
              total={rules.length}
              step={step}
              steps={otherSteps}
              onUpdate={(patch) => updateRule(step.id, idx, patch)}
              onRemove={() => removeRule(step.id, idx)}
              onMoveUp={() => reorderRules(step.id, idx, idx - 1)}
              onMoveDown={() => reorderRules(step.id, idx, idx + 1)}
            />
          ))
        )}
      </Box>
    </Stack>
  );
}
