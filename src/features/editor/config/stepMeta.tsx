import TouchAppIcon from '@mui/icons-material/TouchApp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { StepType } from '../../../shared/types/scenario';

export type StepMeta = {
  type: StepType;
  label: string;
  description: string;
  color: string;
  Icon: React.ComponentType<SvgIconProps>;
};

export const STEP_META: Record<StepType, StepMeta> = {
  Button: {
    type: 'Button',
    label: 'Button',
    description: 'Кнопка с линейным переходом к следующему шагу',
    color: '#1976d2',
    Icon: TouchAppIcon,
  },
  Comment: {
    type: 'Comment',
    label: 'Comment',
    description: 'Текстовое поле для ввода комментария',
    color: '#388e3c',
    Icon: ChatBubbleOutlineIcon,
  },
  Datetime: {
    type: 'Datetime',
    label: 'Datetime',
    description: 'Поле выбора даты и времени',
    color: '#7b1fa2',
    Icon: CalendarTodayIcon,
  },
  Image: {
    type: 'Image',
    label: 'Image',
    description: 'Изображение из камеры, карты или фиксированное',
    color: '#e65100',
    Icon: ImageOutlinedIcon,
  },
  RadioButton: {
    type: 'RadioButton',
    label: 'RadioButton',
    description: 'Выбор одного варианта из списка с ветвлением',
    color: '#00796b',
    Icon: RadioButtonCheckedIcon,
  },
  Select: {
    type: 'Select',
    label: 'Select',
    description: 'Один или несколько выпадающих списков с ветвлением',
    color: '#303f9f',
    Icon: ListAltIcon,
  },
  Checkbox: {
    type: 'Checkbox',
    label: 'Checkbox',
    description: 'Множественный выбор с ветвлением по комбинации',
    color: '#c2185b',
    Icon: CheckBoxOutlinedIcon,
  },
};

export const STEP_TYPES = Object.values(STEP_META);
