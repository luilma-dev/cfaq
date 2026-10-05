import { findQuestion, lessons, questions, type Subject } from '../data/curriculum';

export type Attempt = { questionId: string; selected: number; correct: boolean; at: string };
export type LessonResult = { correct: number; total: number; at: string };
export type SessionResult = {
  id: string;
  mode: 'lesson' | 'review' | 'practice';
  lessonId?: string;
  correct: number;
  total: number;
  at: string;
};
export type StudyState = {
  version: 1;
  results: Record<string, LessonResult>;
  attempts: Attempt[];
  mistakes: string[];
  history: SessionResult[];
  settings: { name: string; minutes: number; days: number; course: 'MOC' | 'MOM' };
};

export function initialState(): StudyState {
  return {
    version: 1,
    results: {},
    attempts: [],
    mistakes: [],
    history: [],
    settings: { name: '', minutes: 30, days: 5, course: 'MOC' },
  };
}

export function recordAnswer(
  state: StudyState,
  questionId: string,
  selected: number,
  at = new Date().toISOString(),
): StudyState {
  const question = findQuestion(questionId);
  if (
    !question ||
    !Number.isInteger(selected) ||
    selected < 0 ||
    selected >= question.options.length
  )
    return state;
  const correct = question.answer === selected;
  const mistakes = state.mistakes.filter((id) => id !== questionId);
  if (!correct) mistakes.push(questionId);
  return {
    ...state,
    mistakes,
    attempts: [...state.attempts, { questionId, selected, correct, at }].slice(-5000),
  };
}

export function completeSession(state: StudyState, result: SessionResult): StudyState {
  if (
    state.history.some((s) => s.id === result.id) ||
    result.total <= 0 ||
    result.correct < 0 ||
    result.correct > result.total
  )
    return state;
  const results = { ...state.results };
  if (
    result.mode === 'lesson' &&
    result.lessonId &&
    lessons.some((l) => l.id === result.lessonId)
  ) {
    results[result.lessonId] = { correct: result.correct, total: result.total, at: result.at };
  }
  return { ...state, results, history: [result, ...state.history].slice(0, 200) };
}

export function stats(state: StudyState, subject?: Subject) {
  const pool = lessons.filter((l) => !subject || l.subject === subject);
  const ids = new Set(pool.flatMap((l) => l.questions.map((q) => q.id)));
  const attempts = state.attempts.filter((a) => ids.has(a.questionId));
  const completed = pool.filter((l) => Boolean(state.results[l.id])).length;
  return {
    completed,
    total: pool.length,
    percent: Math.round((completed / pool.length) * 100),
    answered: attempts.length,
    accuracy: attempts.length
      ? Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100)
      : null,
  };
}

export function nextLesson(state: StudyState) {
  return [...lessons].sort((a, b) => a.week - b.week).find((l) => !state.results[l.id]);
}

export function buildPractice(count = 10, random: () => number = Math.random) {
  const shuffle = <T>(values: T[]) => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const pt = shuffle(questions.filter((q) => q.lessonId.startsWith('pt')));
  const mt = shuffle(questions.filter((q) => q.lessonId.startsWith('mt')));
  const size = Math.min(
    Math.max(1, Number.isFinite(count) ? Math.floor(count) : 10),
    questions.length,
  );
  const chosen = [...pt.slice(0, Math.ceil(size / 2)), ...mt.slice(0, Math.floor(size / 2))];
  if (chosen.length < size) {
    const selected = new Set(chosen.map((q) => q.id));
    chosen.push(
      ...shuffle(questions.filter((q) => !selected.has(q.id))).slice(0, size - chosen.length),
    );
  }
  return shuffle(chosen).map((q) => q.id);
}

export function parseState(raw: string): StudyState {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1)
    throw new Error('Formato de progresso não reconhecido.');
  const p = parsed as Partial<StudyState>;
  if (
    !p.settings ||
    !p.results ||
    !Array.isArray(p.attempts) ||
    !Array.isArray(p.mistakes) ||
    !Array.isArray(p.history)
  )
    throw new Error('Dados de progresso incompletos.');
  const base = initialState();
  const validDate = (date: unknown): date is string =>
    typeof date === 'string' && Number.isFinite(Date.parse(date));
  const attempts = p.attempts
    .filter((a) => {
      const q = a && findQuestion(a.questionId);
      return (
        q &&
        Number.isInteger(a.selected) &&
        a.selected >= 0 &&
        a.selected < q.options.length &&
        validDate(a.at)
      );
    })
    .map((a) => ({ ...a, correct: findQuestion(a.questionId)!.answer === a.selected }))
    .slice(-5000);
  const results = Object.fromEntries(
    Object.entries(p.results).filter(
      ([id, r]) =>
        lessons.some((l) => l.id === id) &&
        r &&
        Number.isInteger(r.correct) &&
        Number.isInteger(r.total) &&
        r.total > 0 &&
        r.correct >= 0 &&
        r.correct <= r.total &&
        validDate(r.at),
    ),
  );
  const history = p.history
    .filter(
      (s) =>
        s &&
        typeof s.id === 'string' &&
        ['lesson', 'review', 'practice'].includes(s.mode) &&
        Number.isInteger(s.total) &&
        s.total > 0 &&
        Number.isInteger(s.correct) &&
        s.correct >= 0 &&
        s.correct <= s.total &&
        validDate(s.at),
    )
    .slice(0, 200);
  return {
    ...base,
    attempts,
    results,
    history,
    mistakes: [...new Set(p.mistakes.filter((id) => typeof id === 'string' && findQuestion(id)))],
    settings: {
      name: typeof p.settings.name === 'string' ? p.settings.name.slice(0, 40) : '',
      minutes: [15, 30, 45, 60].includes(p.settings.minutes ?? 0) ? p.settings.minutes! : 30,
      days: [3, 4, 5, 6].includes(p.settings.days ?? 0) ? p.settings.days! : 5,
      course: p.settings.course === 'MOM' ? 'MOM' : 'MOC',
    },
  };
}

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
