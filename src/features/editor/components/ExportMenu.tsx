import { useState } from 'react';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import type { Scenario } from '../../../shared/types/scenario';

interface Props {
  scenario: Scenario;
}

export function ExportMenu({ scenario }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);

  function handleDownload() {
    const json = JSON.stringify(scenario, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.scenario.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setAnchor(null);
  }

  async function handleCopy() {
    const json = JSON.stringify(scenario, null, 2);
    await navigator.clipboard.writeText(json);
    setAnchor(null);
    setSnackOpen(true);
  }

  return (
    <>
      <Button
        size="small"
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        Экспорт
      </Button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { elevation: 2 } }}
      >
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Скачать JSON</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Скопировать JSON</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackOpen}
        autoHideDuration={2500}
        onClose={() => setSnackOpen(false)}
        message="Скопировано в буфер"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
