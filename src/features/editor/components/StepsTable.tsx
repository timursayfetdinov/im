import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FlagIcon from '@mui/icons-material/Flag';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

import { useEditorStore } from '../store/editorStore';
import { STEP_META } from '../config/stepMeta';
import { AddStepDialog } from './AddStepDialog';
import type { Step, StepType } from '../../../shared/types/scenario';

const EMPTY_STEPS: Step[] = [];
const EMPTY_ERRORS: import('../../../shared/types/scenario').ValidationError[] = [];

// ─── Transition summary ───────────────────────────────────────────────────────

function transitionSummary(step: Step, allSteps: Step[]): string {
  const stepMap = new Map(allSteps.map(s => [s.id, s.title || s.id]));
  const resolve = (id: string | null) => (id === null ? 'Завершение' : (stepMap.get(id) ?? id));

  const rules = step.transitions.rules ?? [];
  const def = resolve(step.transitions.default.goto);

  if (rules.length === 0) return `→ ${def}`;
  return `${rules.length} ${plural(rules.length, 'правило', 'правила', 'правил')} + → ${def}`;
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

type RowProps = {
  step: Step;
  allSteps: Step[];
  initialStepId: string;
  errorCount: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

function SortableRow({
  step,
  allSteps,
  initialStepId,
  errorCount,
  onEdit,
  onDuplicate,
  onDelete,
}: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const meta = STEP_META[step.type];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f5f5f5' : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style} hover>
      {/* Drag handle */}
      <TableCell sx={{ width: 32, px: 0.5, cursor: 'grab' }} {...attributes} {...listeners}>
        <DragIndicatorIcon fontSize="small" sx={{ color: 'text.disabled', display: 'block' }} />
      </TableCell>

      {/* Type */}
      <TableCell sx={{ width: 140 }}>
        <Chip
          icon={<meta.Icon fontSize="small" />}
          label={meta.label}
          size="small"
          sx={{
            bgcolor: `${meta.color}18`,
            color: meta.color,
            fontWeight: 600,
            '& .MuiChip-icon': { color: meta.color },
          }}
        />
      </TableCell>
      {/* Title */}
      <TableCell>
        <Typography variant="body2">
          {step.title || (
            <Typography component="span" variant="body2" color="text.disabled">
              Без названия
            </Typography>
          )}
        </Typography>
      </TableCell>

      {/* Flags */}
      <TableCell sx={{ width: 80 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {step.id === initialStepId ? (
            <Tooltip title="start">
              <PlayArrowIcon fontSize="small" sx={{ color: 'success.main' }} />
            </Tooltip>
          ) : null}
          {step.finish ? (
            <Tooltip title="finish">
              <FlagIcon fontSize="small" color="error" />
            </Tooltip>
          ) : null}
        </Box>
      </TableCell>

      {/* Transitions */}
      <TableCell sx={{ maxWidth: 200 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccountTreeOutlinedIcon
            fontSize="small"
            sx={{ color: 'text.disabled', flexShrink: 0 }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {transitionSummary(step, allSteps)}
          </Typography>
        </Box>
      </TableCell>

      {/* Errors */}
      <TableCell sx={{ width: 80 }}>
        {errorCount > 0 && <Chip label={errorCount} color="error" size="small" onClick={onEdit} />}
      </TableCell>

      {/* Actions */}
      <TableCell align="right" sx={{ width: 120, pr: 1 }}>
        <Tooltip title="Редактировать">
          <IconButton size="small" onClick={onEdit}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Дублировать">
          <IconButton size="small" onClick={onDuplicate}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Удалить">
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

export function StepsTable({ onRequestDelete }: { onRequestDelete?: (stepId: string) => void }) {
  const steps = useEditorStore(s => s.scenario?.steps ?? EMPTY_STEPS);
  const initialStepId = useEditorStore(s => s.scenario?.scenario.initialStep ?? '');
  const validationErrors = useEditorStore(s => s.validationErrors ?? EMPTY_ERRORS);
  const addStep = useEditorStore(s => s.addStep);
  const duplicateStep = useEditorStore(s => s.duplicateStep);
  const removeStep = useEditorStore(s => s.removeStep);
  const reorderSteps = useEditorStore(s => s.reorderSteps);
  const openStep = useEditorStore(s => s.openStep);

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = steps.findIndex(s => s.id === active.id);
    const toIndex = steps.findIndex(s => s.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) reorderSteps(fromIndex, toIndex);
  }

  function handleAddStep(type: StepType) {
    addStep(type);
  }

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 32 }} />
              <TableCell>Тип</TableCell>
              <TableCell>Название</TableCell>
              <TableCell sx={{ width: 80 }}>Флаги</TableCell>
              <TableCell>Переходы</TableCell>
              <TableCell sx={{ width: 80 }}>Ошибки</TableCell>
              <TableCell align="right" sx={{ width: 120 }}>
                Действия
              </TableCell>
            </TableRow>
          </TableHead>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {steps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Typography color="text.secondary" gutterBottom>
                        Шаги ещё не добавлены
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setAddDialogOpen(true)}
                        size="small"
                      >
                        Добавить первый шаг
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  steps.map(step => (
                    <SortableRow
                      key={step.id}
                      step={step}
                      allSteps={steps}
                      initialStepId={initialStepId}
                      errorCount={validationErrors.filter(e => e.stepId === step.id).length}
                      onEdit={() => openStep(step.id, 0)}
                      onDuplicate={() => duplicateStep(step.id)}
                      onDelete={() => (onRequestDelete ? onRequestDelete(step.id) : removeStep(step.id))}
                    />
                  ))
                )}
              </TableBody>
            </SortableContext>
          </DndContext>
        </Table>
      </TableContainer>

      {steps.length > 0 && (
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            onClick={() => setAddDialogOpen(true)}
          >
            Добавить шаг
          </Button>
        </Box>
      )}

      <AddStepDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSelect={handleAddStep}
      />
    </Box>
  );
}
