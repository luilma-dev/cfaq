import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Card, colors, Empty, Icon, ProgressBar, SectionTitle, T } from '../components/ui';
import { useStudy } from '../context/StudyContext';
import { findLesson, subjects, type Subject } from '../data/curriculum';
import { localDateKey, stats } from '../lib/learning';

export default function Progress() {
  const { state } = useStudy();
  const { width } = useWindowDimensions();
  const all = stats(state);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  return (
    <Shell
      title="Veja sua base crescer."
      subtitle="Seu progresso de verdade. Aprender leva tempo, e cada passo conta."
    >
      <View style={{ flexDirection: width > 650 ? 'row' : 'column', gap: 15, marginBottom: 27 }}>
        {[
          {
            label: 'Lições concluídas',
            value: all.completed + '/' + all.total,
            note: 'Conclusão não significa domínio.',
          },
          {
            label: 'Aproveitamento geral',
            value: all.accuracy === null ? '—' : all.accuracy + '%',
            note: all.answered + ' respostas registradas',
          },
          {
            label: 'Sessões completas',
            value: String(state.history.length),
            note: 'Lições, revisões e treinos',
          },
        ].map((item) => (
          <Card key={item.label} style={{ flex: 1, gap: 8 }}>
            <T variant="small">{item.label}</T>
            <T variant="title">{item.value}</T>
            <T variant="small" style={{ fontSize: 11 }}>
              {item.note}
            </T>
          </Card>
        ))}
      </View>
      <SectionTitle title="Por disciplina" />
      <View style={{ flexDirection: width > 650 ? 'row' : 'column', gap: 15, marginBottom: 27 }}>
        {(['portugues', 'matematica'] as Subject[]).map((subject) => {
          const p = stats(state, subject);
          const info = subjects[subject];
          return (
            <Card key={subject} style={{ flex: 1, gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name={info.icon} color={info.color} />
                <T variant="heading">{info.name}</T>
              </View>
              <ProgressBar value={p.percent} color={info.color} />
              <T variant="small">
                {p.completed}/{p.total} lições ·{' '}
                {p.accuracy === null ? 'Sem respostas ainda' : p.accuracy + '% de acertos'}
              </T>
            </Card>
          );
        })}
      </View>
      <SectionTitle
        title="Últimos sete dias"
        caption="Atividade registrada, sem obrigação de sequência."
      />
      <Card style={{ marginBottom: 27, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 5 }}>
          {days.map((d) => {
            const key = localDateKey(d);
            const n = state.attempts.filter((a) => localDateKey(new Date(a.at)) === key).length;
            return (
              <View key={key} style={{ flex: 1, alignItems: 'center', gap: 9 }}>
                <View
                  style={{
                    height: 42,
                    width: 35,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: n ? colors.greenTint : '#F1F5F9',
                  }}
                >
                  <T variant="label" style={{ color: n ? colors.green : colors.muted }}>
                    {n}
                  </T>
                </View>
                <T variant="small" style={{ fontSize: 10 }}>
                  {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                </T>
                <T variant="small" style={{ fontSize: 10 }}>
                  {d.getDate()}
                </T>
              </View>
            );
          })}
        </View>
        <T variant="small" style={{ marginTop: 18, fontSize: 11 }}>
          Quantidade de respostas por dia, no horário local do seu aparelho.
        </T>
      </Card>
      <SectionTitle title="Histórico de estudo" />
      {state.history.length === 0 ? (
        <Empty
          icon="bar-chart-2"
          title="Seu histórico começa com uma lição."
          description="Ao terminar uma sessão, você poderá acompanhar os assuntos estudados e seus resultados."
        >
          <Button
            title="Começar a estudar"
            icon="arrow-right"
            onPress={() => router.push('/trilhas')}
          />
        </Empty>
      ) : (
        <View style={{ gap: 10 }}>
          {state.history.slice(0, 20).map((session) => (
            <Card
              key={session.id}
              style={{ padding: 19, flexDirection: 'row', gap: 13, alignItems: 'center' }}
            >
              <Icon
                name={
                  session.mode === 'lesson'
                    ? 'book-open'
                    : session.mode === 'review'
                      ? 'refresh-cw'
                      : 'shuffle'
                }
              />
              <View style={{ flex: 1 }}>
                <T variant="label">
                  {session.mode === 'lesson'
                    ? findLesson(session.lessonId || '')?.title || 'Lição'
                    : session.mode === 'review'
                      ? 'Revisão dos erros'
                      : 'Treino misto'}
                </T>
                <T variant="small">
                  {new Date(session.at).toLocaleDateString('pt-BR')} ·{' '}
                  {new Date(session.at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </T>
              </View>
              <T variant="label">
                {session.correct}/{session.total}
              </T>
            </Card>
          ))}
        </View>
      )}
      <T variant="small" style={{ marginTop: 20, fontSize: 12 }}>
        Aproveitamento considera as respostas registradas, incluindo novas tentativas. Histórico:
        últimas 200 sessões; gráfico e aproveitamento: últimas 5.000 respostas.
      </T>
    </Shell>
  );
}
