import type {
  ButtonView,
  CheckboxView,
  CommentView,
  DatetimeView,
  ImageView,
  RadioButtonView,
  SelectView,
  Step,
  StepType,
  Transitions,
} from '../../../shared/types/scenario';
import { nanoid } from 'nanoid';

const defaultTransitions = (): Transitions => ({
  default: { goto: null, macro: null },
});

export function createDefaultStep(type: StepType): Step {
  const base = {
    id: '',
    title: '',
    description: '',
    revisitable: true,
    multitasking: false,
    report: true,
    finish: false,
    transitions: defaultTransitions(),
  };

  switch (type) {
    case 'Button':
      return { ...base, type, view: { label: 'Далее' } satisfies ButtonView };
    case 'Comment':
      return {
        ...base,
        type,
        view: {
          label: 'Комментарий',
          default: '',
          required: false,
          readonly: false,
          minLength: 0,
          maxLength: 2000,
        } satisfies CommentView,
      };
    case 'Datetime':
      return {
        ...base,
        type,
        view: {
          label: 'Дата и время',
          required: false,
          min: null,
          max: null,
        } satisfies DatetimeView,
      };
    case 'Image':
      return {
        ...base,
        type,
        view: { label: 'Изображение', source: 'camera', image: null } satisfies ImageView,
      };
    case 'RadioButton':
      return {
        ...base,
        type,
        view: {
          label: 'Выберите вариант',
          required: true,
          default: null,
          options: [
            { id: nanoid(), label: 'Вариант 1' },
            { id: nanoid(), label: 'Вариант 2' },
          ],
        } satisfies RadioButtonView,
      };
    case 'Checkbox':
      return {
        ...base,
        type,
        view: {
          label: 'Выберите действия',
          minSelected: 0,
          maxSelected: null,
          options: [
            { id: nanoid(), label: 'Вариант 1', default: false },
            { id: nanoid(), label: 'Вариант 2', default: false },
          ],
        } satisfies CheckboxView,
      };
    case 'Select':
      return {
        ...base,
        type,
        view: {
          required: true,
          lists: [
            {
              id: 'list_1',
              label: 'Список 1',
              options: [
                { id: nanoid(), label: 'Опция 1' },
                { id: nanoid(), label: 'Опция 2' },
              ],
            },
          ],
        } satisfies SelectView,
      };
  }
}
