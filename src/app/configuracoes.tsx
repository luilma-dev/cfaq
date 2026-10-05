import React, { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Card, colors, Icon, T } from '../components/ui';
import { useStudy } from '../context/StudyContext';

export default function SettingsScreen() {
  const { ready } = useStudy();
  return ready ? <SettingsContent /> : <Shell>{null}</Shell>;
}
function SettingsContent() {
  const { state, update, reset } = useStudy();
  const [settings, setSettings] = useState({ ...state.settings });
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const change = (next: Partial<typeof settings>) => {
    setSettings((old) => ({ ...old, ...next }));
    setSaved(false);
  };
  return (
    <Shell
      title="Um plano com a sua cara."
      subtitle="Escolha um ritmo possível. Você pode mudar quando precisar."
    >
      <View style={{ maxWidth: 760, gap: 23 }}>
        <Card style={{ gap: 20 }}>
          <T variant="heading">Seu perfil de estudo</T>
          <View style={{ gap: 8 }}>
            <T variant="label">
              Como podemos chamar você? <T variant="small">(opcional)</T>
            </T>
            <TextInput
              accessibilityLabel="Seu nome, opcional"
              placeholder="Seu primeiro nome"
              placeholderTextColor={colors.muted}
              maxLength={40}
              value={settings.name}
              onChangeText={(name) => change({ name })}
              style={{
                minHeight: 49,
                borderWidth: 1,
                borderColor: colors.line,
                paddingHorizontal: 14,
                borderRadius: 9,
                fontSize: 15,
                color: colors.ink,
              }}
            />
          </View>
          <View style={{ gap: 10 }}>
            <T variant="label">Qual é o seu objetivo?</T>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['MOC', 'MOM'] as const).map((course) => (
                <Pressable
                  key={course}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: settings.course === course }}
                  onPress={() => change({ course })}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: settings.course === course ? colors.navy : colors.line,
                    borderRadius: 10,
                    padding: 15,
                    backgroundColor: settings.course === course ? colors.blueTint : colors.white,
                    gap: 4,
                  }}
                >
                  <T variant="label">{course}</T>
                  <T variant="small">{course === 'MOC' ? 'Moço de Convés' : 'Moço de Máquinas'}</T>
                </Pressable>
              ))}
            </View>
            <T variant="small">
              As duas opções usam as mesmas trilhas de Português e Matemática nesta versão.
            </T>
          </View>
          <View style={{ gap: 10 }}>
            <T variant="label">Minutos por dia de estudo</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
              {[15, 30, 45, 60].map((minutes) => (
                <Pressable
                  key={minutes}
                  accessibilityRole="radio"
                  accessibilityLabel={minutes + ' minutos por dia'}
                  accessibilityState={{ checked: settings.minutes === minutes }}
                  onPress={() => change({ minutes })}
                  style={{
                    minWidth: 65,
                    minHeight: 46,
                    paddingHorizontal: 17,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: settings.minutes === minutes ? colors.navy : colors.line,
                    borderRadius: 9,
                    backgroundColor: settings.minutes === minutes ? colors.blueTint : colors.white,
                  }}
                >
                  <T variant="label">{minutes} min</T>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ gap: 10 }}>
            <T variant="label">Dias de estudo por semana</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
              {[3, 4, 5, 6].map((days) => (
                <Pressable
                  key={days}
                  accessibilityRole="radio"
                  accessibilityLabel={days + ' dias por semana'}
                  accessibilityState={{ checked: settings.days === days }}
                  onPress={() => change({ days })}
                  style={{
                    minWidth: 65,
                    minHeight: 46,
                    paddingHorizontal: 17,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: settings.days === days ? colors.navy : colors.line,
                    borderRadius: 9,
                    backgroundColor: settings.days === days ? colors.blueTint : colors.white,
                  }}
                >
                  <T variant="label">{days} dias</T>
                </Pressable>
              ))}
            </View>
          </View>
          <Button
            title="Salvar preferências"
            icon="check"
            onPress={() => {
              update((old) => ({ ...old, settings: { ...settings, name: settings.name.trim() } }));
              setSaved(true);
            }}
          />
          {saved && (
            <T accessibilityLiveRegion="polite" style={{ color: colors.green }}>
              Preferências aplicadas ao seu plano.
            </T>
          )}
        </Card>
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Icon name="shield" color={colors.green} />
            <T variant="heading">Seu estudo fica com você.</T>
          </View>
          <T variant="small">
            Seu nome, respostas e progresso ficam neste aparelho. Não há cadastro, anúncios, coleta
            de dados ou sincronização entre dispositivos. Desinstalar o app ou limpar os dados pode
            apagar seu progresso.
          </T>
        </Card>
        <Card style={{ gap: 12 }}>
          <T variant="heading">Sobre o CFAQ</T>
          <T variant="small">
            Um app brasileiro independente de preparação para CFAQ MOC e MOM. Conteúdo de Português
            e Matemática organizado a partir da apostila CFAQ & CAAQ, com explicações e exercícios
            autorais.
          </T>
          <T variant="small">
            Sem vínculo oficial com a Marinha do Brasil. Compare o conteúdo com o edital da sua
            seleção.
          </T>
          <T variant="small">Versão 1.0.0 · Cauã Lima</T>
        </Card>
        <Card style={{ gap: 13 }}>
          <T variant="heading">Recomeçar o progresso</T>
          <T variant="small">
            Apaga suas respostas, lições concluídas, histórico e preferências deste aparelho. A ação
            só acontece depois da confirmação.
          </T>
          <Button
            title="Apagar meus dados"
            tone="ghost"
            icon="trash-2"
            onPress={() => setConfirm(true)}
            style={{ alignSelf: 'flex-start' }}
          />
        </Card>
        <Modal
          transparent
          visible={confirm}
          animationType="fade"
          onRequestClose={() => setConfirm(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
              backgroundColor: 'rgba(11,42,91,0.35)',
            }}
          >
            <Card style={{ width: '100%', maxWidth: 420, gap: 18 }}>
              <T variant="heading">Apagar todo o progresso?</T>
              <T>
                As respostas, o histórico e suas preferências serão apagados. Essa ação não pode ser
                desfeita.
              </T>
              <Button title="Manter meus dados" onPress={() => setConfirm(false)} />
              <Button
                title="Sim, apagar meus dados"
                tone="danger"
                onPress={() => {
                  reset();
                  setConfirm(false);
                  router.replace('/');
                }}
              />
            </Card>
          </View>
        </Modal>
      </View>
    </Shell>
  );
}
