/** Форматирование ISO-времени для UI превью (шаги / timeline). */
export function formatStepRunTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** Длительность между двумя ISO-моментами (ru). */
export function formatDurationRu(startIso: string, endIso: string): string {
  const a = Date.parse(startIso);
  const b = Date.parse(endIso);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return '—';
  const d = b - a;
  if (d < 1000) return `${d} мс`;
  const sec = d / 1000;
  if (sec < 60) return `${sec.toFixed(1).replace('.', ',')} с`;
  const min = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (min < 60) return `${min} мин ${s} с`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} ч ${m} мин`;
}

/** Момент начала прохода в превью: `startedAt` первого шага в истории, иначе текущий шаг (история пуста). */
export function getPreviewSessionStartIso(
  history: { startedAt: string }[],
  currentStepStartedAtWhenEmpty: string
): string {
  return history.length > 0 ? history[0]!.startedAt : currentStepStartedAtWhenEmpty;
}

type StepIdHistoryRow = { step: { id: string }; startedAt: string };

/**
 * Начало обработки сценария: `startedAt` первого захода на `scenario.initialStep`,
 * иначе текущий шаг, если это начальный, иначе эвристика {@link getPreviewSessionStartIso}.
 */
export function getScenarioProcessingStartIso(
  history: StepIdHistoryRow[],
  currentStepId: string | null,
  currentStepStartedAt: string,
  initialStepId: string
): string {
  const i = history.findIndex((e) => e.step.id === initialStepId);
  if (i >= 0) return history[i]!.startedAt;
  if (currentStepId === initialStepId) return currentStepStartedAt;
  return getPreviewSessionStartIso(history, currentStepStartedAt);
}

/** Первая запись истории, соответствующая начальному шагу сценария (для подписи «Начало»). */
export function isFirstInitialHistoryIndex(
  history: { step: { id: string } }[],
  index: number,
  initialStepId: string
): boolean {
  const e = history[index];
  if (!e || e.step.id !== initialStepId) return false;
  return history.findIndex((x) => x.step.id === initialStepId) === index;
}
