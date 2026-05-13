import { useCallback, useRef, useState } from 'react';
import Box from '@mui/material/Box';

/** Доля левой панели по умолчанию (правая ≈ 32%). */
export const DEFAULT_PREVIEW_SPLIT_LEFT = 0.68;

export type PreviewPlayerResizableLayoutProps = {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  /** Доля левой части (0.5–0.75). Если заданы оба с `onLeftShareChange` — контролируемый режим. */
  leftShare?: number;
  onLeftShareChange?: (leftShare: number) => void;
};

const DIVIDER_PX = 6;

/**
 * На md+: две панели с перетаскиваемым разделителем.
 * Доля левой ∈ [50%, 75%], правой ∈ [25%, 50%].
 * На xs: колонка — слева/сверху левая панель, справа/снизу правая (без resize).
 */
export function PreviewPlayerResizableLayout({
  leftPanel,
  rightPanel,
  leftShare: leftShareProp,
  onLeftShareChange,
}: PreviewPlayerResizableLayoutProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [internalLeft, setInternalLeft] = useState(DEFAULT_PREVIEW_SPLIT_LEFT);
  const controlled =
    typeof leftShareProp === 'number' && typeof onLeftShareChange === 'function';
  const leftShare = controlled ? leftShareProp : internalLeft;
  const setLeftShare = useCallback(
    (v: number) => {
      const next = Math.min(0.75, Math.max(0.5, v));
      if (controlled) onLeftShareChange(next);
      else setInternalLeft(next);
    },
    [controlled, onLeftShareChange]
  );

  const onDividerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const row = rowRef.current;
      if (!row) return;
      const startLeftShare = leftShare;
      const startClientX = e.clientX;

      const onMove = (ev: MouseEvent) => {
        const rect = row.getBoundingClientRect();
        const delta = (ev.clientX - startClientX) / rect.width;
        setLeftShare(startLeftShare + delta);
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [leftShare, setLeftShare]
  );

  const rightShare = 1 - leftShare;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Mobile */}
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: '1 1 55%',
            minHeight: 0,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {leftPanel}
        </Box>
        <Box sx={{ height: 1, flexShrink: 0, bgcolor: 'divider' }} />
        <Box
          sx={{
            flex: '0 1 45%',
            minHeight: 120,
            maxHeight: '42vh',
            overflow: 'auto',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {rightPanel}
        </Box>
      </Box>

      {/* Desktop */}
      <Box
        ref={rowRef}
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'row',
          flex: 1,
          minHeight: 0,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            width: `calc(${leftShare * 100}% - ${DIVIDER_PX / 2}px)`,
            minWidth: '50%',
            maxWidth: '75%',
            minHeight: 0,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {leftPanel}
        </Box>

        <Box
          onMouseDown={onDividerMouseDown}
          role="separator"
          aria-orientation="vertical"
          sx={{
            flexShrink: 0,
            width: DIVIDER_PX,
            cursor: 'col-resize',
            bgcolor: 'divider',
            alignSelf: 'stretch',
            flexGrow: 0,
            '&:hover': { bgcolor: 'action.selected' },
          }}
        />

        <Box
          sx={{
            flexShrink: 0,
            width: `calc(${rightShare * 100}% - ${DIVIDER_PX / 2}px)`,
            minWidth: '25%',
            maxWidth: '50%',
            minHeight: 0,
            overflow: 'hidden',
            borderLeft: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {rightPanel}
        </Box>
      </Box>
    </Box>
  );
}
