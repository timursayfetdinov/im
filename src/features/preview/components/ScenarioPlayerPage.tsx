import { useState, useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate, useParams } from '@tanstack/react-router';

import type { Step, Scenario } from '../../../shared/types/scenario';
import { useScenario } from '../../scenarios/api/useScenarios';
import { resolveNextStep, formatStepValue, type StepValue } from '../lib/playerEngine';
import { StepPlayer } from './StepPlayer';

// ─── History entry ────────────────────────────────────────────────────────────

type HistoryEntry = {
  step: Step;
  value: StepValue;
};

// ─── Finish screen ────────────────────────────────────────────────────────────

function FinishScreen({
  history,
  scenario,
  onReset,
  onGoToStep,
}: {
  history: HistoryEntry[];
  scenario: Scenario;
  onReset: () => void;
  onGoToStep: (index: number) => void;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <Card variant="outlined" sx={{ maxWidth: 560, width: '100%' }}>
        <CardContent>
          <Stack alignItems="center" spacing={1.5} sx={{ py: 2 }}>
            <CheckCircleOutlinedIcon sx={{ fontSize: 64, color: 'success.main' }} />
            <Typography variant="h5" fontWeight={600}>
              Сценарий завершён
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {scenario.scenario.name}
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Пройденные шаги
          </Typography>
          <List dense disablePadding>
            {history.map((entry, i) => (
              <ListItem
                key={i}
                disableGutters
                divider={i < history.length - 1}
                onClick={() => onGoToStep(i)}
                sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.hover' }, px: 1 }}
              >
                <ListItemText
                  primary={entry.step.title}
                  secondary={formatStepValue(entry.step, entry.value)}
                  slotProps={{
                    primary: { variant: 'body2', fontWeight: 500 },
                    secondary: { variant: 'caption' },
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button startIcon={<RefreshIcon />} variant="outlined" onClick={onReset}>
              Сбросить и пройти снова
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

// ─── Player ───────────────────────────────────────────────────────────────────

function Player({ scenario }: { scenario: Scenario }) {
  const stepMap = new Map(scenario.steps.map((s) => [s.id, s]));
  const initialStep = stepMap.get(scenario.scenario.initialStep);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(
    initialStep?.id ?? null
  );
  const [finished, setFinished] = useState(false);

  const currentStep = currentStepId ? stepMap.get(currentStepId) ?? null : null;

  function reset() {
    setHistory([]);
    setCurrentStepId(initialStep?.id ?? null);
    setFinished(false);
  }

  const handleAdvance = useCallback(
    (value: StepValue) => {
      if (!currentStep) return;

      const nextId = resolveNextStep(currentStep, value, scenario);
      setHistory((prev) => [...prev, { step: currentStep, value }]);

      if (nextId === null) {
        setFinished(true);
        setCurrentStepId(null);
      } else {
        setCurrentStepId(nextId);
      }
    },
    [currentStep, scenario]
  );

  const handleGoToHistoryStep = useCallback((index: number) => {
    setHistory((prev) => prev.slice(0, index));
    setCurrentStepId(history[index].step.id);
    setFinished(false);
  }, [history]);

  if (finished) {
    return (
      <FinishScreen
        history={history}
        scenario={scenario}
        onReset={reset}
        onGoToStep={handleGoToHistoryStep}
      />
    );
  }

  if (!initialStep) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">
          Начальный шаг не задан. Задайте его в настройках сценария.
        </Typography>
      </Box>
    );
  }

  if (!currentStep) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Шаг не найден.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3, alignItems: 'center' }}>
      {/* Breadcrumb path */}
      {history.length > 0 && (
        <Box sx={{ width: '100%', maxWidth: 560 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ flexWrap: 'wrap' }}
          >
            {history.map((entry, i) => (
              <Chip
                key={i}
                label={entry.step.title}
                size="small"
                variant="outlined"
                onClick={() => handleGoToHistoryStep(i)}
                sx={{ fontSize: '0.72rem', cursor: 'pointer' }}
              />
            ))}
            <Chip
              label={currentStep.title}
              size="small"
              color="primary"
              sx={{ fontSize: '0.72rem' }}
            />
          </Breadcrumbs>
        </Box>
      )}

      {/* Current step */}
      {/* key forces full remount when step changes so local state resets */}
      <StepPlayer key={currentStepId} step={currentStep} onAdvance={handleAdvance} />
    </Stack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ScenarioPlayerPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();

  const { data: scenario, isLoading, isError } = useScenario(id);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Tooltip title="Назад в редактор">
            <IconButton
              edge="start"
              onClick={() => navigate({ to: '/scenarios/$id', params: { id } })}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle1" fontWeight={500} sx={{ flexGrow: 1 }}>
            {scenario ? scenario.scenario.name : 'Предпросмотр'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Предпросмотр
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">Не удалось загрузить сценарий.</Typography>
          </Box>
        )}

        {scenario && <Player key={scenario.scenario.id} scenario={scenario} />}
      </Box>
    </Box>
  );
}
