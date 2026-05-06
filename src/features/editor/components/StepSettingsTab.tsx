import { useCallback, useRef, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { nanoid } from 'nanoid';

import type {
  ButtonStep, ButtonView,
  CheckboxOption, CheckboxStep, CheckboxView,
  CommentStep, CommentView,
  DatetimeStep, DatetimeView,
  ImageSource, ImageStep, ImageView,
  Option,
  RadioButtonStep, RadioButtonView,
  SelectList, SelectStep, SelectView,
  Step,
} from '../../../shared/types/scenario';
import { useEditorStore } from '../store/editorStore';

// ─── useViewSync ──────────────────────────────────────────────────────────────
// Keeps a local copy of the view for fast UI, and exposes:
//   patch(changes, immediate?) — update local state; immediate=true also syncs to store
//   sync()                     — flush current state to store (used in onBlur)

function useViewSync<V extends object>(initial: V, onSync: (v: V) => void) {
  const [view, setView] = useState<V>(initial);
  const ref = useRef<V>(initial);

  const patch = useCallback(
    (changes: Partial<V>, immediate = false) => {
      const next = { ...ref.current, ...changes };
      ref.current = next;
      setView(next);
      if (immediate) onSync(next);
    },
    [onSync],
  );

  const sync = useCallback(() => onSync(ref.current), [onSync]);

  return { view, patch, sync };
}

// ─── OptionsList ──────────────────────────────────────────────────────────────
// Shared editor for Option[] (RadioButton) and CheckboxOption[] (Checkbox).
// withDefault shows an extra "По умолчанию" toggle per row.

function OptionsList({
  options,
  onChange,
  withDefault = false,
}: {
  options: (Option | CheckboxOption)[];
  onChange: (opts: (Option | CheckboxOption)[]) => void;
  withDefault?: boolean;
}) {
  function addOption() {
    const opt: CheckboxOption = { id: nanoid(6), label: '', default: false };
    onChange([...options, withDefault ? opt : { id: opt.id, label: opt.label }]);
  }

  function remove(idx: number) {
    onChange(options.filter((_, i) => i !== idx));
  }

  function update(idx: number, changes: Partial<Option & { default: boolean }>) {
    onChange(options.map((o, i) => (i === idx ? { ...o, ...changes } : o)));
  }

  return (
    <Box>
      {options.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 0.5, px: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ width: 110 }}>ID</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>Метка</Typography>
          {withDefault && (
            <Typography variant="caption" color="text.secondary" sx={{ width: 52, textAlign: 'center' }}>
              Умолч.
            </Typography>
          )}
          <Box sx={{ width: 32 }} />
        </Box>
      )}

      <Stack spacing={1}>
        {options.map((opt, idx) => (
          <Box key={opt.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              value={opt.id}
              onChange={(e) => update(idx, { id: e.target.value })}
              sx={{ width: 110 }}
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
            />
            <TextField
              size="small"
              value={opt.label}
              onChange={(e) => update(idx, { label: e.target.value })}
              sx={{ flexGrow: 1 }}
            />
            {withDefault && (
              <Tooltip title="По умолчанию">
                <Switch
                  size="small"
                  checked={(opt as CheckboxOption).default ?? false}
                  onChange={(e) => update(idx, { default: e.target.checked })}
                />
              </Tooltip>
            )}
            <Tooltip title="Удалить">
              <IconButton size="small" color="error" onClick={() => remove(idx)}>
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>

      <Button startIcon={<AddIcon />} size="small" onClick={addOption} sx={{ mt: 1 }}>
        Добавить вариант
      </Button>
    </Box>
  );
}

// ─── SelectListsEditor ────────────────────────────────────────────────────────
// Each SelectList can be expanded to reveal its own OptionsList.

function SelectListsEditor({
  lists,
  onChange,
}: {
  lists: SelectList[];
  onChange: (lists: SelectList[]) => void;
}) {
  function addList() {
    onChange([...lists, { id: nanoid(6), label: '', options: [] }]);
  }

  function removeList(idx: number) {
    onChange(lists.filter((_, i) => i !== idx));
  }

  function updateList(idx: number, changes: Partial<SelectList>) {
    onChange(lists.map((l, i) => (i === idx ? { ...l, ...changes } : l)));
  }

  return (
    <Box>
      {lists.map((list, idx) => (
        <Accordion key={list.id} disableGutters variant="outlined" sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, mr: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>
                {list.label || <em style={{ opacity: 0.5 }}>Без названия</em>}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {list.id}
              </Typography>
              <Tooltip title="Удалить список">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => { e.stopPropagation(); removeList(idx); }}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="ID списка"
                  size="small"
                  value={list.id}
                  onChange={(e) => updateList(idx, { id: e.target.value })}
                  sx={{ width: 140 }}
                  slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.8rem' } } }}
                />
                <TextField
                  label="Название"
                  size="small"
                  value={list.label}
                  onChange={(e) => updateList(idx, { label: e.target.value })}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
              <Divider />
              <Typography variant="caption" color="text.secondary">Варианты списка</Typography>
              <OptionsList
                options={list.options}
                onChange={(opts) => updateList(idx, { options: opts as Option[] })}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
      <Button startIcon={<AddIcon />} size="small" onClick={addList}>
        Добавить список
      </Button>
    </Box>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

function ButtonSettings({ step, onSync }: { step: ButtonStep; onSync: (v: ButtonView) => void }) {
  const { view, patch, sync } = useViewSync(step.view, onSync);
  return (
    <Stack spacing={2.5} sx={{ p: 2.5 }}>
      <TextField
        label="Метка кнопки"
        size="small"
        fullWidth
        value={view.label}
        onChange={(e) => patch({ label: e.target.value })}
        onBlur={sync}
      />
    </Stack>
  );
}

// ─── Comment ──────────────────────────────────────────────────────────────────

function CommentSettings({ step, onSync }: { step: CommentStep; onSync: (v: CommentView) => void }) {
  const { view, patch, sync } = useViewSync(step.view, onSync);
  return (
    <Stack spacing={2.5} sx={{ p: 2.5 }}>
      <TextField
        label="Метка поля"
        size="small"
        fullWidth
        value={view.label}
        onChange={(e) => patch({ label: e.target.value })}
        onBlur={sync}
      />
      <TextField
        label="Значение по умолчанию"
        size="small"
        fullWidth
        multiline
        rows={2}
        value={view.default}
        onChange={(e) => patch({ default: e.target.value })}
        onBlur={sync}
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Мин. длина"
          size="small"
          type="number"
          value={view.minLength}
          onChange={(e) => patch({ minLength: Number(e.target.value) }, true)}
          sx={{ width: 120 }}
          slotProps={{ input: { inputProps: { min: 0 } } }}
        />
        <TextField
          label="Макс. длина"
          size="small"
          type="number"
          value={view.maxLength}
          onChange={(e) => patch({ maxLength: Number(e.target.value) }, true)}
          sx={{ width: 120 }}
          slotProps={{ input: { inputProps: { min: 0 } } }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <FormControlLabel
          label="Обязательное"
          control={
            <Switch
              size="small"
              checked={view.required}
              onChange={(e) => patch({ required: e.target.checked }, true)}
            />
          }
        />
        <FormControlLabel
          label="Только чтение"
          control={
            <Switch
              size="small"
              checked={view.readonly}
              onChange={(e) => patch({ readonly: e.target.checked }, true)}
            />
          }
        />
      </Box>
    </Stack>
  );
}

// ─── Datetime ─────────────────────────────────────────────────────────────────

function DatetimeSettings({ step, onSync }: { step: DatetimeStep; onSync: (v: DatetimeView) => void }) {
  const { view, patch, sync } = useViewSync(step.view, onSync);
  return (
    <Stack spacing={2.5} sx={{ p: 2.5 }}>
      <TextField
        label="Метка поля"
        size="small"
        fullWidth
        value={view.label}
        onChange={(e) => patch({ label: e.target.value })}
        onBlur={sync}
      />
      <FormControlLabel
        label="Обязательное"
        control={
          <Switch
            size="small"
            checked={view.required}
            onChange={(e) => patch({ required: e.target.checked }, true)}
          />
        }
      />
      <TextField
        label="Минимальная дата/время"
        size="small"
        fullWidth
        value={view.min ?? ''}
        placeholder="Не ограничено"
        helperText="ISO 8601: 2024-01-01T00:00"
        onChange={(e) => patch({ min: e.target.value || null })}
        onBlur={sync}
      />
      <TextField
        label="Максимальная дата/время"
        size="small"
        fullWidth
        value={view.max ?? ''}
        placeholder="Не ограничено"
        helperText="ISO 8601: 2099-12-31T23:59"
        onChange={(e) => patch({ max: e.target.value || null })}
        onBlur={sync}
      />
    </Stack>
  );
}

// ─── Image ────────────────────────────────────────────────────────────────────

const IMAGE_SOURCES: { value: ImageSource; label: string }[] = [
  { value: 'camera', label: 'Камера' },
  { value: 'map', label: 'Карта' },
  { value: 'operator', label: 'Оператор' },
  { value: 'fixed', label: 'Фиксированное изображение' },
];

function ImageSettings({ step, onSync }: { step: ImageStep; onSync: (v: ImageView) => void }) {
  const { view, patch, sync } = useViewSync(step.view, onSync);
  return (
    <Stack spacing={2.5} sx={{ p: 2.5 }}>
      <TextField
        label="Метка поля"
        size="small"
        fullWidth
        value={view.label}
        onChange={(e) => patch({ label: e.target.value })}
        onBlur={sync}
      />
      <TextField
        select
        label="Источник изображения"
        size="small"
        fullWidth
        value={view.source}
        onChange={(e) => patch({ source: e.target.value as ImageSource }, true)}
      >
        {IMAGE_SOURCES.map((s) => (
          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
        ))}
      </TextField>
      {view.source === 'fixed' && (
        <TextField
          label="URL изображения"
          size="small"
          fullWidth
          value={view.image ?? ''}
          placeholder="https://..."
          onChange={(e) => patch({ image: e.target.value || null })}
          onBlur={sync}
        />
      )}
    </Stack>
  );
}

// ─── RadioButton ──────────────────────────────────────────────────────────────

function RadioButtonSettings({ step, onSync }: { step: RadioButtonStep; onSync: (v: RadioButtonView) => void }) {
  const { view, patch, sync } = useViewSync(step.view, onSync);
  return (
    <Stack spacing={2.5} sx={{ p: 2.5 }}>
      <TextField
        label="Метка поля"
        size="small"
        fullWidth
        value={view.label}
        onChange={(e) => patch({ label: e.target.value })}
        onBlur={sync}
      />
      <FormControlLabel
        label="Обязательное"
        control={
          <Switch
            size="small"
            checked={view.required}
            onChange={(e) => patch({ required: e.target.checked }, true)}
          />
        }
      />
      <TextField
        select
        label="Значение по умолчанию"
        size="small"
        fullWidth
        value={view.default ?? ''}
        onChange={(e) => patch({ default: e.target.value || null }, true)}
      >
        <MenuItem value=""><em>Не выбрано</em></MenuItem>
        {view.options.map((opt) => (
          <MenuItem key={opt.id} value={opt.id}>{opt.label || opt.id}</MenuItem>
        ))}
      </TextField>
      <Divider />
      <Typography variant="subtitle2">Варианты</Typography>
      <OptionsList
        options={view.options}
        onChange={(opts) => patch({ options: opts as Option[] }, true)}
      />
    </Stack>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function CheckboxSettings({ step, onSync }: { step: CheckboxStep; onSync: (v: CheckboxView) => void }) {
  const { view, patch, sync } = useViewSync(step.view, onSync);
  return (
    <Stack spacing={2.5} sx={{ p: 2.5 }}>
      <TextField
        label="Метка поля"
        size="small"
        fullWidth
        value={view.label}
        onChange={(e) => patch({ label: e.target.value })}
        onBlur={sync}
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Мин. выбранных"
          size="small"
          type="number"
          value={view.minSelected}
          onChange={(e) => patch({ minSelected: Number(e.target.value) }, true)}
          sx={{ width: 140 }}
          slotProps={{ input: { inputProps: { min: 0 } } }}
        />
        <TextField
          label="Макс. выбранных"
          size="small"
          type="number"
          value={view.maxSelected ?? ''}
          placeholder="∞"
          helperText="Пусто = без ограничений"
          onChange={(e) =>
            patch({ maxSelected: e.target.value === '' ? null : Number(e.target.value) }, true)
          }
          onBlur={sync}
          sx={{ width: 140 }}
          slotProps={{ input: { inputProps: { min: 0 } } }}
        />
      </Box>
      <Divider />
      <Typography variant="subtitle2">Варианты</Typography>
      <OptionsList
        options={view.options}
        onChange={(opts) => patch({ options: opts as CheckboxOption[] }, true)}
        withDefault
      />
    </Stack>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

function SelectSettings({ step, onSync }: { step: SelectStep; onSync: (v: SelectView) => void }) {
  const { view, patch } = useViewSync(step.view, onSync);
  return (
    <Stack spacing={2.5} sx={{ p: 2.5 }}>
      <FormControlLabel
        label="Обязательное"
        control={
          <Switch
            size="small"
            checked={view.required}
            onChange={(e) => patch({ required: e.target.checked }, true)}
          />
        }
      />
      <Divider />
      <Typography variant="subtitle2">Списки вариантов</Typography>
      <SelectListsEditor
        lists={view.lists}
        onChange={(lists) => patch({ lists }, true)}
      />
    </Stack>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * «Настройки» tab — type-specific view fields for each step type.
 * Mounted fresh per step via key={step.id} in StepDrawer.
 */
export function StepSettingsTab({ step }: { step: Step }) {
  const updateStepView = useEditorStore((s) => s.updateStepView);
  const onSync = useCallback(
    (view: Step['view']) => updateStepView(step.id, view),
    [step.id, updateStepView],
  );

  switch (step.type) {
    case 'Button':
      return <ButtonSettings step={step} onSync={onSync as (v: ButtonView) => void} />;
    case 'Comment':
      return <CommentSettings step={step} onSync={onSync as (v: CommentView) => void} />;
    case 'Datetime':
      return <DatetimeSettings step={step} onSync={onSync as (v: DatetimeView) => void} />;
    case 'Image':
      return <ImageSettings step={step} onSync={onSync as (v: ImageView) => void} />;
    case 'RadioButton':
      return <RadioButtonSettings step={step} onSync={onSync as (v: RadioButtonView) => void} />;
    case 'Checkbox':
      return <CheckboxSettings step={step} onSync={onSync as (v: CheckboxView) => void} />;
    case 'Select':
      return <SelectSettings step={step} onSync={onSync as (v: SelectView) => void} />;
  }
}
