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

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { nanoid } from 'nanoid';

import type { JsonLogicCondition, Step } from '../../../shared/types/scenario';

// ─── Types ────────────────────────────────────────────────────────────────────

type Combinator = 'and' | 'or';
type RowOperator = '==' | '!=' | 'in' | 'not_in';

type BuilderRow = {
  key: string;
  variable: string;        // "value" | "selected" | list_id
  operator: RowOperator;
  valueId: string | string[]; // string for ==, !=, Checkbox in/not_in; string[] for Select in/not_in
};

/** Select ∈/∉ encodes as { "in": [{"var": list_id}, [opt1, opt2]] } — var comes FIRST */
function isSelectMulti(step: Step, op: RowOperator): boolean {
  return step.type === 'Select' && (op === 'in' || op === 'not_in');
}

// ─── Step-type helpers ────────────────────────────────────────────────────────

type VarOption = { value: string; label: string };
type ValOption = { id: string; label: string };

function supportsVisual(step: Step): boolean {
  return step.type === 'RadioButton' || step.type === 'Checkbox' || step.type === 'Select';
}

function getVariableOptions(step: Step): VarOption[] {
  if (step.type === 'RadioButton') return [{ value: 'value', label: 'Выбранное значение' }];
  if (step.type === 'Checkbox') return [{ value: 'selected', label: 'Выбранные элементы' }];
  if (step.type === 'Select') {
    return step.view.lists.map((l) => ({ value: l.id, label: l.label || l.id }));
  }
  return [];
}

function getOperators(step: Step): { value: RowOperator; label: string }[] {
  if (step.type === 'Checkbox') {
    return [
      { value: 'in', label: 'выбран' },
      { value: 'not_in', label: 'не выбран' },
    ];
  }
  if (step.type === 'Select') {
    return [
      { value: '==', label: '= равно' },
      { value: '!=', label: '≠ не равно' },
      { value: 'in', label: '∈ входит в' },
      { value: 'not_in', label: '∉ не входит в' },
    ];
  }
  return [
    { value: '==', label: 'равно' },
    { value: '!=', label: 'не равно' },
  ];
}

function getValueOptions(step: Step, variable: string): ValOption[] {
  if (step.type === 'RadioButton') return step.view.options;
  if (step.type === 'Checkbox') return step.view.options;
  if (step.type === 'Select') {
    return step.view.lists.find((l) => l.id === variable)?.options ?? [];
  }
  return [];
}

function defaultVariable(step: Step): string {
  if (step.type === 'RadioButton') return 'value';
  if (step.type === 'Checkbox') return 'selected';
  if (step.type === 'Select') return step.view.lists[0]?.id ?? '';
  return '';
}

function defaultOperator(step: Step): RowOperator {
  return step.type === 'Checkbox' ? 'in' : '==';
}

// ─── JSONLogic ↔ BuilderRows conversion ──────────────────────────────────────

function rowToLogic(row: BuilderRow): JsonLogicCondition {
  if (Array.isArray(row.valueId)) {
    // Select ∈/∉: { "in": [{"var": list_id}, [opt1, opt2]] }
    if (row.operator === 'in')     return { in: [{ var: row.variable }, row.valueId] };
    if (row.operator === 'not_in') return { '!': { in: [{ var: row.variable }, row.valueId] } };
  }
  const v = row.valueId as string;
  switch (row.operator) {
    case '==':     return { '==': [{ var: row.variable }, v] };
    case '!=':     return { '!=': [{ var: row.variable }, v] };
    case 'in':     return { in: [v, { var: row.variable }] };          // Checkbox: str first
    case 'not_in': return { '!': { in: [v, { var: row.variable }] } }; // Checkbox
  }
}

function rowsToLogic(rows: BuilderRow[], combinator: Combinator): JsonLogicCondition {
  if (rows.length === 0) return {};
  const parts = rows.map(rowToLogic);
  if (parts.length === 1) return parts[0];
  return { [combinator]: parts };
}

function tryParseRow(cond: JsonLogicCondition): BuilderRow | null {
  const k = Object.keys(cond);
  if (k.length !== 1) return null;
  if ('==' in cond || '!=' in cond) {
    const op = k[0] as '==' | '!=';
    const [left, right] = (cond[op] as [unknown, unknown]);
    if (left && typeof left === 'object' && 'var' in left && typeof right === 'string') {
      return { key: nanoid(4), variable: (left as { var: string }).var, operator: op, valueId: right };
    }
  }
  if ('in' in cond) {
    const [a, b] = (cond['in'] as [unknown, unknown]);
    // Checkbox pattern: [string, {var}]
    if (typeof a === 'string' && b && typeof b === 'object' && 'var' in b) {
      return { key: nanoid(4), variable: (b as { var: string }).var, operator: 'in', valueId: a };
    }
    // Select pattern: [{var}, string[]]
    if (a && typeof a === 'object' && 'var' in a && Array.isArray(b) && b.every((x) => typeof x === 'string')) {
      return { key: nanoid(4), variable: (a as { var: string }).var, operator: 'in', valueId: b as string[] };
    }
  }
  if ('!' in cond) {
    const inner = cond['!'] as JsonLogicCondition;
    if (inner && 'in' in inner) {
      const [a, b] = (inner['in'] as [unknown, unknown]);
      // Checkbox pattern
      if (typeof a === 'string' && b && typeof b === 'object' && 'var' in b) {
        return { key: nanoid(4), variable: (b as { var: string }).var, operator: 'not_in', valueId: a };
      }
      // Select pattern
      if (a && typeof a === 'object' && 'var' in a && Array.isArray(b) && b.every((x) => typeof x === 'string')) {
        return { key: nanoid(4), variable: (a as { var: string }).var, operator: 'not_in', valueId: b as string[] };
      }
    }
  }
  return null;
}

