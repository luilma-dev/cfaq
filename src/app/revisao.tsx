import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Card, colors, Empty, Icon, SectionTitle, T, Tag } from '../components/ui';
import { useStudy } from '../context/StudyContext';
import { findLesson, findQuestion, subjects } from '../data/curriculum';

export default function Review() {
  const { state } = useStudy();
  const mistakes = state.mistakes.map(findQuestion).filter((q) => q !== undefined);
  return (
    <Shell
      title="Entender o erro faz parte."
      subtitle="Volte às questões que precisam de atenção, sem pressa e sem perder progresso."
    >
      {mistakes.length > 0 ? (
        <>
          <Card style={{ gap: 14, marginBottom: 28, backgroundColor: '#EDF3FC' }}>
            <Tag text="SEU CADERNO DE ERROS" icon="refresh-cw" />
            <T variant="heading">
              {mistakes.length}{' '}
              {mistakes.length === 1 ? 'questão para revisar' : 'questões para revisar'}
            </T>
            <T variant="small">
              Uma resposta correta na revisão retira a questão deste caderno. Você sempre pode
              voltar à explicação da lição.
            </T>
            <Button
              title="Revisar agora"
              icon="arrow-right"
              onPress={() => router.push('/sessao?modo=review')}
              style={{ alignSelf: 'flex-start' }}
            />
          </Card>
          <View style={{ gap: 10 }}>
            {mistakes.map((q) => {
              const l = findLesson(q.lessonId)!;
              return (
                <Pressable
                  key={q.id}
                  accessibilityRole="button"
                  accessibilityLabel={'Revisar: ' + q.prompt}
                  onPress={() =>
                    router.push({ pathname: '/sessao', params: { modo: 'review', questao: q.id } })
                  }
                >
                  <Card style={{ padding: 19, gap: 8 }}>
                    <Tag text={subjects[l.subject].name + ' · ' + l.title} />
                    <T variant="label">{q.prompt}</T>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <T variant="small">Tentar novamente</T>
                      <Icon name="arrow-right" size={13} color={colors.muted} />
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : (
        <Empty
          icon="check-circle"
          title="Seu caderno está em dia."
          description={
            state.attempts.length
              ? 'Você não tem erros pendentes. Continue praticando para fortalecer sua base.'
              : 'As questões que você errar ficam aqui, junto com a chance de compreender e tentar novamente.'
          }
        >
          <Button
            title="Explorar as trilhas"
            icon="arrow-right"
            onPress={() => router.push('/trilhas')}
          />
        </Empty>
      )}
      <View style={{ marginTop: 28 }}>
        <SectionTitle title="Misture os assuntos" />
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="shuffle" />
            <T variant="heading" style={{ flex: 1 }}>
              Treino de Português e Matemática
            </T>
          </View>
          <T variant="small">
            Pratique as duas matérias com questões sorteadas e resoluções. O treino é autoral e não
            reproduz uma prova oficial.
          </T>
          <Button
            title="Preparar treino"
            tone="secondary"
            icon="arrow-right"
            onPress={() => router.push('/pratica')}
            style={{ alignSelf: 'flex-start' }}
          />
        </Card>
      </View>
    </Shell>
  );
}
