import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { StudyProvider } from '../context/StudyContext';
import { FontReadyContext, colors } from '../components/ui';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Body: require('@expo-google-fonts/dm-sans/400Regular/DMSans_400Regular.ttf'),
    BodyBold: require('@expo-google-fonts/dm-sans/700Bold/DMSans_700Bold.ttf'),
    HeadingBold: require('@expo-google-fonts/manrope/700Bold/Manrope_700Bold.ttf'),
    ...Feather.font,
  });
  return (
    <SafeAreaProvider>
      <FontReadyContext.Provider value={fontsLoaded}>
        <StudyProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'none',
            }}
          />
        </StudyProvider>
      </FontReadyContext.Provider>
    </SafeAreaProvider>
  );
}