function tryParseRows(condition: JsonLogicCondition): { rows: BuilderRow[]; combinator: Combinator } | null {
  if (Object.keys(condition).length === 0) return { rows: [], combinator: 'and' };
  const single = tryParseRow(condition);
  if (single) return { rows: [single], combinator: 'and' };
  if ('and' in condition) {
    const parts = condition['and'] as JsonLogicCondition[];
    const rows = parts.map(tryParseRow);
    if (rows.every(Boolean)) return { rows: rows as BuilderRow[], combinator: 'and' };
  }
  if ('or' in condition) {
    const parts = condition['or'] as JsonLogicCondition[];
    const rows = parts.map(tryParseRow);
    if (rows.every(Boolean)) return { rows: rows as BuilderRow[], combinator: 'or' };
  }
  return null;
}

// ─── Visual builder tab ───────────────────────────────────────────────────────

function VisualBuilder({
  step,
  rows,
  combinator,
  onChange,
}: {
  step: Step;
  rows: BuilderRow[];
  combinator: Combinator;
  onChange: (rows: BuilderRow[], combinator: Combinator) => void;
}) {
  const varOptions = getVariableOptions(step);
  const operatorOptions = getOperators(step);

  function makeDefaultValueId(variable: string, op: RowOperator): string | string[] {
    if (isSelectMulti(step, op)) return [];
    return getValueOptions(step, variable)[0]?.id ?? '';
  }

  function addRow() {
    const variable = defaultVariable(step);
    const operator = defaultOperator(step);
    onChange([...rows, { key: nanoid(4), variable, operator, valueId: makeDefaultValueId(variable, operator) }], combinator);
  }

  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx), combinator);
  }

  function updateRow(idx: number, patch: Partial<BuilderRow>) {
    const updated = rows.map((r, i) => {
      if (i !== idx) return r;
      const next = { ...r, ...patch };

      // When variable changes, reset valueId
      if ('variable' in patch) {
        next.valueId = makeDefaultValueId(next.variable, next.operator);
      }
      // When operator changes, convert valueId type if needed
      if ('operator' in patch) {
        const nowMulti = isSelectMulti(step, next.operator);
        const wasMulti = Array.isArray(r.valueId);
        if (nowMulti && !wasMulti) {
          next.valueId = r.valueId ? [r.valueId as string] : [];
        } else if (!nowMulti && wasMulti) {
          next.valueId = (r.valueId as string[])[0] ?? '';
        }
      }
      return next;
    });
    onChange(updated, combinator);
  }

  return (
    <Stack spacing={2}>
      {rows.length > 1 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">Объединить условия:</Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={combinator}
            onChange={(_, v) => { if (v) onChange(rows, v as Combinator); }}
          >
            <ToggleButton value="and">И (AND)</ToggleButton>
            <ToggleButton value="or">ИЛИ (OR)</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {rows.map((row, idx) => (
        <Box key={row.key} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          {/* Variable (only when multiple options exist) */}
          {varOptions.length > 1 && (
            <TextField
              select
              size="small"
              label="Поле"
              value={row.variable}
              onChange={(e) => updateRow(idx, { variable: e.target.value })}
              sx={{ minWidth: 130 }}
            >
              {varOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
          )}

          {/* Operator */}
          <TextField
            select
            size="small"
            label="Условие"
            value={row.operator}
            onChange={(e) => updateRow(idx, { operator: e.target.value as RowOperator })}
            sx={{ minWidth: 120 }}
          >
            {operatorOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          </TextField>

          {/* Value — multi-select for Select ∈/∉, single otherwise */}
          <TextField
            select
            size="small"
            label={isSelectMulti(step, row.operator) ? 'Значения' : 'Значение'}
            value={row.valueId}
            onChange={(e) =>
              updateRow(idx, {
                valueId: isSelectMulti(step, row.operator)
                  ? (e.target.value as unknown as string[])
                  : (e.target.value as string),
              })
            }
            slotProps={
              isSelectMulti(step, row.operator)
                ? {
                    select: {
                      multiple: true,
                      renderValue: (selected) =>
                        (selected as string[])
                          .map(
                            (id) =>
                              getValueOptions(step, row.variable).find((o) => o.id === id)?.label ?? id,
                          )
                          .join(', '),
                    },
                  }
                : undefined
            }
            sx={{ flexGrow: 1 }}
          >
            {getValueOptions(step, row.variable).map((o) => (
              <MenuItem key={o.id} value={o.id}>{o.label || o.id}</MenuItem>
            ))}
            {getValueOptions(step, row.variable).length === 0 && (
              <MenuItem disabled value="">— нет вариантов —</MenuItem>
            )}
          </TextField>

          <Tooltip title="Удалить строку">
            <IconButton size="small" color="error" onClick={() => removeRow(idx)} sx={{ mt: 0.5 }}>
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ))}

      <Button startIcon={<AddIcon />} size="small" onClick={addRow} sx={{ alignSelf: 'flex-start' }}>
        Добавить условие
      </Button>
    </Stack>
  );
}

// ─── Raw JSON tab ─────────────────────────────────────────────────────────────

function JsonEditor({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error: string;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary">
        JSONLogic-выражение. Документация:{' '}
        <a href="https://jsonlogic.com" target="_blank" rel="noreferrer">jsonlogic.com</a>
      </Typography>
      <TextField
        multiline
        rows={12}
        fullWidth
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={!!error}
        helperText={error || ' '}
        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
      />
    </Stack>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  step: Step;
  condition: JsonLogicCondition;
  onClose: () => void;
  onSave: (c: JsonLogicCondition) => void;
};

export function ConditionBuilderDialog({ open, step, condition, onClose, onSave }: Props) {
  const hasVisual = supportsVisual(step);

  // Which tab is active: 0 = visual (if available), 1 = JSON
  const [tab, setTab] = useState<0 | 1>(() => (hasVisual ? 0 : 1));

  // Visual state — initialized from condition; null means condition is too complex to parse
  const parsed = tryParseRows(condition);
  const [rows, setRows] = useState<BuilderRow[]>(parsed?.rows ?? []);
  const [combinator, setCombinator] = useState<Combinator>(parsed?.combinator ?? 'and');
  const parseFailed = hasVisual && parsed === null;

  // JSON state — always sync-able from visual state
  const [jsonText, setJsonText] = useState(() => JSON.stringify(condition, null, 2));
  const [jsonError, setJsonError] = useState('');

  function handleTabChange(_: React.SyntheticEvent, newTab: number) {
    if (newTab === 1 && tab === 0) {
      // Visual → JSON: serialize current visual rows
      setJsonText(JSON.stringify(rowsToLogic(rows, combinator), null, 2));
      setJsonError('');
    }
    if (newTab === 0 && tab === 1) {
      // JSON → Visual: try to parse
      try {
        const parsed2 = tryParseRows(JSON.parse(jsonText) as JsonLogicCondition);
        if (parsed2) {
          setRows(parsed2.rows);
          setCombinator(parsed2.combinator);
        }
      } catch {
        // If JSON is invalid, stay on JSON tab
        setJsonError('Исправьте JSON перед переходом в конструктор');
        return;
      }
    }
    setTab(newTab as 0 | 1);
  }

  function handleSave() {
    let result: JsonLogicCondition;
    if (tab === 0) {
      result = rowsToLogic(rows, combinator);
    } else {
      try {
        result = JSON.parse(jsonText) as JsonLogicCondition;
      } catch {
        setJsonError('Некорректный JSON');
        return;
      }
    }
    onSave(result);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Условие перехода</DialogTitle>

      {hasVisual && (
        <Tabs value={tab} onChange={handleTabChange} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Конструктор" value={0} />
          <Tab label="JSON" value={1} />
        </Tabs>
      )}

      <DialogContent sx={{ pt: 2.5 }}>
        {tab === 0 && hasVisual && (
          <>
            {parseFailed && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mb: 2 }}>
                Существующее условие слишком сложное для визуального отображения. Конструктор начат с нуля — перейдите во вкладку JSON для ручного редактирования.
              </Typography>
            )}
            <VisualBuilder
              step={step}
              rows={rows}
              combinator={combinator}
              onChange={(r, c) => { setRows(r); setCombinator(c); }}
            />
          </>
        )}

        {tab === 1 && (
          <JsonEditor value={jsonText} onChange={(v) => { setJsonText(v); setJsonError(''); }} error={jsonError} />
        )}

        {!hasVisual && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Визуальный конструктор доступен только для шагов с вариантами ответа (RadioButton, Checkbox, Select).
            </Typography>
            <JsonEditor value={jsonText} onChange={(v) => { setJsonText(v); setJsonError(''); }} error={jsonError} />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSave}>Применить</Button>
      </DialogActions>
    </Dialog>
  );
}
