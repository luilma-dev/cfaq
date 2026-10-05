import React from 'react';
import { router } from 'expo-router';
import { Shell } from '../components/Shell';
import { Button, Empty } from '../components/ui';
export default function NotFound() {
  return (
    <Shell>
      <Empty
        icon="compass"
        title="Vamos encontrar o caminho."
        description="Esta página não existe. Volte para o início e continue seu estudo."
      >
        <Button title="Ir para o início" onPress={() => router.replace('/')} />
      </Empty>
    </Shell>
  );
}
