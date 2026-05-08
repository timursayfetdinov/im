import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import type { ValidationError } from '../../../shared/types/scenario';
import { useEditorStore } from '../store/editorStore';
import { STEP_META } from '../config/stepMeta';
import { StepBasicTab } from './StepBasicTab';
import { StepSettingsTab } from './StepSettingsTab';
import { StepTransitionsTab } from './StepTransitionsTab';

function tabErrorCount(errors: ValidationError[], stepId: string, tab: 0 | 1 | 2): number {
  return errors.filter((e) => {
    if (e.stepId !== stepId) return false;
    if (tab === 0) return !e.field || e.field === 'title' || e.field === 'finish' || e.code === 'STEP_NOT_REACHABLE';
    if (tab === 1) return !!e.field?.startsWith('view.');
    if (tab === 2) return e.field === 'transitions';
    return false;
  }).length;
}

function TabLabel({ label, count }: { label: string; count: number }) {
  if (count === 0) return <>{label}</>;
  return (
    <Badge badgeContent={count} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 14, height: 14, right: -6, top: 0 } }}>
      {label}
    </Badge>
  );
}

export function StepDrawer({ onRequestDelete }: { onRequestDelete?: (stepId: string) => void }) {
  const step = useEditorStore((s) =>
    s.openStepId ? (s.scenario?.steps.find((st) => st.id === s.openStepId) ?? null) : null
  );
  const drawerTab = useEditorStore((s) => s.drawerTab);
  const setDrawerTab = useEditorStore((s) => s.setDrawerTab);
  const closeDrawer = useEditorStore((s) => s.closeDrawer);
  const duplicateStep = useEditorStore((s) => s.duplicateStep);
  const removeStep = useEditorStore((s) => s.removeStep);
  const validationErrors = useEditorStore((s) => s.validationErrors);

  const meta = step ? STEP_META[step.type] : null;

  return (
    <Drawer
      anchor="right"
      open={!!step}
      onClose={closeDrawer}
      slotProps={{ paper: { sx: { width: 480, display: 'flex', flexDirection: 'column' } } }}
    >
      {step && meta && (
        <>
          {/* ── Header ──────────────────────────────────────────────────── */}
          <Toolbar
            variant="dense"
            sx={{ borderBottom: 1, borderColor: 'divider', gap: 1, px: 2, flexShrink: 0 }}
          >
            <Chip
              icon={<meta.Icon fontSize="small" />}
              label={meta.label}
              size="small"
              sx={{
                bgcolor: `${meta.color}18`,
                color: meta.color,
                fontWeight: 600,
                '& .MuiChip-icon': { color: meta.color },
                mr: 'auto',
              }}
            />
            <Tooltip title="Дублировать">
              <IconButton size="small" onClick={() => { duplicateStep(step.id); closeDrawer(); }}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton
                size="small"
                color="error"
                onClick={() => (onRequestDelete ? onRequestDelete(step.id) : removeStep(step.id))}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Закрыть">
              <IconButton size="small" onClick={closeDrawer}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Toolbar>

          {/* ── Tabs ────────────────────────────────────────────────────── */}
          <Tabs
            value={drawerTab}
            onChange={(_, v) => setDrawerTab(v)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
          >
            <Tab label={<TabLabel label="Основное" count={tabErrorCount(validationErrors, step.id, 0)} />} value={0} />
            <Tab label={<TabLabel label="Настройки" count={tabErrorCount(validationErrors, step.id, 1)} />} value={1} />
            <Tab label={<TabLabel label="Переходы" count={tabErrorCount(validationErrors, step.id, 2)} />} value={2} />
          </Tabs>

          {/* ── Tab panels ──────────────────────────────────────────────── */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {drawerTab === 0 && (
              // key forces remount when a different step is opened
              <StepBasicTab key={step.id} step={step} />
            )}

            {drawerTab === 1 && (
              <StepSettingsTab key={step.id} step={step} />
            )}

            {drawerTab === 2 && (
              <StepTransitionsTab key={step.id} step={step} />
            )}
          </Box>
        </>
      )}
    </Drawer>
  );
}
