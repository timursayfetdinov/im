import { nanoid } from 'nanoid';
import type { Scenario, ScenarioMeta } from '../../../shared/types/scenario';

// ─── LocalStorage persistence ─────────────────────────────────────────────────

const LS_KEY = 'incident_manager_scenarios';

function loadFromStorage(): Scenario[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Scenario[];
  } catch {
    return null;
  }
}

function saveToStorage(scenarios: Scenario[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(scenarios));
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
}

// ─── In-memory mock store (hydrated from localStorage) ───────────────────────

const now = new Date().toISOString();

const DEFAULTS: Scenario[] = [
  {
    scenario: {
      id: 'demo-1',
      name: 'Стандартный инцидент',
      description: 'Базовый сценарий: фото → приоритет → действия → завершение',
      version: 3,
      createdAt: now,
      updatedAt: now,
      initialStep: 'btn_start',
    },
    steps: [
      {
        id: 'btn_start',
        type: 'Button',
        title: 'Старт',
        description: 'Нажмите, чтобы начать',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        view: { label: 'Начать' },
        transitions: { default: { goto: 'rb_priority', macro: null } },
      },
      {
        id: 'rb_priority',
        type: 'RadioButton',
        title: 'Приоритет',
        description: 'Выберите приоритет инцидента',
        editable: true,
        multitasking: false,
        report: true,
        finish: false,
        view: {
          label: 'Приоритет',
          required: true,
          default: null,
          options: [
            { id: 'low', label: 'Низкий' },
            { id: 'medium', label: 'Средний' },
            { id: 'high', label: 'Высокий' },
          ],
        },
        transitions: {
          default: { goto: 'btn_finish', macro: null },
          rules: [
            { condition: { '==': [{ var: 'value' }, 'high'] }, goto: 'btn_finish', macro: null },
          ],
        },
      },
      {
        id: 'btn_finish',
        type: 'Button',
        title: 'Завершение',
        description: 'Подтвердите завершение',
        editable: true,
        multitasking: false,
        report: false,
        finish: true,
        view: { label: 'Завершить' },
        transitions: { default: { goto: null, macro: null } },
      },
    ],
  },
  {
    scenario: {
      id: 'demo-2',
      name: 'Быстрая оценка',
      description: 'Минимальный сценарий для срочных инцидентов',
      version: 1,
      createdAt: now,
      updatedAt: now,
      initialStep: 'btn_start',
    },
    steps: [
      {
        id: 'btn_start',
        type: 'Button',
        title: 'Начать',
        description: '',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        view: { label: 'Начать' },
        transitions: { default: { goto: 'btn_finish', macro: null } },
      },
      {
        id: 'btn_finish',
        type: 'Button',
        title: 'Завершить',
        description: '',
        editable: true,
        multitasking: false,
        report: false,
        finish: true,
        view: { label: 'Завершить' },
        transitions: { default: { goto: null, macro: null } },
      },
    ],
  },
  {
    scenario: {
      id: 'e1BxNjsOculoL4sA5WBqD',
      name: 'Демонстрация',
      description: 'Сценарий для демонстрации',
      version: 9,
      createdAt: '2026-05-05T12:29:25.289Z',
      updatedAt: '2026-05-06T10:05:13.004Z',
      initialStep: 'CjVGDggL',
    },
    steps: [
      {
        id: 'CjVGDggL',
        title: 'Начать обработку по сценарию Демо',
        description: 'Для демонстрации',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        transitions: {
          default: {
            goto: 'DuxPj-ve',
            macro: null,
          },
        },
        type: 'Button',
        view: {
          label: 'Далее',
        },
      },
      {
        id: 'KmOJPU4Y',
        title: 'Закончить',
        description: '',
        editable: true,
        multitasking: false,
        report: false,
        finish: true,
        transitions: {
          default: {
            goto: null,
            macro: null,
          },
        },
        type: 'Button',
        view: {
          label: 'Далее',
        },
      },
      {
        id: 'DuxPj-ve',
        title: 'Дата и время',
        description: '',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        transitions: {
          default: {
            goto: 'IoCMqAOn',
            macro: null,
          },
        },
        type: 'Datetime',
        view: {
          label: 'Дата и время',
          required: false,
          min: null,
          max: null,
        },
      },
      {
        id: 'IoCMqAOn',
        title: 'Переход на',
        description: 'Выберите следующий шаг',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        transitions: {
          default: {
            goto: 'KmOJPU4Y',
            macro: null,
          },
          rules: [
            {
              condition: {
                '==': [
                  {
                    var: 'value',
                  },
                  'VitGyX',
                ],
              },
              goto: 'hcMfdq2s',
              macro: null,
            },
            {
              condition: {
                '==': [
                  {
                    var: 'value',
                  },
                  'd9p1N4',
                ],
              },
              goto: 'NTIWlHeb',
              macro: null,
            },
          ],
        },
        type: 'RadioButton',
        view: {
          label: 'Выберите вариант',
          required: true,
          default: null,
          options: [
            {
              id: 'VitGyX',
              label: 'Комментарий',
            },
            {
              id: 'd9p1N4',
              label: 'Изображение',
            },
          ],
        },
      },
      {
        id: 'hcMfdq2s',
        title: 'Комментарий',
        description: '',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        transitions: {
          default: {
            goto: 'NTIWlHeb',
            macro: null,
          },
        },
        type: 'Comment',
        view: {
          label: 'Комментарий',
          default: '',
          required: false,
          readonly: false,
          minLength: 0,
          maxLength: 2000,
        },
      },
      {
        id: 'NTIWlHeb',
        title: 'Изображение',
        description: '',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        transitions: {
          default: {
            goto: 'v1PBa9iq',
            macro: null,
          },
        },
        type: 'Image',
        view: {
          label: 'Изображение',
          source: 'camera',
          image: null,
        },
      },
      {
        id: 'v1PBa9iq',
        title: 'Список',
        description: '',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        transitions: {
          default: {
            goto: 'KmOJPU4Y',
            macro: null,
          },
          rules: [
            {
              condition: {
                and: [
                  {
                    in: [
                      {
                        var: 'list_1',
                      },
                      ['XXdPaQ', 'eErAZB'],
                    ],
                  },
                  {
                    in: [
                      {
                        var: 'EvvUfv',
                      },
                      ['2IELe4', 'Ycg3eS'],
                    ],
                  },
                ],
              },
              goto: 'wOwptOWc',
              macro: null,
            },
            {
              condition: {
                and: [
                  {
                    '==': [
                      {
                        var: 'list_1',
                      },
                      'eErAZB',
                    ],
                  },
                  {
                    '==': [
                      {
                        var: 'EvvUfv',
                      },
                      '6O57mH',
                    ],
                  },
                ],
              },
              goto: 'n5focKwx',
              macro: null,
            },
          ],
        },
        type: 'Select',
        view: {
          required: true,
          lists: [
            {
              id: 'list_1',
              label: 'Следующие шаги',
              options: [
                {
                  id: 'XXdPaQ',
                  label: 'Коммент',
                },
                {
                  id: 'eErAZB',
                  label: 'Чекбокс',
                },
              ],
            },
            {
              id: 'EvvUfv',
              label: 'Доп опции',
              options: [
                {
                  id: '2IELe4',
                  label: 'Опция 1',
                },
                {
                  id: 'Ycg3eS',
                  label: 'Опция 2',
                },
                {
                  id: '6O57mH',
                  label: 'Опция 3',
                },
              ],
            },
          ],
        },
      },
      {
        id: 'wOwptOWc',
        title: 'Комментарий №2',
        description: '',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        transitions: {
          default: {
            goto: 'n5focKwx',
            macro: null,
          },
        },
        type: 'Comment',
        view: {
          label: 'Комментарий',
          default: '',
          required: false,
          readonly: false,
          minLength: 0,
          maxLength: 2000,
        },
      },
      {
        id: 'n5focKwx',
        title: 'Чекбокс',
        description: '',
        editable: true,
        multitasking: false,
        report: false,
        finish: false,
        transitions: {
          default: {
            goto: 'KmOJPU4Y',
            macro: null,
          },
        },
        type: 'Checkbox',
        view: {
          label: 'Выберите действия',
          minSelected: 0,
          maxSelected: null,
          options: [
            {
              id: 'wYOqGm',
              label: 'Вариант 1',
              default: false,
            },
            {
              id: 'abK_pz',
              label: 'Вариант 2',
              default: false,
            },
          ],
        },
      },
    ],
  },
];

