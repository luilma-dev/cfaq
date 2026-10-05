import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudy } from '../context/StudyContext';
import { BrazilMark, colors, Icon, type IconName, T } from './ui';

const nav: {
  label: string;
  icon: IconName;
  path: '/' | '/trilhas' | '/plano' | '/revisao' | '/progresso';
}[] = [
  { label: 'Início', icon: 'home', path: '/' },
  { label: 'Trilhas', icon: 'book-open', path: '/trilhas' },
  { label: 'Meu plano', icon: 'calendar', path: '/plano' },
  { label: 'Revisão', icon: 'refresh-cw', path: '/revisao' },
  { label: 'Progresso', icon: 'bar-chart-2', path: '/progresso' },
];

export function Shell({
  children,
  title,
  subtitle,
  scrollKey,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scrollKey?: string | number;
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;
  const { state, ready, storageError, retry } = useStudy();
  const path = usePathname();
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [scrollKey]);
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.frame}>
        {desktop && (
          <View style={styles.sidebar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="CFAQ, início"
              onPress={() => router.navigate('/')}
              style={styles.brand}
            >
              <T variant="display" style={styles.wordmark}>
                CFAQ<T style={{ color: colors.blue, fontSize: 34 }}>.</T>
              </T>
              <T style={styles.tagline}>ESTUDE. EVOLUA. CONQUISTE.</T>
            </Pressable>
            <T variant="small" style={styles.navLabel}>
              SEU ESTUDO
            </T>
            <View style={{ gap: 6 }}>
              {nav.map((item) => (
                <Pressable
                  key={item.path}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: path === item.path }}
                  onPress={() => router.navigate(item.path)}
                  style={({ pressed }) => [
                    styles.navItem,
                    path === item.path && styles.navActive,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Icon
                    name={item.icon}
                    size={19}
                    color={path === item.path ? colors.navy : colors.muted}
                  />
                  <T
                    variant={path === item.path ? 'label' : 'body'}
                    style={{ color: path === item.path ? colors.navy : colors.muted, flex: 1 }}
                  >
                    {item.label}
                  </T>
                  {item.path === '/revisao' && state.mistakes.length > 0 && (
                    <T variant="small" style={styles.badge}>
                      {state.mistakes.length}
                    </T>
                  )}
                </Pressable>
              ))}
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.sidebarNote}>
              <Icon name="compass" color={colors.green} size={22} />
              <T variant="label" style={{ marginTop: 9 }}>
                No seu ritmo.
              </T>
              <T variant="small" style={{ marginTop: 5 }}>
                Cada assunto aprendido é um passo na sua preparação.
              </T>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate('/configuracoes')}
              style={styles.profile}
            >
              <View style={styles.avatar}>
                <T variant="label">
                  {state.settings.name ? state.settings.name[0].toUpperCase() : 'E'}
                </T>
              </View>
              <View style={{ flex: 1 }}>
                <T variant="label" numberOfLines={1}>
                  {state.settings.name || 'Estudante'}
                </T>
                <T variant="small">CFAQ · {state.settings.course}</T>
              </View>
              <Icon name="settings" size={18} color={colors.muted} />
            </Pressable>
          </View>
        )}
        <View style={styles.main}>
          <View style={[styles.topbar, !desktop && { paddingHorizontal: 20 }]}>
            {desktop ? (
              <T variant="small">Seu espaço de aprendizagem</T>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="CFAQ, início"
                onPress={() => router.navigate('/')}
              >
                <T variant="heading" style={{ letterSpacing: -0.9, fontSize: 25 }}>
                  CFAQ<T style={{ color: colors.blue }}>.</T>
                </T>
              </Pressable>
            )}
            <View style={{ flexDirection: 'row', gap: 17, alignItems: 'center' }}>
              {width > 600 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <View style={styles.onlineDot} />
                  <T variant="small">Conteúdo offline</T>
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Configurações de estudo"
                onPress={() => router.navigate('/configuracoes')}
                style={styles.settings}
              >
                <Icon name="sliders" size={18} />
              </Pressable>
            </View>
          </View>
          <ScrollView
            ref={scroll}
            style={{ flex: 1 }}
            contentContainerStyle={[styles.scrollContent, { paddingHorizontal: desktop ? 42 : 20 }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {storageError && (
                <Pressable accessibilityRole="button" onPress={retry} style={styles.warning}>
                  <Icon name="alert-circle" color={colors.red} />
                  <T variant="small" style={{ color: colors.red, flex: 1 }}>
                    {storageError} Toque para tentar novamente.
                  </T>
                </Pressable>
              )}
              {title && (
                <View style={{ gap: 8, marginBottom: 26 }}>
                  <T variant="title">{title}</T>
                  {subtitle && <T style={{ color: colors.muted }}>{subtitle}</T>}
                </View>
              )}
              {ready ? (
                children
              ) : (
                <ActivityIndicator
                  accessibilityLabel="Carregando seu estudo"
                  size="large"
                  color={colors.navy}
                  style={{ marginVertical: 80 }}
                />
              )}
            </View>
            <View style={[styles.footer, !desktop && styles.footerMobile, !desktop && { width }]}>
              <BrazilMark />
              <T variant="small" style={{ fontSize: desktop ? 11 : 12 }}>
                CFAQ · Português e Matemática
              </T>
            </View>
          </ScrollView>
          {!desktop && (
            <View style={styles.bottomNav}>
              {nav.map((item) => (
                <Pressable
                  key={item.path}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: path === item.path }}
                  onPress={() => router.navigate(item.path)}
                  style={styles.bottomItem}
                >
                  <Icon name={item.icon} color={path === item.path ? colors.navy : colors.muted} />
                  <T
                    variant="small"
                    style={{ fontSize: 10, color: path === item.path ? colors.navy : colors.muted }}
                  >
                    {item.label}
                  </T>
                  {path === item.path && <View style={styles.navDot} />}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  frame: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 238,
    paddingHorizontal: 20,
    paddingTop: 33,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  brand: { paddingHorizontal: 16, marginBottom: 48 },
  wordmark: { fontSize: 36, letterSpacing: -1.8 },
  tagline: { fontSize: 7.5, letterSpacing: 1.5, color: colors.navy, marginTop: 2 },
  navLabel: { fontSize: 9, letterSpacing: 1.6, paddingLeft: 16, marginBottom: 13 },
  navItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderRadius: 10,
    minHeight: 48,
  },
  navActive: { backgroundColor: colors.blueTint },
  badge: {
    backgroundColor: colors.white,
    paddingHorizontal: 7,
    borderRadius: 5,
    color: colors.navy,
  },
  sidebarNote: { backgroundColor: '#F5F8FC', padding: 18, borderRadius: 12, marginBottom: 26 },
  profile: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
    paddingVertical: 23,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  avatar: {
    width: 35,
    height: 35,
    backgroundColor: colors.blueTint,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1, minWidth: 0 },
  topbar: {
    height: 76,
    paddingHorizontal: 42,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  settings: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingTop: 30, paddingBottom: 15 },
  content: { width: '100%', maxWidth: 1130, alignSelf: 'center' },
  footer: {
    width: '100%',
    maxWidth: 1130,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 35,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerMobile: {
    alignSelf: 'flex-start',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 7,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    minHeight: 67,
    paddingVertical: 8,
  },
  bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 48 },
  navDot: {
    position: 'absolute',
    top: -8,
    height: 3,
    width: 21,
    borderRadius: 2,
    backgroundColor: colors.blue,
  },
  warning: {
    borderRadius: 10,
    padding: 15,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EC',
    marginBottom: 20,
  },
});
