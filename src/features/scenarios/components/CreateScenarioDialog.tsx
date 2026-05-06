import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

type Props = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
};

export function CreateScenarioDialog({ open, loading, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit(name.trim(), description.trim());
    setName('');
    setDescription('');
  }

  function handleClose() {
    setName('');
    setDescription('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Новый сценарий</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            error={name.trim() === '' && name !== ''}
            helperText={name.trim() === '' && name !== '' ? 'Обязательное поле' : ''}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <TextField
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim() || loading}
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}
