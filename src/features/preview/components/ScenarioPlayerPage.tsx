import { useMemo, useState, useCallback, useRef, useLayoutEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate, useParams } from '@tanstack/react-router';

import type { Scenario } from '../../../shared/types/scenario';
import { useScenario } from '../../scenarios/api/useScenarios';
import { resolveNextStep, formatStepValue, type StepValue } from '../lib/playerEngine';
import { PLAYER_PATH_LAYOUT_MODE } from '../lib/playerPreviewLayout';
import type { PlayerHistoryEntry } from '../lib/playerTypes';
import { FinishPreviewDiagram } from './FinishPreviewDiagram';
import { PreviewPathBreadcrumbs } from './PreviewPathBreadcrumbs';
import { PreviewPathTimeline } from './PreviewPathTimeline';
import { PreviewPlayerResizableLayout, DEFAULT_PREVIEW_SPLIT_LEFT } from './PreviewPlayerResizableLayout';
import { StepPlayer } from './StepPlayer';

// ─── Finish screen ────────────────────────────────────────────────────────────

function FinishScreen({
  history,
  scenario,
  finishedAt,
  leftShare,
  onLeftShareChange,
  onReset,
  onGoToStep,
}: {
  history: PlayerHistoryEntry[];
  scenario: Scenario;
  finishedAt: string;
  leftShare: number;
  onLeftShareChange: (share: number) => void;
  onReset: () => void;
  onGoToStep: (index: number) => void;
}) {
  const [jsonOpen, setJsonOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const visitedStepIds = useMemo(
    () => new Set(history.map((h) => h.step.id)),
    [history],
  );

  const resultJson = useMemo(() => {
    const result = {
      scenario: {
        id: scenario.scenario.id,
        version: scenario.scenario.version,
      },
      finishedAt,
      history: history.map((h) => {
        const row: Record<string, unknown> = {
          stepId: h.step.id,
          startedAt: h.startedAt,
          completedAt: h.completedAt,
          userId: null,
        };
        if (h.value !== null) {
          row.value = h.value;
        }
        return row;
      }),
    };
    return JSON.stringify(result, null, 2);
  }, [finishedAt, history, scenario.scenario.id, scenario.scenario.version]);

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(resultJson);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1500);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 2500);
    }
  }

  function handleDownloadJson() {
    const blob = new Blob([resultJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-result-${scenario.scenario.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <>
      <PreviewPlayerResizableLayout
        leftShare={leftShare}
        onLeftShareChange={onLeftShareChange}
        leftPanel={
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: { md: 'flex-start' },
              p: { xs: 2, md: 3 },
            }}
          >
            <Card variant="outlined" sx={{ maxWidth: 560, width: '100%' }}>
              <CardContent>
                <Stack spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
                  <CheckCircleOutlinedIcon sx={{ fontSize: 64, color: 'success.main' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
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
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                        px: 1,
                      }}
                    >
                      <ListItemText
                        primary={entry.step.title}
                        secondary={formatStepValue(entry.step, entry.value)}
                        slotProps={{
                          primary: { variant: 'body2', sx: { fontWeight: 500 } },
                          secondary: { variant: 'caption' },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Button startIcon={<RefreshIcon />} variant="outlined" onClick={onReset}>
                    Сбросить и пройти снова
                  </Button>
                  <Button
                    startIcon={<DataObjectOutlinedIcon />}
                    variant="outlined"
                    onClick={() => setJsonOpen(true)}
                  >
                    JSON
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        }
        rightPanel={
          <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
            <FinishPreviewDiagram scenario={scenario} visitedStepIds={visitedStepIds} />
          </Box>
        }
      />

    <Dialog open={jsonOpen} onClose={() => setJsonOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          JSON результата
          <IconButton
            aria-label="Закрыть"
            onClick={() => setJsonOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            value={resultJson}
            fullWidth
            multiline
            minRows={18}
            size="small"
            slotProps={{
              input: {
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '0.8rem' },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyJson}
            color={copyState === 'error' ? 'error' : 'primary'}
          >
            {copyState === 'copied' ? 'Скопировано' : copyState === 'error' ? 'Не удалось' : 'Скопировать'}
          </Button>
          <Button startIcon={<DownloadOutlinedIcon />} onClick={handleDownloadJson}>
            Скачать
          </Button>
          <Button onClick={() => setJsonOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Player ───────────────────────────────────────────────────────────────────

function Player({ scenario }: { scenario: Scenario }) {
  const stepMap = new Map(scenario.steps.map((s) => [s.id, s]));
  const initialStep = stepMap.get(scenario.scenario.initialStep);

  const [history, setHistory] = useState<PlayerHistoryEntry[]>([]);
  const [currentStepId, setCurrentStepId] = useState<string | null>(
    initialStep?.id ?? null
  );
  const [finished, setFinished] = useState(false);
  const [finishedAt, setFinishedAt] = useState<string | null>(null);
  const [currentStepStartedAt, setCurrentStepStartedAt] = useState(() => new Date().toISOString());
  const [splitLeftShare, setSplitLeftShare] = useState(DEFAULT_PREVIEW_SPLIT_LEFT);

  const lastStepIdRef = useRef<string | null>(null);
  const stepEnteredAtRef = useRef<string>(new Date().toISOString());

  useLayoutEffect(() => {
    if (currentStepId == null) return;
    if (lastStepIdRef.current !== currentStepId) {
      lastStepIdRef.current = currentStepId;
      const now = new Date().toISOString();
      stepEnteredAtRef.current = now;
      setCurrentStepStartedAt(now);
    }
  }, [currentStepId]);

  const currentStep = currentStepId ? stepMap.get(currentStepId) ?? null : null;

  function reset() {
    lastStepIdRef.current = null;
    setHistory([]);
    setCurrentStepId(initialStep?.id ?? null);
    setFinished(false);
    setFinishedAt(null);
  }

  const handleAdvance = useCallback(
    (value: StepValue) => {
      if (!currentStep) return;

      const nextId = resolveNextStep(currentStep, value, scenario);
      const startedAt = stepEnteredAtRef.current;
      const completedAt = new Date().toISOString();
      setHistory((prev) => [...prev, { step: currentStep, value, startedAt, completedAt }]);

      if (nextId === null) {
        setFinishedAt(completedAt);
        setFinished(true);
        setCurrentStepId(null);
      } else {
        setCurrentStepId(nextId);
      }
    },
    [currentStep, scenario]
  );

  const handleGoToHistoryStep = useCallback(
    (index: number) => {
      const entry = history[index];
      if (!entry) return;
      setHistory(history.slice(0, index));
      setCurrentStepId(entry.step.id);
      setFinished(false);
      setFinishedAt(null);
    },
    [history]
  );

  if (finished) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignSelf: 'stretch',
          width: '100%',
          minHeight: 0,
          height: { md: 'calc(100dvh - 48px)' },
        }}
      >
        <FinishScreen
          history={history}
          scenario={scenario}
          finishedAt={finishedAt ?? new Date().toISOString()}
          leftShare={splitLeftShare}
          onLeftShareChange={setSplitLeftShare}
          onReset={reset}
          onGoToStep={handleGoToHistoryStep}
        />
      </Box>
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

  const stepPanel = (
    <Stack
      spacing={3}
      sx={{
        p: 3,
        alignItems: 'center',
        width: '100%',
        flex: { md: 1 },
        minHeight: { md: 0 },
        overflow: { md: 'auto' },
      }}
    >
      {PLAYER_PATH_LAYOUT_MODE === 'breadcrumbs' && history.length > 0 && (
        <PreviewPathBreadcrumbs
          history={history}
          currentStep={currentStep}
          onGoToHistoryStep={handleGoToHistoryStep}
        />
      )}
      <StepPlayer key={currentStepId} step={currentStep} onAdvance={handleAdvance} />
    </Stack>
  );

  const timelinePanel = (
    <PreviewPathTimeline
      history={history}
      currentStep={currentStep}
      currentStepStartedAt={currentStepStartedAt}
      onGoToHistoryStep={handleGoToHistoryStep}
    />
  );

  if (PLAYER_PATH_LAYOUT_MODE === 'timeline') {
    return (
      <PreviewPlayerResizableLayout
        leftPanel={stepPanel}
        rightPanel={timelinePanel}
        leftShare={splitLeftShare}
        onLeftShareChange={setSplitLeftShare}
      />
    );
  }

  return (
    <Stack
      spacing={3}
      sx={{
        p: 3,
        alignItems: 'center',
        flex: 1,
        overflow: 'auto',
        minHeight: 0,
        width: '100%',
      }}
    >
      {history.length > 0 && (
        <PreviewPathBreadcrumbs
          history={history}
          currentStep={currentStep}
          onGoToHistoryStep={handleGoToHistoryStep}
        />
      )}
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
          <Typography variant="subtitle1" sx={{ fontWeight: 500, flexGrow: 1 }}>
            {scenario ? scenario.scenario.name : 'Предпросмотр'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Предпросмотр
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
