import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import type {
  Step,
  ButtonStep,
  CommentStep,
  DatetimeStep,
  ImageStep,
  RadioButtonStep,
  SelectStep,
  CheckboxStep,
} from '../../../shared/types/scenario';
import type { StepValue } from '../lib/playerEngine';

// ─── Shared wrapper ────────────────────────────────────────────────────────────

type WrapperProps = {
  step: Step;
  canAdvance: boolean;
  onAdvance: () => void;
  children: React.ReactNode;
  advanceLabel?: string;
};

function StepCard({ step, canAdvance, onAdvance, children, advanceLabel = 'Далее' }: WrapperProps) {
  return (
    <Card variant="outlined" sx={{ maxWidth: 560, width: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {step.title}
        </Typography>
        {step.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {step.description}
          </Typography>
        )}
        <Divider sx={{ mb: 2 }} />
        {children}
        <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            disabled={!canAdvance}
            onClick={onAdvance}
          >
            {advanceLabel}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

function ButtonPlayer({ step, onAdvance }: { step: ButtonStep; onAdvance: (v: StepValue) => void }) {
  return (
    <StepCard step={step} canAdvance onAdvance={() => onAdvance(null)} advanceLabel={step.view.label || 'Далее'}>
      <Typography variant="body2" color="text.secondary">
        Нажмите кнопку для перехода к следующему шагу.
      </Typography>
    </StepCard>
  );
}

// ─── Comment ──────────────────────────────────────────────────────────────────

function CommentPlayer({ step, onAdvance }: { step: CommentStep; onAdvance: (v: StepValue) => void }) {
  const [text, setText] = useState(step.view.default ?? '');

  const canAdvance = !step.view.required || text.trim().length > 0;

  return (
    <StepCard step={step} canAdvance={canAdvance} onAdvance={() => onAdvance(text)}>
      <TextField
        label={step.view.label}
        multiline
        rows={4}
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        required={step.view.required}
        disabled={step.view.readonly}
        inputProps={{
          minLength: step.view.minLength || undefined,
          maxLength: step.view.maxLength || undefined,
        }}
      />
    </StepCard>
  );
}

// ─── Datetime ─────────────────────────────────────────────────────────────────

function DatetimePlayer({ step, onAdvance }: { step: DatetimeStep; onAdvance: (v: StepValue) => void }) {
  const [value, setValue] = useState('');
  const canAdvance = !step.view.required || value !== '';

  return (
    <StepCard step={step} canAdvance={canAdvance} onAdvance={() => onAdvance(value || null)}>
      <TextField
        label={step.view.label}
        type="datetime-local"
        fullWidth
        required={step.view.required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputProps={{
          min: step.view.min ?? undefined,
          max: step.view.max ?? undefined,
        }}
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </StepCard>
  );
}

// ─── Image ────────────────────────────────────────────────────────────────────

const IMAGE_SOURCE_ICON: Record<string, React.ElementType> = {
  camera: CameraAltOutlinedIcon,
  map: MapOutlinedIcon,
  operator: PersonOutlinedIcon,
  fixed: ImageOutlinedIcon,
};

const IMAGE_SOURCE_LABEL: Record<string, string> = {
  camera: 'Фотосъёмка камерой',
  map: 'Снимок с карты',
  operator: 'Изображение от оператора',
  fixed: 'Фиксированное изображение',
};

function ImagePlayer({ step, onAdvance }: { step: ImageStep; onAdvance: (v: StepValue) => void }) {
  const Icon = IMAGE_SOURCE_ICON[step.view.source] ?? ImageOutlinedIcon;
  const label = IMAGE_SOURCE_LABEL[step.view.source] ?? step.view.source;

  return (
    <StepCard step={step} canAdvance onAdvance={() => onAdvance(null)}>
      <Stack spacing={1.5} alignItems="center" sx={{ py: 2 }}>
        <Icon sx={{ fontSize: 56, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {step.view.source === 'fixed' && step.view.image && (
          <Box
            component="img"
            src={step.view.image}
            alt="preview"
            sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, border: 1, borderColor: 'divider' }}
          />
        )}
        {step.view.source !== 'fixed' && (
          <Typography variant="caption" color="text.disabled">
            (В предпросмотре загрузка недоступна)
          </Typography>
        )}
      </Stack>
    </StepCard>
  );
}

// ─── RadioButton ──────────────────────────────────────────────────────────────

function RadioButtonPlayer({ step, onAdvance }: { step: RadioButtonStep; onAdvance: (v: StepValue) => void }) {
  const [selected, setSelected] = useState<string>(step.view.default ?? '');
  const canAdvance = !step.view.required || selected !== '';

  return (
    <StepCard step={step} canAdvance={canAdvance} onAdvance={() => onAdvance(selected || null)}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem' }}>
          {step.view.label}
        </FormLabel>
        <RadioGroup value={selected} onChange={(e) => setSelected(e.target.value)}>
          {step.view.options.map((opt) => (
            <FormControlLabel key={opt.id} value={opt.id} control={<Radio />} label={opt.label} />
          ))}
        </RadioGroup>
      </FormControl>
    </StepCard>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

function SelectPlayer({ step, onAdvance }: { step: SelectStep; onAdvance: (v: StepValue) => void }) {
  const initial = Object.fromEntries(step.view.lists.map((l) => [l.id, [] as string[]]));
  const [values, setValues] = useState<Record<string, string[]>>(initial);

  const canAdvance =
    !step.view.required || step.view.lists.every((l) => values[l.id].length > 0);

  function set(listId: string, selected: string[]) {
    setValues((prev) => ({ ...prev, [listId]: selected }));
  }

  return (
    <StepCard step={step} canAdvance={canAdvance} onAdvance={() => onAdvance(values)}>
      <Stack spacing={2}>
        {step.view.lists.map((list) => {
          const labelId = `select-label-${list.id}`;
          const selected = values[list.id];
          return (
            <FormControl key={list.id} fullWidth required={step.view.required}>
              <InputLabel id={labelId}>{list.label}</InputLabel>
              <MuiSelect
                labelId={labelId}
                label={list.label}
                multiple
                value={selected}
                onChange={(e) => set(list.id, e.target.value as string[])}
                renderValue={(ids) =>
                  (ids as string[])
                    .map((id) => list.options.find((o) => o.id === id)?.label ?? id)
                    .join(', ')
                }
              >
                {list.options.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    <Checkbox checked={selected.includes(opt.id)} size="small" />
                    <ListItemText primary={opt.label} />
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          );
        })}
      </Stack>
    </StepCard>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

function CheckboxPlayer({ step, onAdvance }: { step: CheckboxStep; onAdvance: (v: StepValue) => void }) {
  const initial = step.view.options.filter((o) => o.default).map((o) => o.id);
  const [selected, setSelected] = useState<string[]>(initial);

  const min = step.view.minSelected ?? 0;
  const max = step.view.maxSelected;
  const canAdvance = selected.length >= min;

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : max !== null && prev.length >= max
          ? prev
          : [...prev, id]
    );
  }

  return (
    <StepCard step={step} canAdvance={canAdvance} onAdvance={() => onAdvance(selected)}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" sx={{ mb: 1, fontSize: '0.875rem' }}>
          {step.view.label}
          {min > 0 && (
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              (минимум {min})
            </Typography>
          )}
        </FormLabel>
        <FormGroup>
          {step.view.options.map((opt) => (
            <FormControlLabel
              key={opt.id}
              control={
                <Checkbox
                  checked={selected.includes(opt.id)}
                  onChange={() => toggle(opt.id)}
                  disabled={!selected.includes(opt.id) && max !== null && selected.length >= max}
                />
              }
              label={opt.label}
            />
          ))}
        </FormGroup>
        {min > 0 && (
          <Typography variant="caption" color={canAdvance ? 'text.secondary' : 'error'} sx={{ mt: 1 }}>
            Выбрано {selected.length} из {min} обязательных
          </Typography>
        )}
      </FormControl>
    </StepCard>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

type StepPlayerProps = {
  step: Step;
  onAdvance: (value: StepValue) => void;
};

export function StepPlayer({ step, onAdvance }: StepPlayerProps) {
  switch (step.type) {
    case 'Button':      return <ButtonPlayer      step={step} onAdvance={onAdvance} />;
    case 'Comment':     return <CommentPlayer     step={step} onAdvance={onAdvance} />;
    case 'Datetime':    return <DatetimePlayer    step={step} onAdvance={onAdvance} />;
    case 'Image':       return <ImagePlayer       step={step} onAdvance={onAdvance} />;
    case 'RadioButton': return <RadioButtonPlayer step={step} onAdvance={onAdvance} />;
    case 'Select':      return <SelectPlayer      step={step} onAdvance={onAdvance} />;
    case 'Checkbox':    return <CheckboxPlayer    step={step} onAdvance={onAdvance} />;
  }
}
