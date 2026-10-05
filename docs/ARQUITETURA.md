# Arquitetura e decisões

## Plataforma

React Native + Expo SDK 57 + TypeScript estrito. Navegação pelo Expo Router. Web usa React Native Web. As dependências nativas escolhidas estão disponíveis no Expo Go do SDK correspondente: AsyncStorage, safe-area-context, screens, SVG e módulos Expo. Não há código nativo próprio.

O objetivo é uma base móvel funcional, com interface adaptada ao navegador para desenvolvimento e estudo no computador. A barra inferior aparece abaixo de 1.000 pontos; em telas maiores, uma navegação lateral. Componentes e conteúdo são compartilhados.

## Rotas

| Rota                                | Função                                          |
| ----------------------------------- | ----------------------------------------------- |
| /                                   | Próxima lição, indicadores e atalhos            |
| /trilhas?materia=matematica         | Seleção de disciplina, busca e lições           |
| /licao/[id]                         | Explicação, exemplo, dica e referência          |
| /sessao?modo=lesson&licao=pt-01     | Exercícios da lição                             |
| /sessao?modo=review                 | Revisão das questões pendentes                  |
| /pratica                            | Configuração do treino misto                    |
| /sessao?modo=practice&quantidade=20 | Sessão de treino                                |
| /plano                              | Roteiro de oito semanas e distribuição do tempo |
| /progresso                          | Métricas, atividade e histórico                 |
| /revisao                            | Caderno de erros e acesso ao treino             |
| /configuracoes                      | Preferências, informações e exclusão confirmada |

IDs de lição: pt-01 a pt-19, mt-01 a mt-14. IDs das questões seguem o prefixo da lição. Links inexistentes ou sessões inválidas recebem uma tela de recuperação.

## Conteúdo

**src/data/curriculum.ts** contém dados tipados, sem lógica de interface. Uma lição define assunto, semana, duração estimada, páginas de referência, teoria, exemplo, dica e três questões. Cada questão tem quatro alternativas, índice de resposta e resolução.

As alternativas são distribuídas deterministicamente entre posições A–D. O gabarito acompanha essa distribuição. O treino usa Fisher–Yates, sem repetir questões na mesma sessão, e separa metade de Português e metade de Matemática nos tamanhos oferecidos.

## Estado local

**src/lib/learning.ts** contém funções puras para tentativas, erros, conclusão, estatísticas e validação da recuperação. StudyContext coordena carregamento e gravação.

Formato versão 1, chave **@cfaq/study/v1**:

- results: último resultado completo de cada lição.
- attempts: últimas 5.000 respostas conferidas.
- mistakes: IDs únicos das questões cujo último resultado permanece errado.
- history: últimas 200 sessões completas, com identificador para impedir duplicação.
- settings: nome opcional, minutos, dias e objetivo MOC/MOM.

Nenhum dado sai do aparelho por uma API do app. AsyncStorage não é armazenamento criptografado; os dados são preferências e resultados de estudo, sem credenciais. Na web, são isolados por origem no armazenamento do navegador.

## Regras de progresso

1. Escolher uma alternativa não registra uma tentativa; conferir registra.
2. Uma tentativa errada adiciona a questão ao caderno sem duplicar o ID.
3. Um acerto posterior retira a pendência.
4. Apenas finalizar todas as questões registra a sessão completa.
5. Repetir uma lição atualiza o resultado, sem aumentar duas vezes a contagem de lições.
6. Treino e revisão entram no histórico, mas não concluem uma lição inteira.
7. Aproveitamento é a proporção de tentativas corretas registradas. Sem respostas, exibe-se um traço.
8. Conclusão não representa domínio, nota de corte ou estimativa de aprovação.

O índice da sessão é mantido em memória. Sair ou fechar inicia uma nova sessão na próxima abertura; respostas já conferidas permanecem salvas. Não há retomada exata de sessão interrompida no MVP.

## Persistência e falhas

O app espera a leitura inicial antes de renderizar controles dependentes do progresso. A gravação só começa depois de uma leitura válida, para não sobrescrever o armazenamento com o estado inicial. Escritas seguem uma fila, preservando a ordem.

Versão desconhecida ou JSON inválido exibem aviso e impedem gravação automática. A tela oferece nova tentativa; apagar os dados exige confirmação explícita na interface. Falhas de gravação mantêm a sessão em memória e exibem aviso. A aplicação não garante recuperação se o sistema interromper o processo antes de a última gravação assíncrona terminar.

## Identidade e recursos

Componentes básicos em **ui.tsx**; navegação e layout em **Shell.tsx**. Cores centralizadas. Símbolo original em **assets/brand/compass.svg**, com PNGs derivados para o ícone. A rosa dos ventos na interface é SVG nativo.

Fontes são carregadas a partir dos três arquivos usados, com fallback de sistema. Ícones decorativos ficam fora dos rótulos acessíveis. Estados de escolha, confirmação e erro são apresentados por texto e ícone.

## Limites

Sem servidor, login, sincronização, publicação em lojas ou integração com um edital específico. A estrutura permite evoluir o banco de questões sem reescrever a navegação. Mudanças incompatíveis no formato persistido devem acrescentar migração explícita.