const mockScenarios: Scenario[] = loadFromStorage() ?? JSON.parse(JSON.stringify(DEFAULTS));

// ─── API functions (mock) ─────────────────────────────────────────────────────

export async function fetchScenarioList(): Promise<ScenarioMeta[]> {
  await delay(200);
  return mockScenarios.map(s => s.scenario);
}

export async function fetchScenario(id: string): Promise<Scenario> {
  await delay(200);
  const found = mockScenarios.find(s => s.scenario.id === id);
  if (!found) throw new Error(`Scenario "${id}" not found`);
  return JSON.parse(JSON.stringify(found)) as Scenario;
}

export async function createScenario(name: string, description: string): Promise<Scenario> {
  await delay(200);
  const id = nanoid();
  const ts = new Date().toISOString();
  const newScenario: Scenario = {
    scenario: { id, name, description, version: 1, createdAt: ts, updatedAt: ts, initialStep: '' },
    steps: [],
  };
  mockScenarios.push(newScenario);
  saveToStorage(mockScenarios);
  return JSON.parse(JSON.stringify(newScenario)) as Scenario;
}

export async function saveScenario(scenario: Scenario): Promise<Scenario> {
  await delay(200);
  const idx = mockScenarios.findIndex(s => s.scenario.id === scenario.scenario.id);
  const updated: Scenario = {
    ...scenario,
    scenario: {
      ...scenario.scenario,
      version: scenario.scenario.version + 1,
      updatedAt: new Date().toISOString(),
    },
  };
  if (idx >= 0) {
    mockScenarios[idx] = JSON.parse(JSON.stringify(updated)) as Scenario;
  } else {
    mockScenarios.push(JSON.parse(JSON.stringify(updated)) as Scenario);
  }
  saveToStorage(mockScenarios);
  return updated;
}

