import { type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import type { Step } from '../../../shared/types/scenario';
import { STEP_META } from '../../editor/config/stepMeta';
import { formatStepValue } from '../lib/playerEngine';
import {
  formatStepRunTime,
  getScenarioProcessingStartIso,
  isFirstInitialHistoryIndex,
} from '../lib/stepTimingUi';
import type { PlayerHistoryEntry } from '../lib/playerTypes';

type NodeProps = {
  step: Step;
  titleLine: string;
  timingBlock?: ReactNode;
  detailLine?: string;
  description?: string;
  active?: boolean;
  onClick?: () => void;
  showConnectorBelow: boolean;
};

function TimelineNode({
  step,
  titleLine,
  timingBlock,
  detailLine,
  description,
  active,
  onClick,
  showConnectorBelow,
}: NodeProps) {
  const meta = STEP_META[step.type];
  const Icon = meta.Icon;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        gap: 1.5,
        py: 1,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 1,
        pr: 0.5,
        '&:hover': onClick
          ? { bgcolor: 'action.hover' }
          : active
            ? { bgcolor: alpha(meta.color, 0.06) }
            : undefined,
        ...(active && {
          bgcolor: alpha(meta.color, 0.08),
          outline: `1px solid ${alpha(meta.color, 0.35)}`,
        }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 40,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(meta.color, 0.18),
            color: meta.color,
            border: `2px solid ${alpha(meta.color, active ? 0.9 : 0.45)}`,
          }}
        >
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        {showConnectorBelow && (
          <Box
            sx={{
              width: 2,
              flexGrow: 1,
              minHeight: 12,
              mt: 2,
              bgcolor: 'divider',
              borderRadius: 1,
            }}
          />
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', lineHeight: 1.3 }}
        >
          {meta.label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
          {titleLine}
        </Typography>
        {timingBlock ? <Box sx={{ mt: 0.25 }}>{timingBlock}</Box> : null}
        {detailLine ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {detailLine}
          </Typography>
        ) : null}
        {description ? (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              display: 'block',
              mt: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={description}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function historyTimingBlock(
  entry: PlayerHistoryEntry,
  index: number,
  history: PlayerHistoryEntry[],
  initialStepId: string
): ReactNode | null {
  const showStart = isFirstInitialHistoryIndex(history, index, initialStepId);
  const showEnd = entry.step.finish;
  if (!showStart && !showEnd) return null;
  return (
    <Stack spacing={0.25}>
      {showStart ? (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
          Начало: {formatStepRunTime(entry.startedAt)}
        </Typography>
      ) : null}
      {showEnd ? (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
          Конец: {formatStepRunTime(entry.completedAt)}
        </Typography>
      ) : null}
    </Stack>
  );
}

/** Текущий шаг: начало сессии (от первого шага), конец «в процессе» */
function CurrentStepTiming({
  sessionStartedAt,
  isInitialStep,
  isFinish,
}: {
  sessionStartedAt: string;
  isInitialStep: boolean;
  isFinish: boolean;
}) {
  if (isInitialStep) {
    return (
      <Stack spacing={0.25}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
          Начало: {formatStepRunTime(sessionStartedAt)}
        </Typography>
      </Stack>
    );
  }
  if (isFinish) {
    return (
      <Stack spacing={0.25}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
          Конец: {formatStepRunTime(sessionStartedAt)}
        </Typography>
      </Stack>
    );
  }
  return null;
}

type Props = {
  history: PlayerHistoryEntry[];
  currentStep: Step;
  currentStepStartedAt: string;
  /** `scenario.initialStep` — для «Начало» по `startedAt` на первом заходе на этот шаг */
  initialStepId: string;
  onGoToHistoryStep: (index: number) => void;
};

/**
 * Вертикальный timeline пройденных шагов и текущего (справа в превью).
 */
export function PreviewPathTimeline({
  history,
  currentStep,
  currentStepStartedAt,
  initialStepId,
  onGoToHistoryStep,
}: Props) {
  const hasCurrent = Boolean(currentStep);
  const n = history.length;
  const scenarioStartedAt = getScenarioProcessingStartIso(
    history,
    currentStep.id,
    currentStepStartedAt,
    initialStepId
  );

  return (
    <Stack
      component="aside"
      spacing={0}
      sx={{
        height: '100%',
        overflow: 'auto',
        py: 1,
        px: 0.5,
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 1.5, pb: 1, letterSpacing: 0.08 }}
      >
        Ход сценария
      </Typography>

      {history.map((entry, i) => {
        const showConnector = hasCurrent || i < n - 1;
        return (
          <TimelineNode
            key={`${entry.step.id}-${entry.completedAt}-${i}`}
            step={entry.step}
            titleLine={entry.step.title || 'Без названия'}
            timingBlock={historyTimingBlock(entry, i, history, initialStepId)}
            detailLine={formatStepValue(entry.step, entry.value)}
            description={entry.step.description?.trim() || undefined}
            onClick={() => onGoToHistoryStep(i)}
            showConnectorBelow={showConnector}
          />
        );
      })}

      {hasCurrent && (
        <TimelineNode
          step={currentStep}
          titleLine={currentStep.title || 'Без названия'}
          timingBlock={
            <CurrentStepTiming
              isInitialStep={initialStepId === currentStep.id}
              isFinish={currentStep.finish}
              sessionStartedAt={scenarioStartedAt}
            />
          }
          detailLine="Текущий шаг"
          description={currentStep.description?.trim() || undefined}
          active
          showConnectorBelow={false}
        />
      )}
    </Stack>
  );
}
