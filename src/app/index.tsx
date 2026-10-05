import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import {
  Button,
  Card,
  colors,
  Compass,
  Icon,
  ProgressBar,
  SectionTitle,
  T,
  Tag,
} from '../components/ui';
import { useStudy } from '../context/StudyContext';
import { subjects, type Subject } from '../data/curriculum';
import { nextLesson, stats } from '../lib/learning';

export default function Home() {
  const { state } = useStudy();
  const { width } = useWindowDimensions();
  const wide = width > 760;
  const all = stats(state);
  const next = nextLesson(state);
  const week = next?.week || 8;
  return (
    <Shell>
      <View style={s.greeting}>
        <T variant="label" style={{ fontSize: 13 }}>
          {state.settings.name ? 'Olá, ' + state.settings.name + '.' : 'Boas-vindas a bordo.'}
        </T>
        <Tag text={'CFAQ · ' + state.settings.course} />
      </View>
      <View style={s.hero}>
        <View style={{ flex: 1, gap: 15, zIndex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
            <View style={s.smallLine} />
            <T variant="small" style={s.eyebrow}>
              UM NOVO RUMO COMEÇA COM VOCÊ
            </T>
          </View>
          <T variant="display" style={{ fontSize: wide ? 40 : 31, lineHeight: wide ? 49 : 39 }}>
            Seu próximo destino{'\n'}
            <T
              variant="display"
              style={{ color: colors.blue, fontSize: wide ? 40 : 31, lineHeight: wide ? 49 : 39 }}
            >
              começa nos estudos.
            </T>
          </T>
          <T style={{ maxWidth: 470, color: colors.muted, fontSize: 14, lineHeight: 23 }}>
            Português e Matemática para a sua preparação.{'\n'}Um assunto de cada vez, no seu ritmo.
          </T>
          {!wide && (
            <Button
              title={next ? 'Estudar agora' : 'Praticar agora'}
              icon="arrow-right"
              onPress={() => router.push(next ? '/licao/' + next.id : '/pratica')}
              style={{ alignSelf: 'flex-start' }}
            />
          )}
        </View>
        {wide && (
          <View style={s.heroArt}>
            <Compass size={228} />
          </View>
        )}
        <View style={s.heroAccent}>
          <View style={{ height: 3, width: 20, backgroundColor: colors.green }} />
          <View style={{ height: 3, width: 12, backgroundColor: colors.yellow }} />
        </View>
      </View>
      <View style={s.metrics}>
        {[
          {
            label: 'Lições concluídas',
            value: String(all.completed),
            suffix: 'de ' + all.total,
            icon: 'check-circle' as const,
          },
          {
            label: 'Aproveitamento',
            value: all.accuracy === null ? '—' : all.accuracy + '%',
            suffix: all.answered ? all.answered + ' respostas' : 'Comece a praticar',
            icon: 'target' as const,
          },
          {
            label: 'Para revisar',
            value: String(state.mistakes.length),
            suffix: 'questões no caderno',
            icon: 'refresh-cw' as const,
          },
        ].map((metric) => (
          <View key={metric.label} style={s.metric}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              {width > 420 && <Icon name={metric.icon} size={14} color={colors.muted} />}
              <T variant="small" style={{ fontSize: width < 500 ? 10 : 12 }}>
                {metric.label}
              </T>
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                gap: 7,
                marginTop: 8,
              }}
            >
              <T variant="title" style={{ fontSize: 28 }}>
                {metric.value}
              </T>
              <T variant="small" style={{ fontSize: width < 500 ? 10 : 11 }}>
                {metric.suffix}
              </T>
            </View>
          </View>
        ))}
      </View>
      <View style={[s.columns, !wide && { flexDirection: 'column' }]}>
        <View style={{ flex: wide ? 1.7 : undefined, minWidth: 0 }}>
          <SectionTitle title={next ? 'Seu próximo passo' : 'Continue aprendendo'} />
          <Card style={{ gap: 17 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Tag
                text={next ? subjects[next.subject].name : 'Trilhas concluídas'}
                icon="book-open"
              />
              <T variant="small" style={{ fontSize: 11 }}>
                {next ? 'LIÇÃO ' + next.id.slice(-2) : 'REVISÃO'}
              </T>
            </View>
            <T variant="heading" style={{ fontSize: 22 }}>
              {next?.title || 'Hora de fortalecer o que aprendeu'}
            </T>
            <T variant="small">
              {next?.subtitle || 'Revise seus erros ou pratique assuntos das duas disciplinas.'}
            </T>
            <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
              <View style={s.inline}>
                <Icon name="clock" size={14} color={colors.muted} />
                <T variant="small">{next ? next.minutes + ' min' : 'No seu ritmo'}</T>
              </View>
              <View style={s.inline}>
                <Icon name="edit-3" size={14} color={colors.muted} />
                <T variant="small">
                  {next ? next.questions.length + ' exercícios comentados' : 'Treino misto'}
                </T>
              </View>
            </View>
            <Button
              title={next ? 'Começar lição' : 'Praticar agora'}
              icon="arrow-right"
              onPress={() => router.push(next ? '/licao/' + next.id : '/pratica')}
              style={{ alignSelf: wide ? 'flex-start' : 'stretch', marginTop: 2 }}
            />
          </Card>
        </View>
        <View style={{ flex: wide ? 1 : undefined, minWidth: 0 }}>
          <SectionTitle title="Um plano que cabe na vida" />
          <Card style={{ backgroundColor: '#F1F6F3', gap: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon name="calendar" color={colors.green} />
              <T variant="label" style={{ color: colors.green }}>
                Semana {week} de 8
              </T>
            </View>
            <T variant="heading">Pequenos passos.{'\n'}Uma base mais forte.</T>
            <T variant="small">
              {state.settings.minutes} minutos por dia, {state.settings.days} dias por semana.
              Ajuste o plano à sua rotina.
            </T>
            <Button
              title="Ver meu plano"
              tone="ghost"
              icon="arrow-right"
              onPress={() => router.push('/plano')}
              style={{ paddingHorizontal: 0, justifyContent: 'flex-start' }}
            />
          </Card>
        </View>
      </View>
      <View style={{ marginTop: 29 }}>
        <SectionTitle
          title="Suas trilhas de aprendizagem"
          action={{ label: 'Ver lições', onPress: () => router.push('/trilhas') }}
        />
        <View style={[s.columns, !wide && { flexDirection: 'column' }]}>
          {(['portugues', 'matematica'] as Subject[]).map((subject) => {
            const info = subjects[subject];
            const progress = stats(state, subject);
            return (
              <Pressable
                key={subject}
                accessibilityRole="button"
                accessibilityLabel={'Abrir trilha de ' + info.name}
                onPress={() => router.push({ pathname: '/trilhas', params: { materia: subject } })}
                style={({ pressed }) => [{ flex: wide ? 1 : undefined, opacity: pressed ? 0.8 : 1 }]}
              >
                <Card style={{ gap: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={[s.subjectIcon, { backgroundColor: info.tint }]}>
                      <Icon name={info.icon} color={info.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <T variant="heading">{info.name}</T>
                      <T variant="small">
                        {progress.completed} de {progress.total} lições concluídas
                      </T>
                    </View>
                    <Icon name="arrow-up-right" color={colors.muted} size={18} />
                  </View>
                  <ProgressBar
                    value={progress.percent}
                    color={info.color}
                    label={'Progresso em ' + info.name}
                  />
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={s.lastNote}>
        <Icon name="anchor" size={15} color={colors.muted} />
        <T variant="small" style={{ flex: 1, fontSize: 12 }}>
          Aprender é construir uma base. Você pode repetir qualquer lição, quantas vezes precisar.
        </T>
      </View>
    </Shell>
  );
}
const s = StyleSheet.create({
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  hero: {
    padding: 28,
    borderRadius: 17,
    backgroundColor: '#EDF3FC',
    minHeight: 233,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  eyebrow: { fontSize: 9, color: colors.navy, letterSpacing: 1.4 },
  smallLine: { backgroundColor: colors.blue, width: 17, height: 2 },
  heroArt: { marginLeft: 15, marginRight: 0 },
  heroAccent: { position: 'absolute', bottom: 0, left: 29, flexDirection: 'row' },
  metrics: {
    marginVertical: 23,
    backgroundColor: colors.white,
    borderRadius: 14,
    flexDirection: 'row',
    paddingVertical: 19,
  },
  metric: { flex: 1, paddingHorizontal: 17 },
  columns: { flexDirection: 'row', gap: 20 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subjectIcon: {
    height: 45,
    width: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastNote: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 22 },
});
