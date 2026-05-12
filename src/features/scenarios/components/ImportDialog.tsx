import { useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useNavigate } from '@tanstack/react-router';

import { scenarioSchema } from '../../../shared/schema/scenario.zod';
import { useImportScenario } from '../api/useScenarios';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: Props) {
  const navigate = useNavigate();
  const importMutation = useImportScenario();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function handleClose() {
    setErrors([]);
    onClose();
  }

  function processFile(file: File) {
    setErrors([]);
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setErrors(['Ожидается файл формата .json']);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setErrors(['Файл содержит некорректный JSON']);
        return;
      }
      const result = scenarioSchema.safeParse(parsed);
      if (!result.success) {
        const messages = result.error.issues.map(
          (issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`
        );
        setErrors(messages);
        return;
      }
      importMutation.mutate(result.data, {
        onSuccess: (scenario) => {
          handleClose();
          navigate({ to: '/scenarios/$id', params: { id: scenario.scenario.id } });
        },
        onError: () => {
          setErrors(['Ошибка при сохранении сценария. Попробуйте ещё раз.']);
        },
      });
    };
    reader.onerror = () => setErrors(['Не удалось прочитать файл']);
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Импорт сценария
        <IconButton
          aria-label="Закрыть"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <input
          type="file"
          accept=".json,application/json"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Box
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            mt: 1,
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 6,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragging ? 'action.hover' : 'background.paper',
            transition: 'border-color 0.2s, background-color 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
          }}
        >
          <UploadFileOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            Перетащите файл .json или нажмите для выбора
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Допустимый формат: JSON (схема сценария Axxonsoft)
          </Typography>
        </Box>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }} gutterBottom>
              Файл не прошёл проверку:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {errors.map((msg, i) => (
                <li key={i}>
                  <Typography variant="caption">{msg}</Typography>
                </li>
              ))}
            </Box>
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={importMutation.isPending}>
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}
