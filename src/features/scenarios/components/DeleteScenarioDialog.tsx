import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

type Props = {
  open: boolean;
  scenarioName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteScenarioDialog({ open, scenarioName, loading, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Удалить сценарий?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Сценарий <strong>«{scenarioName}»</strong> будет удалён без возможности восстановления.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}>
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
