import { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import type { DiagramEdgeData } from '../lib/buildDiagramGraph';

export function DiagramEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  label,
  labelStyle,
  labelBgStyle,
  data,
}: EdgeProps<Edge<DiagramEdgeData>>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const condition = data?.condition;
  const hasCondition =
    condition != null && Object.keys(condition).length > 0;

  const [hovered, setHovered] = useState(false);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          ...(hovered && hasCondition ? { strokeWidth: 2.5, filter: 'brightness(0.85)' } : {}),
        }}
        label={label}
        labelX={labelX}
        labelY={labelY}
        labelStyle={labelStyle}
        labelShowBg
        labelBgStyle={labelBgStyle}
      />

      {hasCondition && (
        <EdgeLabelRenderer>
          <Tooltip
            title={
              <Box
                component="pre"
                sx={{ m: 0, fontSize: '0.7rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
              >
                {JSON.stringify(condition, null, 2)}
              </Box>
            }
            placement="top"
            arrow
          >
            <Box
              className="nodrag nopan"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              sx={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                width: 32,
                height: 32,
                pointerEvents: 'all',
                cursor: 'default',
                borderRadius: '50%',
                // Visible hint on the edge midpoint when there's a condition
                bgcolor: hovered ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                border: hovered ? '1px dashed #f59e0b' : '1px dashed transparent',
                transition: 'background-color 0.15s, border-color 0.15s',
              }}
            />
          </Tooltip>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
