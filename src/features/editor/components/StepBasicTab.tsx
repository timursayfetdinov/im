import { useForm } from '@tanstack/react-form';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { Step } from '../../../shared/types/scenario';
import { useEditorStore } from '../store/editorStore';

function useStepFieldError(stepId: string, field: string): string | undefined {
  return useEditorStore(
    s => s.validationErrors.find(e => e.stepId === stepId && e.field === field)?.message
  );
}

type Props = { step: Step };

type BoolField = 'finish' | 'report' | 'revisitable' | 'multitasking';
type TextField_ = 'title' | 'description';

const BOOL_FIELDS: { name: BoolField; label: string; hint: string }[] = [
  { name: 'finish', label: 'Завершение сценария', hint: 'Этот шаг является финальным' },
  {
    name: 'revisitable',
    label: 'Повторно посещаемый',
    hint: 'Оператор может снова открыть этот шаг после перехода к другим',
  },
  // { name: 'multitasking', label: 'Мультизадачность', hint: 'Шаг доступен параллельно с другими задачами' },
];

/**
 * «Основное» tab rendered inside StepDrawer.
 * Mounts fresh for each step (key={step.id} in parent), so defaultValues are always correct.
 */
export function StepBasicTab({ step }: Props) {
  const updateStep = useEditorStore(s => s.updateStep);
  const updateMeta = useEditorStore(s => s.updateMeta);
  const initialStepId = useEditorStore(s => s.scenario?.scenario.initialStep ?? '');
  const isInitial = initialStepId === step.id;
  const titleError = useStepFieldError(step.id, 'title');
  const finishError = useStepFieldError(step.id, 'finish');

  const form = useForm({
    defaultValues: {
      title: step.title,
      description: step.description,
      finish: step.finish,
      report: step.report,
      revisitable: step.revisitable,
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
              field.handleChange(e.target.value);
            }}
            onBlur={() => {
              field.handleBlur();
              syncText('title', field.state.value);
            }}
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
          <Box>
            <FormControlLabel
              sx={{ alignItems: 'flex-start', ml: 0 }}
              label={
                <Box sx={{ ml: 0.5 }}>
                  <Typography variant="body2">Начальный шаг</Typography>
                  <Typography variant="caption" color="text.secondary">
                    С этого шага начинается сценарий
                  </Typography>
                </Box>
              }
              control={
                <Switch
                  size="small"
                  checked={isInitial}
                  onChange={e => {
                    updateMeta({ initialStep: e.target.checked ? step.id : '' });
                  }}
                />
              }
            />
          </Box>
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
