import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findQuestion, lessons, questions } from '../src/data/curriculum';
import {
  buildPractice,
  completeSession,
  initialState,
  localDateKey,
  nextLesson,
  parseState,
  recordAnswer,
  stats,
  type SessionResult,
} from '../src/lib/learning';

const first = questions[0];
const at = '2026-10-05T12:00:00.000Z';
const result: SessionResult = {
  id: 'session-1',
  mode: 'lesson',
  lessonId: 'pt-01',
  correct: 2,
  total: 3,
  at,
};

test('currículo cobre 33 lições, 99 questões e oito semanas, com referências válidas', () => {
  assert.equal(lessons.length, 33);
  assert.equal(questions.length, 99);
  assert.equal(lessons.filter((l) => l.subject === 'portugues').length, 19);
  assert.equal(lessons.filter((l) => l.subject === 'matematica').length, 14);
  assert.equal(new Set(lessons.map((l) => l.id)).size, 33);
  assert.equal(new Set(questions.map((q) => q.id)).size, 99);
  assert.deepEqual([...new Set(lessons.map((l) => l.week))].sort(), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (const lesson of lessons) {
    assert.equal(lesson.questions.length, 3);
    assert.ok(lesson.theory.length >= 2);
    for (const page of lesson.pages.split('–')) assert.ok(Number(page) >= 1 && Number(page) <= 200);
    for (const q of lesson.questions) {
      assert.equal(q.lessonId, lesson.id);
      assert.equal(new Set(q.options).size, 4);
      assert.ok(q.answer >= 0 && q.answer < 4);
      assert.ok(q.explanation.trim().length > 0, q.id + ' deve ter uma resolução.');
    }
  }
});
test('novo estudante começa sem progresso ou precisão fabricada', () => {
  assert.deepEqual(stats(initialState()), {
    completed: 0,
    total: 33,
    percent: 0,
    answered: 0,
    accuracy: null,
  });
  assert.equal(nextLesson(initialState())?.id, 'pt-01');
});
test('erro é registrado uma vez no caderno, mesmo com tentativas repetidas', () => {
  const wrong = (first.answer + 1) % 4;
  let state = recordAnswer(initialState(), first.id, wrong, at);
  state = recordAnswer(state, first.id, wrong, at);
  assert.deepEqual(state.mistakes, [first.id]);
  assert.equal(state.attempts.length, 2);
  assert.equal(stats(state).accuracy, 0);
});
test('resposta correta posterior retira erro e mantém o histórico de tentativas', () => {
  let state = recordAnswer(initialState(), first.id, (first.answer + 1) % 4, at);
  state = recordAnswer(state, first.id, first.answer, at);
  assert.deepEqual(state.mistakes, []);
  assert.equal(stats(state).accuracy, 50);
});
test('entrada inválida não registra resposta nem muda estado', () => {
  const state = initialState();
  for (const choice of [-1, 4, NaN, 1.5])
    assert.equal(recordAnswer(state, first.id, choice), state);
  assert.equal(recordAnswer(state, 'inexistente', 0), state);
});
test('lição incompleta não é marcada como concluída apenas por responder', () => {
  const state = recordAnswer(initialState(), first.id, first.answer, at);
  assert.equal(stats(state).completed, 0);
});
test('conclusão é idempotente e atualiza a próxima lição', () => {
  const state = completeSession(initialState(), result);
  assert.equal(stats(state).completed, 1);
  assert.equal(nextLesson(state)?.id, 'pt-02');
  assert.equal(completeSession(state, result), state);
});
test('refazer uma lição atualiza sua nota sem duplicar a conclusão', () => {
  let state = completeSession(initialState(), result);
  state = completeSession(state, { ...result, id: 'session-2', correct: 3 });
  assert.equal(stats(state).completed, 1);
  assert.equal(state.results['pt-01'].correct, 3);
  assert.equal(state.history.length, 2);
});
test('revisão e treino entram no histórico, sem concluir lições automaticamente', () => {
  let state = completeSession(initialState(), { ...result, mode: 'review' });
  state = completeSession(state, { ...result, id: 'session-2', mode: 'practice' });
  assert.equal(stats(state).completed, 0);
  assert.equal(state.history.length, 2);
});
test('métricas são separadas por disciplina', () => {
  let state = recordAnswer(initialState(), first.id, first.answer, at);
  const math = questions.find((q) => q.lessonId === 'mt-01')!;
  state = recordAnswer(state, math.id, (math.answer + 1) % 4, at);
  assert.equal(stats(state, 'portugues').accuracy, 100);
  assert.equal(stats(state, 'matematica').accuracy, 0);
});
test('treinos possuem tamanho correto, questões únicas e matérias equilibradas', () => {
  for (const size of [10, 20]) {
    const ids = buildPractice(size, () => 0.37);
    assert.equal(ids.length, size);
    assert.equal(new Set(ids).size, size);
    assert.equal(ids.filter((id) => id.startsWith('pt')).length, size / 2);
    assert.ok(ids.every((id) => findQuestion(id)));
  }
});
test('treino respeita os limites do banco e tolera tamanho não finito', () => {
  assert.equal(buildPractice(1000).length, 99);
  assert.equal(buildPractice(-1).length, 1);
  assert.equal(buildPractice(NaN).length, 10);
});
test('persistência recupera respostas, erros e conclusões', () => {
  const state = completeSession(recordAnswer(initialState(), first.id, first.answer, at), result);
  assert.deepEqual(parseState(JSON.stringify(state)), state);
});
test('restauração rejeita corrupção e versão desconhecida', () => {
  for (const raw of ['not json', 'null', '{}', '{"version":2}', '{"version":1}'])
    assert.throws(() => parseState(raw));
});
test('restauração sanitiza preferências, IDs e acerto adulterado', () => {
  const bad = {
    ...initialState(),
    mistakes: ['missing', first.id, first.id],
    attempts: [{ questionId: first.id, selected: first.answer, correct: false, at }],
    settings: { name: 'x'.repeat(80), minutes: 999, days: -1, course: 'other' },
  };
  const clean = parseState(JSON.stringify(bad));
  assert.equal(clean.settings.name.length, 40);
  assert.equal(clean.settings.minutes, 30);
  assert.equal(clean.settings.days, 5);
  assert.equal(clean.settings.course, 'MOC');
  assert.deepEqual(clean.mistakes, [first.id]);
  assert.equal(clean.attempts[0].correct, true);
});
test('datas de atividade usam o calendário local, não recorte UTC', () => {
  const d = new Date(2026, 9, 5, 23, 30);
  assert.equal(localDateKey(d), '2026-10-05');
});
test('conclusão não aceita contagem impossível ou sessão vazia', () => {
  const state = initialState();
  assert.equal(completeSession(state, { ...result, correct: 4 }), state);
  assert.equal(completeSession(state, { ...result, total: 0 }), state);
});
test('gabaritos de matemática conferidos com resultados calculados independentemente', () => {
  const expected: Record<string, string[]> = {
    'mt-02': [String(8 + 3 * 4), '6', '12'],
    'mt-03': [
      (2.5 + 0.75).toString().replace('.', ','),
      (0.4 * 0.3).toString().replace('.', ','),
      (7.5 / 100).toString().replace('.', ','),
    ],
    'mt-04': ['−3', String(-4 * -3), String(6 - -2)],
    'mt-08': [String(3 ** 3), String(2 ** 3 * 2 ** 2), String(Math.sqrt(81))],
    'mt-12': [String(0.25 * 200), 'R$ ' + 80 * 0.9, 'R$ ' + Math.round(100 * 1.1 * 0.9)],
  };
  for (const [id, values] of Object.entries(expected)) {
    const pool = lessons.find((l) => l.id === id)!.questions;
    pool.forEach((q, i) => assert.equal(q.options[q.answer], values[i]));
  }
});
