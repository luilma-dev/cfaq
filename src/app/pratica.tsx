import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Card, colors, Icon, T, Tag } from '../components/ui';

export default function Practice() {
  const [count, setCount] = useState(10);
  return (
    <Shell
      title="Pratique o que aprendeu."
      subtitle="Um treino misto para conectar assuntos e descobrir o que revisar."
    >
      <Card style={{ maxWidth: 700, gap: 22 }}>
        <Tag text="PORTUGUÊS + MATEMÁTICA" icon="shuffle" />
        <T variant="heading">Como funciona</T>
        <T>
          Questões sorteadas das duas disciplinas, divididas igualmente. Depois de cada resposta,
          você recebe a resolução. Ao terminar, veja o resultado no seu histórico.
        </T>
        <T variant="small">
          Este é um treino de aprendizagem, sem cronômetro ou nota de corte. Não é uma reprodução da
          prova de um edital.
        </T>
        <T variant="label">Quantas questões você quer praticar?</T>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[10, 20].map((size) => (
            <Pressable
              key={size}
              accessibilityRole="radio"
              accessibilityState={{ checked: count === size }}
              onPress={() => setCount(size)}
              style={{
                flex: 1,
                backgroundColor: count === size ? colors.blueTint : '#F4F6FA',
                padding: 20,
                borderRadius: 12,
                gap: 8,
              }}
            >
              <Icon name={count === size ? 'check-circle' : 'circle'} size={20} />
              <T variant="heading">{size} questões</T>
              <T variant="small">{size / 2} de cada matéria</T>
            </Pressable>
          ))}
        </View>
        <Button
          title="Começar treino"
          icon="arrow-right"
          onPress={() =>
            router.push({
              pathname: '/sessao',
              params: { modo: 'practice', quantidade: String(count) },
            })
          }
        />
      </Card>
    </Shell>
  );
}
