import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Card, colors, Empty, Icon, ProgressBar, T, Tag } from '../components/ui';
import { useStudy } from '../context/StudyContext';
import { findLesson, findQuestion, subjects } from '../data/curriculum';
import { buildPractice, completeSession, recordAnswer, type SessionResult } from '../lib/learning';

export default function SessionScreen() {
  const { ready } = useStudy();
  const params = useLocalSearchParams<{
    modo?: string;
    licao?: string;
    quantidade?: string;
    questao?: string;
  }>();
  return ready ? (
    <SessionContent key={JSON.stringify(params)} params={params} />
  ) : (
    <Shell>{null}</Shell>
  );
}

function SessionContent({
  params,
}: {
  params: { modo?: string; licao?: string; quantidade?: string; questao?: string };
}) {
  const { state, update } = useStudy();
  const mode = ['lesson', 'review', 'practice'].includes(params.modo || '')
    ? (params.modo as SessionResult['mode'])
    : undefined;
  const lesson = findLesson(params.licao || '');
  const [ids] = useState(() =>
    mode === 'lesson'
      ? lesson?.questions.map((q) => q.id) || []
      : mode === 'review'
        ? params.questao && state.mistakes.includes(params.questao)
          ? [params.questao]
          : [...state.mistakes]
        : mode === 'practice'
          ? buildPractice(params.quantidade === '20' ? 20 : 10)
          : [],
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const guard = useRef(false);
  const [sessionId] = useState(
    () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
  );
  const question = findQuestion(ids[index] || '');
  const currentLesson = question ? findLesson(question.lessonId) : undefined;
  const title =
    mode === 'lesson'
      ? lesson?.title || 'Lição'
      : mode === 'review'
        ? 'Revisão dos erros'
        : 'Treino misto';

  function check() {
    if (!question || selected === null || guard.current) return;
    guard.current = true;
    const correct = selected === question.answer;
    if (correct) setCorrectCount((n) => n + 1);
    update((previous) => recordAnswer(previous, question.id, selected));
    setChecked(true);
  }
  function advance() {
    if (!checked) return;
    if (index + 1 === ids.length) {
      update((previous) =>
        completeSession(previous, {
          id: sessionId,
          mode: mode!,
          lessonId: mode === 'lesson' ? lesson?.id : undefined,
          correct: correctCount,
          total: ids.length,
          at: new Date().toISOString(),
        }),
      );
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setChecked(false);
      guard.current = false;
    }
  }
  const destination = mode === 'review' ? '/revisao' : '/trilhas';
  if (!ids.length || !mode)
    return (
      <Shell>
        <Empty
          title={mode === 'review' ? 'Nenhuma questão pendente.' : 'Sessão não encontrada.'}
          description="Escolha uma lição ou prepare um treino para continuar."
        >
          <Button title="Voltar às trilhas" onPress={() => router.replace('/trilhas')} />
        </Empty>
      </Shell>
    );
  if (finished)
    return (
      <Shell title="Mais um passo na sua preparação.">
        <Card style={{ maxWidth: 730, alignItems: 'center', paddingVertical: 40, gap: 21 }}>
          <View
            style={{
              width: 65,
              height: 65,
              backgroundColor: colors.greenTint,
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="check" color={colors.green} size={28} />
          </View>
          <Tag text="SESSÃO CONCLUÍDA" color={colors.green} background={colors.greenTint} />
          <T variant="heading" style={{ textAlign: 'center' }}>
            {title}
          </T>
          <T variant="display">
            {correctCount}
            <T variant="heading" style={{ color: colors.muted }}>
              {' '}
              / {ids.length}
            </T>
          </T>
          <T style={{ color: colors.muted, textAlign: 'center', maxWidth: 440 }}>
            Respostas corretas nesta sessão.{' '}
            {correctCount === ids.length
              ? 'Continue praticando para consolidar o assunto.'
              : 'As questões que precisam de atenção estão no seu caderno de erros.'}
          </T>
          <View style={{ width: '100%', maxWidth: 350 }}>
            <ProgressBar value={(correctCount / ids.length) * 100} color={colors.green} />
          </View>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}
          >
            <Button
              title="Ver meu progresso"
              icon="arrow-right"
              onPress={() => router.replace('/progresso')}
            />
            <Button
              title="Revisar erros"
              tone="secondary"
              onPress={() => router.replace('/revisao')}
            />
          </View>
          <Button
            title="Voltar às trilhas"
            tone="ghost"
            onPress={() => router.replace('/trilhas')}
          />
        </Card>
      </Shell>
    );
  if (!question || !currentLesson)
    return (
      <Shell>
        <Empty
          title="Questão indisponível."
          description="Volte à trilha e inicie uma nova sessão."
        />
      </Shell>
    );
  const isCorrect = selected === question.answer;
  return (
    <Shell scrollKey={index}>
      <View style={{ maxWidth: 800 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
          }}
        >
          <T variant="label" style={{ flex: 1 }}>
            {title}
          </T>
          <Button title="Sair" tone="ghost" icon="x" onPress={() => setShowExit(true)} />
        </View>
        <View style={{ gap: 10, marginBottom: 27 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T variant="small">
              Questão {index + 1} de {ids.length}
            </T>
            <T variant="small">No seu ritmo</T>
          </View>
          <ProgressBar value={(index / ids.length) * 100} />
        </View>
        <Card style={{ gap: 22 }}>
          <Tag text={subjects[currentLesson.subject].name + ' · ' + currentLesson.title} />
          <T variant="heading" style={{ fontSize: 23, lineHeight: 33 }}>
            {question.prompt}
          </T>
          <View
            style={{ gap: 11 }}
            accessibilityRole="radiogroup"
            accessibilityLabel="Alternativas"
          >
            {question.options.map((option, i) => {
              const right = checked && i === question.answer;
              const wrong = checked && i === selected && !isCorrect;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityLabel={
                    String.fromCharCode(65 + i) +
                    '. ' +
                    option +
                    (right ? ', resposta correta' : wrong ? ', resposta incorreta' : '')
                  }
                  accessibilityState={{ checked: selected === i, disabled: checked }}
                  disabled={checked}
                  onPress={() => setSelected(i)}
                  style={[
                    s.option,
                    selected === i && {
                      borderColor: colors.navy,
                      backgroundColor: colors.blueTint,
                    },
                    right && { borderColor: colors.green, backgroundColor: colors.greenTint },
                    wrong && { borderColor: colors.red, backgroundColor: '#FFF1EE' },
                  ]}
                >
                  <View
                    style={[
                      s.letter,
                      (selected === i || right) && {
                        backgroundColor: right ? colors.green : wrong ? colors.red : colors.navy,
                      },
                    ]}
                  >
                    <T
                      variant="label"
                      style={{
                        fontSize: 12,
                        color: selected === i || right ? colors.white : colors.muted,
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </T>
                  </View>
                  <T style={{ flex: 1 }}>{option}</T>
                  {right && <Icon name="check-circle" size={19} color={colors.green} />}
                  {wrong && <Icon name="x-circle" size={19} color={colors.red} />}
                </Pressable>
              );
            })}
          </View>
          {checked && (
            <View
              accessibilityLiveRegion="polite"
              style={[s.feedback, { backgroundColor: isCorrect ? colors.greenTint : '#FFF5ED' }]}
            >
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Icon
                  name={isCorrect ? 'check-circle' : 'info'}
                  size={19}
                  color={isCorrect ? colors.green : colors.red}
                />
                <T variant="label" style={{ color: isCorrect ? colors.green : colors.red }}>
                  {isCorrect ? 'Resposta correta.' : 'Vamos entender a resposta.'}
                </T>
              </View>
              {!isCorrect && (
                <T variant="label" style={{ fontSize: 13 }}>
                  Correta: {String.fromCharCode(65 + question.answer)}.{' '}
                  {question.options[question.answer]}
                </T>
              )}
              <T>{question.explanation}</T>
            </View>
          )}
          {checked ? (
            <Button
              title={index + 1 === ids.length ? 'Ver resultado' : 'Próxima questão'}
              icon="arrow-right"
              onPress={advance}
            />
          ) : (
            <Button title="Conferir resposta" disabled={selected === null} onPress={check} />
          )}
        </Card>
        <T variant="small" style={{ marginTop: 18, textAlign: 'center', fontSize: 12 }}>
          Cada resposta é registrada. Sem limite de tentativas ou perda de progresso.
        </T>
      </View>
      <Modal
        visible={showExit}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExit(false)}
      >
        <View style={s.overlay}>
          <Card style={{ width: '100%', maxWidth: 420, gap: 18 }}>
            <T variant="heading">Sair desta sessão?</T>
            <T>
              As respostas conferidas ficam registradas. Ao retornar, você começa uma nova sessão. A
              conclusão desta sessão só será registrada ao terminar todas as questões.
            </T>
            <Button title="Continuar estudando" onPress={() => setShowExit(false)} />
            <Button
              title="Sair da sessão"
              tone="secondary"
              onPress={() => router.replace(destination)}
            />
          </Card>
        </View>
      </Modal>
    </Shell>
  );
}
const s = StyleSheet.create({
  option: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 11,
    padding: 16,
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  letter: {
    width: 29,
    height: 29,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedback: { borderRadius: 12, padding: 20, gap: 12 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11,42,91,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
});
