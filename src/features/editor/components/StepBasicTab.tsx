import { useRef } from 'react';
import { useForm } from '@tanstack/react-form';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { slugify } from '../../../shared/lib/slugify';
import type { Step } from '../../../shared/types/scenario';
import { useEditorStore } from '../store/editorStore';

function useStepFieldError(stepId: string, field: string): string | undefined {
  return useEditorStore(
    s => s.validationErrors.find(e => e.stepId === stepId && e.field === field)?.message
  );
}

type Props = { step: Step };

type BoolField = 'initial' | 'finish' | 'report' | 'editable' | 'multitasking';
type TextField_ = 'id' | 'title' | 'description';

const BOOL_FIELDS: { name: BoolField; label: string; hint: string }[] = [
  { name: 'initial', label: 'Начальный шаг', hint: 'С этого шага начинается сценарий' },
  { name: 'finish', label: 'Завершение сценария', hint: 'Этот шаг является финальным' },
  {
    name: 'editable',
    label: 'Редактируемый',
    hint: 'Оператор может изменить значение после перехода',
  },
  // { name: 'multitasking', label: 'Мультизадачность', hint: 'Шаг доступен параллельно с другими задачами' },
];

/**
 * «Основное» tab rendered inside StepDrawer.
 * Mounts fresh for each step (key={step.id} in parent), so defaultValues are always correct.
 */
export function StepBasicTab({ step }: Props) {
  const updateStep = useEditorStore(s => s.updateStep);
  const titleError = useStepFieldError(step.id, 'title');
  const idError = useStepFieldError(step.id, 'id');
  const finishError = useStepFieldError(step.id, 'finish');

  // Track whether the user manually edited the id field so auto-slug stops overwriting
  const isIdManuallyEdited = useRef(step.id !== '' && step.id !== slugify(step.title));

  const form = useForm({
    defaultValues: {
      id: step.id,
      title: step.title,
      description: step.description,
      initial: step.initial,
      finish: step.finish,
      report: step.report,
      editable: step.editable,
      multitasking: step.multitasking,
    },
    onSubmit: async () => {},
  });

  function syncText(field: TextField_, value: string) {
    updateStep(step.id, { [field]: value });
  }

  function syncBool(field: BoolField, value: boolean) {
    updateStep(step.id, { [field]: value });
  }

  return (
    <Stack sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1 }} spacing={2.5}>
      {/* title ─────────────────────────────────────────────────────────── */}
      <form.Field name="title">
        {field => (
          <TextField
            label="Название"
            size="small"
            fullWidth
            value={field.state.value}
            error={!!titleError}
            helperText={titleError}
            onChange={e => {
              const val = e.target.value;
              field.handleChange(val);
              if (!isIdManuallyEdited.current) {
                form.setFieldValue('id', slugify(val));
              }
            }}
            onBlur={() => {
              field.handleBlur();
              syncText('title', field.state.value);
              if (!isIdManuallyEdited.current) {
                const slug = slugify(field.state.value);
                form.setFieldValue('id', slug);
                syncText('id', slug);
              }
            }}
          />
        )}
      </form.Field>

      {/* id ─────────────────────────────────────────────────────────────── */}
      <form.Field name="id">
        {field => (
          <TextField
            label="ID шага"
            size="small"
            fullWidth
            value={field.state.value}
            error={!!idError}
            helperText={idError ?? 'Уникальный идентификатор — латиница, цифры, подчёркивание'}
            onChange={e => {
              isIdManuallyEdited.current = true;
              field.handleChange(e.target.value);
            }}
            onBlur={() => {
              field.handleBlur();
              syncText('id', field.state.value);
            }}
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.85rem' } } }}
          />
        )}
      </form.Field>

      {/* description ────────────────────────────────────────────────────── */}
      <form.Field name="description">
        {field => (
          <TextField
            label="Описание"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={field.state.value}
            onChange={e => field.handleChange(e.target.value)}
            onBlur={() => {
              field.handleBlur();
              syncText('description', field.state.value);
            }}
          />
        )}
      </form.Field>

      <Divider />

      {/* boolean flags ──────────────────────────────────────────────────── */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Флаги
        </Typography>
        <Stack spacing={0.5}>
          {BOOL_FIELDS.map(({ name, label, hint }) => (
            <form.Field key={name} name={name}>
              {field => (
                <Box>
                  <FormControlLabel
                    sx={{ alignItems: 'flex-start', ml: 0 }}
                    label={
                      <Box sx={{ ml: 0.5 }}>
                        <Typography
                          variant="body2"
                          color={name === 'finish' && finishError ? 'error' : undefined}
                        >
                          {label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {hint}
                        </Typography>
                      </Box>
                    }
                    control={
                      <Switch
                        size="small"
                        checked={field.state.value as boolean}
                        onChange={e => {
                          field.handleChange(e.target.checked as never);
                          syncBool(name, e.target.checked);
                        }}
                      />
                    }
                  />
                  {name === 'finish' && finishError && (
                    <Typography variant="caption" color="error" sx={{ ml: 5, display: 'block' }}>
                      {finishError}
                    </Typography>
                  )}
                </Box>
              )}
            </form.Field>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
