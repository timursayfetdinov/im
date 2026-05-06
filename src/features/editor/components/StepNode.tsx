import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import FlagIcon from '@mui/icons-material/Flag';
import StarIcon from '@mui/icons-material/Star';

import type { StepNodeData } from '../lib/buildDiagramGraph';
import { STEP_META } from '../config/stepMeta';

type Props = {
  data: StepNodeData;
  selected: boolean;
};

export const StepNode = memo(function StepNode({ data }: Props) {
  const { step, isInitial, isOrphan } = data;
  const meta = STEP_META[step.type];

  const borderColor = isOrphan
    ? '#94a3b8'
    : isInitial
      ? '#f59e0b'
      : meta.color;

  const bgColor = step.finish ? '#f0fdf4' : isOrphan ? '#f8fafc' : '#fff';
  const opacity = isOrphan ? 0.6 : 1;

  const viewLabel = getViewLabel(step);

  return (
    <Box
      sx={{
        width: 220,
        minHeight: 80,
        bgcolor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 2,
        px: 1.5,
        py: 1,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      {/* Top row: type chip + badges */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        <Chip
          label={meta.label}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.65rem',
            bgcolor: `${meta.color}18`,
            color: meta.color,
            fontWeight: 600,
            border: `1px solid ${meta.color}40`,
          }}
        />
        {isInitial && (
          <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} titleAccess="Начальный шаг" />
        )}
        {step.finish && (
          <FlagIcon sx={{ fontSize: 14, color: '#16a34a' }} titleAccess="Завершающий шаг" />
        )}
      </Box>

      {/* Title */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          fontSize: '0.78rem',
          lineHeight: 1.3,
          color: isOrphan ? 'text.disabled' : 'text.primary',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {step.title || step.id}
      </Typography>

      {/* View label */}
      {viewLabel && (
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.68rem',
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {viewLabel}
        </Typography>
      )}

      <Handle type="target" position={Position.Top} style={{ background: borderColor, width: 8, height: 8 }} />
      {buildSourceHandles(step, borderColor)}
    </Box>
  );
});

function buildSourceHandles(step: StepNodeData['step'], color: string) {
  const rules = step.transitions.rules ?? [];
  const hasDefault = Boolean(step.transitions.default.goto);

  const handleIds: string[] = [
    ...rules.map((_, i) => `rule-${i}`),
    ...(hasDefault ? ['default'] : []),
  ];

  if (handleIds.length === 0) return null;

  return handleIds.map((id, i) => {
    const left = `${((i + 1) / (handleIds.length + 1)) * 100}%`;
    const isRule = id !== 'default';
    return (
      <Handle
        key={id}
        id={id}
        type="source"
        position={Position.Bottom}
        style={{
          background: isRule ? '#f59e0b' : color,
          width: 8,
          height: 8,
          left,
          transform: 'translateX(-50%)',
        }}
      />
    );
  });
}

function getViewLabel(step: StepNodeData['step']): string {
  switch (step.type) {
    case 'Button':
    case 'Comment':
    case 'Datetime':
    case 'Image':
      return step.view.label || '';
    case 'RadioButton':
      return step.view.label || '';
    case 'Checkbox':
      return step.view.label || '';
    case 'Select':
      return step.view.lists.map((l) => l.label).join(', ');
    default:
      return '';
  }
}
