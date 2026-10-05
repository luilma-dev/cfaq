import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Card, colors, Icon, ProgressBar, SectionTitle, T, Tag } from '../components/ui';
import { useStudy } from '../context/StudyContext';
import { lessons, subjects } from '../data/curriculum';
import { nextLesson } from '../lib/learning';

export default function Plan() {
  const { state } = useStudy();
  const minutes = state.settings.minutes;
  const current = nextLesson(state)?.week || 8;
  return (
    <Shell
      title="Seu estudo, com direção."
      subtitle="Oito semanas para percorrer a apostila. Ajuste o ritmo à sua vida."
    >
      <Card style={{ gap: 18, marginBottom: 26 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Tag text="PLANO FLEXÍVEL" icon="calendar" />
            <T variant="heading" style={{ marginTop: 13 }}>
              {minutes} minutos por dia · {state.settings.days} dias por semana
            </T>
          </View>
          <Button title="Ajustar" tone="secondary" onPress={() => router.push('/configuracoes')} />
        </View>
        <T variant="small">
          Alterne Português e Matemática. Reserve o último dia de estudo da semana para revisar e
          praticar as duas matérias.
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
          {[
            { title: 'Entender', min: Math.round(minutes * 0.4), icon: 'book-open' as const },
            { title: 'Praticar', min: Math.round(minutes * 0.4), icon: 'edit-3' as const },
            {
              title: 'Revisar',
              min: minutes - 2 * Math.round(minutes * 0.4),
              icon: 'refresh-cw' as const,
            },
          ].map((item) => (
            <View
              key={item.title}
              style={{
                flex: 1,
                minWidth: 90,
                backgroundColor: '#F5F8FC',
                borderRadius: 9,
                padding: 13,
                gap: 4,
              }}
            >
              <Icon name={item.icon} size={16} />
              <T variant="label">{item.title}</T>
              <T variant="small">{item.min} minutos</T>
            </View>
          ))}
        </View>
        <T variant="small" style={{ fontSize: 12 }}>
          Sugestão de rotina, sem prazo obrigatório. Use sua cópia da apostila para aprofundar cada
          assunto.
        </T>
      </Card>
      <SectionTitle
        title="Seu roteiro de oito semanas"
        caption="Toque em qualquer assunto para abrir a lição."
      />
      <View style={{ gap: 17 }}>
        {Array.from({ length: 8 }, (_, i) => i + 1).map((week) => {
          const pool = lessons.filter((l) => l.week === week);
          const completed = pool.filter((l) => state.results[l.id]).length;
          return (
            <Card
              key={week}
              style={{
                padding: 20,
                gap: 17,
                borderColor: week === current ? '#BBD1F1' : colors.line,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <T variant="heading">Semana {String(week).padStart(2, '0')}</T>
                  {current === week && <Tag text="Próximo passo" />}
                </View>
                <T variant="small">
                  {completed}/{pool.length}
                </T>
              </View>
              <ProgressBar value={(completed / pool.length) * 100} />
              {pool.map((l) => (
                <Pressable
                  key={l.id}
                  accessibilityRole="button"
                  onPress={() => router.push('/licao/' + l.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}
                >
                  <Icon
                    name={state.results[l.id] ? 'check-circle' : subjects[l.subject].icon}
                    color={subjects[l.subject].color}
                    size={16}
                  />
                  <View style={{ flex: 1 }}>
                    <T variant="label">{l.title}</T>
                    <T variant="small">{subjects[l.subject].name}</T>
                  </View>
                  <Icon name="chevron-right" color={colors.muted} size={17} />
                </Pressable>
              ))}
              <T
                variant="small"
                style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 }}
              >
                Feche a semana com revisão dos erros
                {week === 8
                  ? ' e um treino misto de conclusão.'
                  : ' e prática dos assuntos estudados.'}
              </T>
            </Card>
          );
        })}
      </View>
    </Shell>
  );
}
