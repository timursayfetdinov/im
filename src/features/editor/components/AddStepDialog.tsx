import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { STEP_TYPES } from '../config/stepMeta';
import type { StepType } from '../../../shared/types/scenario';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (type: StepType) => void;
};

export function AddStepDialog({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Выберите тип шага
        <IconButton
          aria-label="Закрыть"
          onClick={onClose}
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
      <DialogContent sx={{ pb: 3 }}>
        <Grid container spacing={2}>
          {STEP_TYPES.map(({ type, label, description, color, Icon }) => (
            <Grid key={type} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  '&:hover': { borderColor: color, boxShadow: `0 0 0 1px ${color}` },
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                <CardActionArea
                  onClick={() => {
                    onSelect(type);
                    onClose();
                  }}
                  sx={{ height: '100%' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Icon fontSize="medium" sx={{ color }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
