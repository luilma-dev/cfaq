import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Shell } from '../components/Shell';
import { Card, colors, Icon, ProgressBar, T } from '../components/ui';
import { useStudy } from '../context/StudyContext';
import { lessons, subjects, type Subject } from '../data/curriculum';
import { stats } from '../lib/learning';

export default function Trails() {
  const { materia } = useLocalSearchParams<{ materia?: string }>();
  const subject: Subject = materia === 'matematica' ? 'matematica' : 'portugues';
  const [search, setSearch] = useState('');
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const { state } = useStudy();
  const progress = stats(state, subject);
  const info = subjects[subject];
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const pool = lessons.filter(
    (l) =>
      l.subject === subject && normalize(l.title + ' ' + l.subtitle).includes(normalize(search)),
  );
  return (
    <Shell
      title="Um assunto de cada vez."
      subtitle="Siga a sequência da apostila ou escolha o que precisa estudar."
    >
      <View style={s.switcher}>
        {(['portugues', 'matematica'] as Subject[]).map((sub) => (
          <Pressable
            key={sub}
            accessibilityRole="tab"
            accessibilityState={{ selected: subject === sub }}
            onPress={() => {
              router.setParams({ materia: sub });
              setSearch('');
            }}
            style={[s.tab, compact && s.tabCompact, subject === sub && s.activeTab]}
          >
            <View style={s.tabName}>
              <Icon
                name={subjects[sub].icon}
                size={compact ? 16 : 18}
                color={subject === sub ? colors.navy : colors.muted}
              />
              <T
                variant="label"
                numberOfLines={1}
                style={{ color: subject === sub ? colors.navy : colors.muted }}
              >
                {subjects[sub].name}
              </T>
            </View>
            <T variant="small" style={[s.tabCount, subject === sub && { color: colors.navy }]}>
              {lessons.filter((l) => l.subject === sub).length} lições
            </T>
          </Pressable>
        ))}
      </View>
      <Card style={[s.progressCard, compact && s.progressCardCompact]}>
        <View style={s.progressHeader}>
          <View style={[s.subjectIcon, { backgroundColor: info.tint }]}>
            <Icon name={info.icon} color={info.color} size={20} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T variant="heading">{info.name}</T>
            <T variant="small">
              {progress.completed} de {progress.total} lições concluídas
            </T>
          </View>
          <T variant="label" style={{ color: info.color, alignSelf: 'flex-start', marginTop: 2 }}>
            {progress.percent}%
          </T>
        </View>
        <ProgressBar value={progress.percent} color={info.color} />
      </Card>
      <View style={s.search}>
        <Icon name="search" color={colors.muted} size={18} />
        <TextInput
          accessibilityLabel="Buscar assunto na trilha"
          placeholder="Qual assunto você quer estudar?"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={s.input}
        />
        {search !== '' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            onPress={() => setSearch('')}
            style={{ padding: 10 }}
          >
            <Icon name="x" size={17} />
          </Pressable>
        )}
      </View>
      <View style={{ gap: 10 }}>
        {pool.map((l) => {
          const result = state.results[l.id];
          return (
            <Pressable
              key={l.id}
              accessibilityRole="button"
              accessibilityLabel={l.title + ', ' + (result ? 'concluída' : 'disponível')}
              onPress={() => router.push('/licao/' + l.id)}
              style={({ pressed }) => [s.lesson, pressed && { backgroundColor: '#F1F5FA' }]}
            >
              <View style={[s.number, result && { backgroundColor: colors.greenTint }]}>
                {result ? (
                  <Icon name="check" color={colors.green} size={18} />
                ) : (
                  <T variant="label" style={{ color: info.color }}>
                    {l.id.slice(-2)}
                  </T>
                )}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <T variant="label" style={{ fontSize: 16 }}>
                  {l.title}
                </T>
                <T variant="small">
                  Semana {l.week} · {l.minutes} min · {l.questions.length} exercícios
                </T>
              </View>
              {result && (
                <T variant="small" style={{ color: colors.green }}>
                  {result.correct}/{result.total}
                </T>
              )}
              <Icon name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          );
        })}
      </View>
      {pool.length === 0 && (
        <T style={{ textAlign: 'center', color: colors.muted, padding: 30 }}>
          Nenhum assunto encontrado. Tente outra palavra.
        </T>
      )}
    </Shell>
  );
}
const s = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#EDF1F6',
    padding: 5,
    borderRadius: 12,
    marginBottom: 22,
    alignSelf: 'stretch',
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 9,
  },
  tabCompact: { minHeight: 70, flexDirection: 'column', gap: 2 },
  tabName: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  tabCount: { fontSize: 11 },
  activeTab: { backgroundColor: colors.white },
  progressCard: { gap: 18, marginBottom: 23 },
  progressCardCompact: { padding: 20 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subjectIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    marginBottom: 18,
    minHeight: 49,
  },
  input: { flex: 1, minHeight: 49, fontSize: 14, color: colors.ink },
  lesson: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    minHeight: 82,
  },
  number: {
    height: 40,
    width: 40,
    backgroundColor: '#F0F4FA',
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
