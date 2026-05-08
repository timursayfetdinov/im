import { useEffect, useMemo, useRef, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useParams } from '@tanstack/react-router';

import type { ValidationError } from '../../../shared/types/scenario';

import { useScenario, useSaveScenario } from '../../scenarios/api/useScenarios';
import { useEditorStore } from '../store/editorStore';
import { ExportMenu } from './ExportMenu';
import { ScenarioDiagram } from './ScenarioDiagram';
import { StepsTable } from './StepsTable';
import { StepDrawer } from './StepDrawer';
import { DeleteStepDialog } from './DeleteStepDialog';

type ViewMode = 'table' | 'diagram';

export function EditorPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();

  const { data: scenarioData, isLoading, isError } = useScenario(id);
  const saveMutation = useSaveScenario();

  const loadScenario = useEditorStore(s => s.loadScenario);
  const updateMeta = useEditorStore(s => s.updateMeta);
  const clearScenario = useEditorStore(s => s.clearScenario);
  const scenario = useEditorStore(s => s.scenario);
  const isDirty = useEditorStore(s => s.isDirty);
  const validationErrors = useEditorStore(s => s.validationErrors);
  const openStep = useEditorStore(s => s.openStep);

  const [errorsExpanded, setErrorsExpanded] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [jsonOpen, setJsonOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [deleteStepId, setDeleteStepId] = useState<string | null>(null);

  const scenarioJson = useMemo(() => (scenario ? JSON.stringify(scenario, null, 2) : ''), [scenario]);
  const deleteStep = useEditorStore(s => s.removeStep);

  const deleteStepTitle = useMemo(() => {
    if (!scenario || !deleteStepId) return '';
    return scenario.steps.find(s => s.id === deleteStepId)?.title ?? '';
  }, [scenario, deleteStepId]);

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(scenarioJson);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1500);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 2500);
    }
  }

  function requestDeleteStep(stepId: string) {
    setDeleteStepId(stepId);
  }

  function handleCloseDeleteStep() {
    setDeleteStepId(null);
  }

  function handleConfirmDeleteStep() {
    if (!deleteStepId) return;
    deleteStep(deleteStepId);
    setDeleteStepId(null);
  }

  // Guard: only load once per scenario ID to avoid infinite update loop.
  // ?? [] is NOT safe inside a Zustand selector (new ref each call → useSyncExternalStore loop).
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (scenarioData && loadedIdRef.current !== scenarioData.scenario.id) {
      loadedIdRef.current = scenarioData.scenario.id;
      loadScenario(scenarioData);
    }
  }, [scenarioData, loadScenario]);

  useEffect(() => {
    return () => {
      loadedIdRef.current = null;
      clearScenario();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleSave() {
    if (!scenario) return;
    if (validationErrors.length > 0) {
      setSaveConfirmOpen(true);
      return;
    }
    saveMutation.mutate(scenario);
  }

  function handleSaveConfirmed() {
    setSaveConfirmOpen(false);
    if (!scenario) return;
    saveMutation.mutate(scenario);
  }

  function handleErrorClick(error: ValidationError) {
    setErrorsExpanded(false);
    if (!error.stepId) return;
    const tab = error.field?.startsWith('view.') ? 1 : error.field === 'transitions' ? 2 : 0;
    openStep(error.stepId, tab as 0 | 1 | 2);
  }

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !scenario) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}
      >
        <Typography color="error">Сценарий не найден</Typography>
      </Box>
    );
  }

  const meta = scenario.scenario;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
      {/* AppBar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Tooltip title="К списку сценариев">
            <IconButton edge="start" onClick={() => navigate({ to: '/scenarios' })}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <TextField
            value={meta.name}
            onChange={e => updateMeta({ name: e.target.value })}
            variant="standard"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            slotProps={{
              input: {
                disableUnderline: false,
                sx: { fontSize: '1rem', fontWeight: 500 },
              },
            }}
          />

          {isDirty && (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              Несохранённые изменения
            </Typography>
          )}

          {validationErrors.length > 0 && (
            <Tooltip title={errorsExpanded ? 'Скрыть ошибки' : 'Показать ошибки'}>
              <Chip
                icon={<ErrorOutlinedIcon />}
                label={`Ошибки: ${validationErrors.length}`}
                color="error"
                size="small"
                onClick={() => setErrorsExpanded(v => !v)}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          )}

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(_, val) => {
              if (val) setViewMode(val);
            }}
          >
            <Tooltip title="Таблица шагов">
              <ToggleButton value="table" aria-label="Таблица">
                <TableRowsOutlinedIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Схема сценария">
              <ToggleButton value="diagram" aria-label="Схема">
                <AccountTreeOutlinedIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Button
            startIcon={<PreviewOutlinedIcon />}
            size="small"
            onClick={() => navigate({ to: `/scenarios/${id}/preview` })}
          >
            Preview
          </Button>

          <ExportMenu scenario={scenario} />

          <Tooltip title="Просмотр JSON">
            <IconButton size="small" onClick={() => setJsonOpen(true)} aria-label="JSON">
              <DataObjectOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            size="small"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            Сохранить
          </Button>
        </Toolbar>

        {/* Collapsible error list */}
        <Collapse in={errorsExpanded}>
          <List
            dense
            disablePadding
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              maxHeight: 240,
              overflowY: 'auto',
              bgcolor: 'error.50',
            }}
          >
            {validationErrors.map((err, i) => (
              <ListItemButton
                key={i}
                dense
                disabled={!err.stepId}
                onClick={() => handleErrorClick(err)}
                sx={{ py: 0.5 }}
              >
                <ListItemText
                  primary={err.message}
                  slotProps={{
                    primary: { variant: 'caption', color: 'error.dark' },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </AppBar>

      {/* Table mode */}
      {viewMode === 'table' && (
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Accordion defaultExpanded disableGutters variant="outlined" sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">Настройки сценария</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="Описание"
                  value={meta.description}
                  onChange={e => updateMeta({ description: e.target.value })}
                  multiline
                  rows={2}
                  size="small"
                  fullWidth
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Шаги сценария
          </Typography>
          <StepsTable onRequestDelete={requestDeleteStep} />
        </Box>
      )}

      {/* Diagram mode */}
      {viewMode === 'diagram' && (
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          <ScenarioDiagram scenario={scenario} />
        </Box>
      )}

      {/* Step editor drawer (table mode only) */}
      {viewMode === 'table' && <StepDrawer onRequestDelete={requestDeleteStep} />}

      {/* Save with errors confirm */}
      <Dialog
        open={saveConfirmOpen}
        onClose={() => setSaveConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Сохранить с ошибками?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Сценарий содержит {validationErrors.length}{' '}
            {validationErrors.length === 1
              ? 'ошибку'
              : validationErrors.length < 5
                ? 'ошибки'
                : 'ошибок'}
            . Он будет сохранён как черновик.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveConfirmOpen(false)}>Отмена</Button>
          <Button variant="contained" color="error" onClick={handleSaveConfirmed}>
            Сохранить черновик
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scenario JSON (readonly) */}
      <Dialog open={jsonOpen} onClose={() => setJsonOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          JSON сценария
          <IconButton
            aria-label="Закрыть"
            onClick={() => setJsonOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            value={scenarioJson}
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
          <Button onClick={() => setJsonOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <DeleteStepDialog
        open={deleteStepId !== null}
        stepTitle={deleteStepTitle}
        onClose={handleCloseDeleteStep}
        onConfirm={handleConfirmDeleteStep}
      />
    </Box>
  );
}
