import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import type { Step } from '../../../shared/types/scenario';
import { STEP_META } from '../../editor/config/stepMeta';
import { formatStepValue } from '../lib/playerEngine';
import type { PlayerHistoryEntry } from '../lib/playerTypes';

function formatRunTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

type NodeProps = {
  step: Step;
  titleLine: string;
  timeLine: string;
  detailLine?: string;
  description?: string;
  active?: boolean;
  onClick?: () => void;
  showConnectorBelow: boolean;
};

function TimelineNode({
  step,
  titleLine,
  timeLine,
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
              bgcolor: 'divider',
              borderRadius: 1,
            }}
          />
        )}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1, pt: 0.25 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
          {meta.label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
          {titleLine}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          {timeLine}
        </Typography>
        {detailLine ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {detailLine}
          </Typography>
        ) : null}
        {description ? (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: 'block', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            title={description}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

type Props = {
  history: PlayerHistoryEntry[];
  currentStep: Step;
  currentStepStartedAt: string;
  onGoToHistoryStep: (index: number) => void;
};

/**
 * Вертикальный timeline пройденных шагов и текущего (справа в превью).
 */
export function PreviewPathTimeline({
  history,
  currentStep,
  currentStepStartedAt,
  onGoToHistoryStep,
}: Props) {
  const hasCurrent = Boolean(currentStep);

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
      <Typography variant="overline" color="text.secondary" sx={{ px: 1.5, pb: 1, letterSpacing: 0.08 }}>
        Ход сценария
      </Typography>

      {history.map((entry, i) => {
        const showConnector = hasCurrent || i < history.length - 1;
        return (
          <TimelineNode
            key={`${entry.step.id}-${entry.completedAt}-${i}`}
            step={entry.step}
            titleLine={entry.step.title || 'Без названия'}
            timeLine={`Завершён: ${formatRunTime(entry.completedAt)}`}
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
          timeLine={`Начат: ${formatRunTime(currentStepStartedAt)}`}
          detailLine="Текущий шаг"
          description={currentStep.description?.trim() || undefined}
          active
          showConnectorBelow={false}
        />
      )}
    </Stack>
  );
}
