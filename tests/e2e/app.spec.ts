import { expect, test } from '@playwright/test';

test('início e identidade visual em contexto novo', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByText('Boas-vindas a bordo.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Começar lição', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: 'docs/images/inicio-' + info.project.name + '.png',
    fullPage: true,
  });
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('lição, erro, conclusão, persistência e recuperação na revisão', async ({ page }) => {
  await page.goto('/licao/pt-01');
  await page.getByRole('button', { name: 'Praticar esta lição' }).click();
  await expect(page.getByRole('button', { name: 'Conferir resposta' })).toBeDisabled();
  await page.getByRole('radio', { name: /Diminuir a quantidade de livros/ }).click();
  await page.getByRole('button', { name: 'Conferir resposta' }).click();
  await expect(page.getByText('Vamos entender a resposta.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Próxima questão' }).click();
  await page.getByRole('radio', { name: /Ana esteve exposta à chuva/ }).click();
  await page.getByRole('button', { name: 'Conferir resposta' }).click();
  await page.getByRole('button', { name: 'Próxima questão' }).click();
  await page.getByRole('radio', { name: /O valor da matrícula/ }).click();
  await page.getByRole('button', { name: 'Conferir resposta' }).click();
  await page.getByRole('button', { name: 'Ver resultado' }).click();
  await expect(page.getByText('SESSÃO CONCLUÍDA', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ver meu progresso' }).click();
  await expect(page.getByText('1/33', { exact: true })).toBeVisible();
  await expect(page.getByText('67%', { exact: true })).toBeVisible();
  await expect(page.getByText('2/3', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('1/33', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Revisão', exact: true }).click();
  await expect(page.getByText('1 questão para revisar', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Revisar agora' }).click();
  await page.getByRole('radio', { name: /Atender pessoas que trabalham durante a semana/ }).click();
  await page.getByRole('button', { name: 'Conferir resposta' }).click();
  await page.getByRole('button', { name: 'Ver resultado' }).click();
  await page.getByRole('button', { name: 'Revisar erros' }).click();
  await expect(
    page.getByText('Seu caderno está em dia.', { exact: true }).filter({ visible: true }),
  ).toBeVisible();
});

test('busca sem acento, seleção de matéria e abertura de lição', async ({ page }, info) => {
  await page.goto('/trilhas');
  await page.getByRole('tab', { name: /Matemática/ }).click();
  await page.getByRole('textbox', { name: 'Buscar assunto na trilha' }).fill('fracoes');
  await expect(
    page.getByRole('button', { name: 'Frações, disponível', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Frações, disponível', exact: true }).click();
  await expect(page.getByText('Entenda o assunto', { exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: 'docs/images/licao-' + info.project.name + '.png',
    fullPage: true,
  });
});

test('preferências alteram plano e sobrevivem ao recarregamento', async ({ page }) => {
  await page.goto('/configuracoes');
  await page.getByRole('textbox', { name: 'Seu nome, opcional' }).fill('Estudante de teste');
  await page.getByRole('radio', { name: '45 minutos por dia', exact: true }).click();
  await page.getByRole('radio', { name: '6 dias por semana', exact: true }).click();
  await page.getByRole('radio', { name: /MOM/ }).click();
  await page.getByRole('button', { name: 'Salvar preferências' }).click();
  await page.getByRole('button', { name: 'Meu plano', exact: true }).click();
  await expect(
    page.getByText('45 minutos por dia · 6 dias por semana', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText('45 minutos por dia · 6 dias por semana', { exact: true }),
  ).toBeVisible();
  await page.goto('/configuracoes');
  await expect(page.getByRole('textbox', { name: 'Seu nome, opcional' })).toHaveValue(
    'Estudante de teste',
  );
  await page.getByRole('button', { name: 'Apagar meus dados' }).click();
  await page.getByRole('button', { name: 'Manter meus dados' }).click();
  await expect(page.getByRole('textbox', { name: 'Seu nome, opcional' })).toHaveValue(
    'Estudante de teste',
  );
});

test('treino de 20 questões e saída preservam tentativas sem concluir', async ({ page }) => {
  await page.goto('/pratica');
  await page.getByRole('radio', { name: /20 questões/ }).click();
  await page.getByRole('button', { name: 'Começar treino' }).click();
  await expect(page.getByText('Questão 1 de 20', { exact: true })).toBeVisible();
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Conferir resposta' }).click();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page.getByText('Sair desta sessão?', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sair da sessão', exact: true }).click();
  await page.getByRole('button', { name: 'Progresso', exact: true }).click();
  await expect(page.getByText('1 respostas registradas', { exact: true })).toBeVisible();
  await expect(page.getByText('0/33', { exact: true })).toBeVisible();
});

test('link inválido não inicia uma sessão incorreta', async ({ page }) => {
  await page.goto('/licao/inexistente');
  await expect(page.getByText('Lição não encontrada.', { exact: true })).toBeVisible();
  await page.goto('/sessao?modo=desconhecido');
  await expect(page.getByText('Sessão não encontrada.', { exact: true })).toBeVisible();
});