export async function deleteScenario(id: string): Promise<void> {
  await delay(200);
  const idx = mockScenarios.findIndex(s => s.scenario.id === id);
  if (idx >= 0) {
    mockScenarios.splice(idx, 1);
    saveToStorage(mockScenarios);
  }
}

export async function importScenario(scenario: Scenario): Promise<Scenario> {
  await delay(200);
  const ts = new Date().toISOString();
  const imported: Scenario = {
    ...scenario,
    scenario: {
      ...scenario.scenario,
      id: nanoid(),
      version: 1,
      createdAt: ts,
      updatedAt: ts,
    },
  };
  mockScenarios.push(JSON.parse(JSON.stringify(imported)) as Scenario);
  saveToStorage(mockScenarios);
  return JSON.parse(JSON.stringify(imported)) as Scenario;
}

export async function duplicateScenario(id: string): Promise<Scenario> {
  await delay(200);
  const original = mockScenarios.find(s => s.scenario.id === id);
  if (!original) throw new Error(`Scenario "${id}" not found`);
  const clone: Scenario = JSON.parse(JSON.stringify(original)) as Scenario;
  const ts = new Date().toISOString();
  clone.scenario.id = nanoid();
  clone.scenario.name = `${clone.scenario.name} (копия)`;
  clone.scenario.version = 1;
  clone.scenario.createdAt = ts;
  clone.scenario.updatedAt = ts;
  mockScenarios.push(clone);
  saveToStorage(mockScenarios);
  return JSON.parse(JSON.stringify(clone)) as Scenario;
}

function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}
