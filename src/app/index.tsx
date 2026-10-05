import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Card, colors, ProgressBar, T } from '../components/ui';
import { useStudy } from '../context/StudyContext';
import { subjects } from '../data/curriculum';
import { nextLesson, stats } from '../lib/learning';

export default function Home() {
  const { state } = useStudy();
  const next = nextLesson(state);
  const progress = stats(state);

  return (
    <Shell>
      <View style={s.content}>
        <View style={s.intro}>
          <T variant="label" style={s.greeting}>
            {state.settings.name ? 'Olá, ' + state.settings.name + '.' : 'Boas-vindas a bordo.'}
          </T>
          <T variant="title">Vamos estudar?</T>
          <T variant="small">Uma lição de cada vez, no seu ritmo.</T>
        </View>

        <Card style={s.lessonCard}>
          <View style={s.lessonMeta}>
            <View style={s.subject}>
              <View style={s.subjectDot} />
              <T variant="label" style={{ color: colors.navy }}>
                {next ? subjects[next.subject].name : 'Lições concluídas'}
              </T>
            </View>
            {next && <T variant="small">{next.minutes} min</T>}
          </View>
          <T variant="heading" style={s.lessonTitle}>
            {next?.title || 'Você concluiu todas as lições!'}
          </T>
          <T variant="small">
            {next
              ? 'Sua próxima lição já está pronta.'
              : 'Continue praticando para fortalecer o que aprendeu.'}
          </T>
          <Button
            title={next ? 'Começar lição' : 'Praticar agora'}
            icon="arrow-right"
            onPress={() => router.push(next ? '/licao/' + next.id : '/pratica')}
            style={s.primaryAction}
          />
        </Card>

        <Card style={s.progressCard}>
          <View style={s.progressHeading}>
            <T variant="label">Seu progresso</T>
            <T variant="small">
              {progress.completed} de {progress.total} lições
            </T>
          </View>
          <ProgressBar value={progress.percent} label="Progresso total das lições" />
        </Card>
      </View>
    </Shell>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', gap: 20 },
  intro: { gap: 5, marginBottom: 4 },
  greeting: { color: colors.green, marginBottom: 7 },
  lessonCard: { backgroundColor: '#EDF3FC', gap: 12 },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  subject: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  subjectDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  lessonTitle: { fontSize: 23, lineHeight: 31, marginTop: 5 },
  primaryAction: { alignSelf: 'stretch', marginTop: 10 },
  progressCard: { gap: 15, paddingVertical: 20 },
  progressHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});
