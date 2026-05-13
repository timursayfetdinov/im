import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import type { Step } from '../../../shared/types/scenario';
import type { PlayerHistoryEntry } from '../lib/playerTypes';

type Props = {
  history: PlayerHistoryEntry[];
  currentStep: Step;
  onGoToHistoryStep: (index: number) => void;
};

/**
 * Прежний путь по шагам: Breadcrumbs + Chip (можно включить через `PLAYER_PATH_LAYOUT_MODE`).
 */
export function PreviewPathBreadcrumbs({ history, currentStep, onGoToHistoryStep }: Props) {
  if (history.length === 0) return null;

  return (
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
            onClick={() => onGoToHistoryStep(i)}
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
  );
}
