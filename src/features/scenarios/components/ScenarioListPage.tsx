import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from '@tanstack/react-router';

import {
  useCreateScenario,
  useDeleteScenario,
  useDuplicateScenario,
  useScenarioList,
} from '../api/useScenarios';
import { CreateScenarioDialog } from './CreateScenarioDialog';
import { DeleteScenarioDialog } from './DeleteScenarioDialog';
import { ImportDialog } from './ImportDialog';
import type { ScenarioMeta } from '../../../shared/types/scenario';

export function ScenarioListPage() {
  const navigate = useNavigate();
  const { data: scenarios, isLoading } = useScenarioList();

  const createMutation = useCreateScenario();
  const deleteMutation = useDeleteScenario();
  const duplicateMutation = useDuplicateScenario();

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScenarioMeta | null>(null);

  const filtered = (scenarios ?? []).filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate(name: string, description: string) {
    createMutation.mutate(
      { name, description },
      {
        onSuccess: scenario => {
          setCreateOpen(false);
          navigate({ to: '/scenarios/$id', params: { id: scenario.scenario.id } });
        },
      }
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  function handleDuplicate(id: string) {
    duplicateMutation.mutate(id, {
      onSuccess: scenario =>
        navigate({ to: '/scenarios/$id', params: { id: scenario.scenario.id } }),
    });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Редактор сценариев
          </Typography>
          <Button
            color="inherit"
            startIcon={<FileUploadOutlinedIcon />}
            onClick={() => setImportOpen(true)}
            sx={{ mr: 1 }}
          >
            Импорт
          </Button>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ color: 'primary.main', bgcolor: 'white' }}
          >
            Создать
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
        <TextField
          placeholder="Поиск по названию или описанию…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ mb: 2, width: 360 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Изменён</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      {search ? 'Ничего не найдено' : 'Сценариев пока нет. Нажмите «Создать».'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(s => (
                    <TableRow
                      key={s.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate({ to: '/scenarios/$id', params: { id: s.id } })}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {s.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {s.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(s.updatedAt).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={e => e.stopPropagation()}>
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={() => navigate({ to: '/scenarios/$id', params: { id: s.id } })}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Дублировать">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicate(s.id)}
                            disabled={duplicateMutation.isPending}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(s)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <CreateScenarioDialog
        open={createOpen}
        loading={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <DeleteScenarioDialog
        open={!!deleteTarget}
        scenarioName={deleteTarget?.name ?? ''}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </Box>
  );
}
