import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Shell } from '../../components/Shell';
import { Button, Card, colors, Empty, Icon, SectionTitle, T, Tag } from '../../components/ui';
import { findLesson, subjects } from '../../data/curriculum';
import { useStudy } from '../../context/StudyContext';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = findLesson(id);
  const { state } = useStudy();
  if (!lesson)
    return (
      <Shell>
        <Empty
          title="Lição não encontrada."
          description="Escolha um dos assuntos disponíveis nas trilhas."
        >
          <Button title="Ver trilhas" onPress={() => router.replace('/trilhas')} />
        </Empty>
      </Shell>
    );
  const result = state.results[lesson.id];
  return (
    <Shell>
      <Button
        title="Voltar à trilha"
        tone="ghost"
        icon="arrow-left"
        onPress={() =>
          router.navigate({ pathname: '/trilhas', params: { materia: lesson.subject } })
        }
        style={{ alignSelf: 'flex-start', paddingHorizontal: 0, marginBottom: 17 }}
      />
      <View style={{ maxWidth: 790, gap: 25 }}>
        <View style={{ gap: 13 }}>
          <View style={{ flexDirection: 'row', gap: 9, flexWrap: 'wrap' }}>
            <Tag text={subjects[lesson.subject].name} icon={subjects[lesson.subject].icon} />
            <Tag
              text={'Lição ' + lesson.id.slice(-2) + ' · Semana ' + lesson.week}
              background="#EEF1F5"
              color={colors.muted}
            />
            {result && (
              <Tag
                text="Concluída"
                color={colors.green}
                background={colors.greenTint}
                icon="check"
              />
            )}
          </View>
          <T variant="title">{lesson.title}</T>
          <T style={{ color: colors.muted }}>{lesson.subtitle}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Icon name="clock" size={15} color={colors.muted} />
            <T variant="small">
              Cerca de {lesson.minutes} minutos · {lesson.questions.length} exercícios comentados
            </T>
          </View>
        </View>
        <Card style={{ gap: 20 }}>
          <SectionTitle title="Entenda o assunto" />
          {lesson.theory.map((paragraph, index) => (
            <View
              key={paragraph}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 13 }}
            >
              <View
                style={{
                  backgroundColor: colors.blueTint,
                  borderRadius: 7,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginTop: 2,
                }}
              >
                <T variant="label" style={{ fontSize: 12 }}>
                  {index + 1}
                </T>
              </View>
              <T style={{ flex: 1 }}>{paragraph}</T>
            </View>
          ))}
        </Card>
        <Card style={{ backgroundColor: '#EDF3FC', gap: 13 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="feather" size={18} />
            <T variant="heading">Veja na prática</T>
          </View>
          <T>{lesson.example}</T>
        </Card>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 11 }}>
          <Icon name="info" size={18} color={colors.green} />
          <T style={{ flex: 1, color: colors.green }}>{lesson.tip}</T>
        </View>
        <Card style={{ gap: 14 }}>
          <T variant="heading">Agora é sua vez.</T>
          <T variant="small">
            Pratique com três questões e veja uma explicação após cada resposta. Errar é uma
            oportunidade de revisar.
          </T>
          {result && (
            <T variant="small">
              Última sessão: {result.correct}/{result.total} acertos. Repetir a lição atualiza esse
              resultado.
            </T>
          )}
          <Button
            title={result ? 'Praticar novamente' : 'Praticar esta lição'}
            icon="arrow-right"
            onPress={() =>
              router.push({ pathname: '/sessao', params: { modo: 'lesson', licao: lesson.id } })
            }
          />
        </Card>
        <View style={{ gap: 6 }}>
          <T variant="small" style={{ fontSize: 12 }}>
            Referência temática: apostila CFAQ & CAAQ · páginas {lesson.pages} do PDF.
          </T>
          <T variant="small" style={{ fontSize: 11 }}>
            Explicação e exercícios autorais. Consulte essas páginas na sua própria cópia da
            apostila para aprofundar.
          </T>
        </View>
      </View>
    </Shell>
  );
}
