# Registro de validação

Data: **5 de outubro de 2026**. Primeira versão **1.0.0**.

## Verificações realizadas

| Verificação                                | Resultado                                                            |
| ------------------------------------------ | -------------------------------------------------------------------- |
| TypeScript estrito                         | Sem erros                                                            |
| ESLint do Expo                             | Sem erros                                                            |
| Testes do motor de aprendizagem            | 18 cenários aprovados                                                |
| Testes da interface web                    | 12 cenários aprovados: seis em desktop, seis em viewport móvel       |
| Expo Doctor                                | 21 de 21 verificações aprovadas                                      |
| Compatibilidade das dependências com o SDK | Dependências alinhadas                                               |
| Exportação Metro                           | Bundles de Android, iOS e web gerados                                |
| Inspeção visual                            | Início e lição conferidos em desktop e viewport de celular           |
| Integridade do conteúdo                    | 33 lições, 99 questões, IDs únicos, alternativas e gabaritos válidos |

Os cenários de interface verificam uma lição com erro e acertos, conclusão, restauração após recarregamento, recuperação na revisão, busca sem acento, troca de disciplina, persistência de preferências, cancelamento de exclusão, treino de 20 questões, saída de sessão e links inválidos.

Os testes de motor verificam progresso inicialmente vazio, regras do caderno de erros, respostas inválidas, conclusões idempotentes, repetição de lição, separação de disciplinas, amostragem sem repetição, limites do banco, serialização e sanitização. Parte dos gabaritos matemáticos também foi comparada com cálculos independentes.

## Dependências e auditoria

O relatório **npm audit** apresentou **29 avisos transitivos: 19 de severidade alta e 10 moderada**, nenhum crítico. Os números incluem pacotes afetados indiretamente, não 29 falhas distintas no código do app. Principais origens identificadas:

| Dependência          | Aviso                                                                                                | Local no projeto                              |
| -------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| node-forge           | [Verificação de assinatura RSA](https://github.com/advisories/GHSA-86w9-cpqp-85rv)                   | Cadeia de ferramentas e certificados do Expo  |
| braces               | [Exaustão de pilha em padrões aninhados](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)          | Cadeia de busca de arquivos do Metro          |
| uuid                 | [Limites de buffer em v3/v5/v6](https://github.com/advisories/GHSA-w5hq-g745-h8pq)                   | Gerador de projeto Xcode nas ferramentas Expo |
| decode-uri-component | [Decodificação exponencial de entrada malformada](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr) | query-string usado pelo Expo Router           |

Na versão consultada do registro, node-forge 1.4.0 e braces 3.0.3 ainda eram as versões estáveis mais recentes e continuavam listadas nos avisos. Os caminhos automáticos sugeridos por npm audit incluíam alterações incompatíveis de Expo/React Native. A versão 0.5 de decode-uri-component mudou para ESM, enquanto o query-string 7 do Router espera CommonJS. Não foram impostas trocas incompatíveis que comprometessem o Expo Go.

Esses avisos ficam registrados para atualização e revisão antes de distribuição em produção. Aprovação de testes ou Expo Doctor não equivale a auditoria de segurança aprovada. O MVP não usa certificados, pagamentos, uploads ou servidor público, mas o aviso de parsing de links exige acompanhamento.

## Limites da verificação

- Não foi executado em um aparelho físico Android ou iPhone. A compatibilidade foi verificada pelo SDK, pelo Expo Doctor e pela geração dos bundles.
- A interface foi testada em Chromium com viewport de desktop e celular, em contextos temporários isolados; isso não simula todos os comportamentos nativos.
- VoiceOver, TalkBack, teclado nativo e texto muito ampliado precisam de uma rodada em dispositivos reais.
- Ainda não houve revisão externa de todos os conteúdos por professores.
- O banco inaugural tem 99 questões autorais, não todas as mais de 500 questões da apostila.
- Não foi conferida aderência a um edital de capitania específico.
- Não há backend, sincronização, APK/IPA ou publicação em lojas.
- A persistência é assíncrona; fechar o processo durante uma gravação pode perder a alteração mais recente.

## Reproduzir

    npm ci
    npm run check
    npx expo-doctor
    npx expo install --check
    npm run export
    npx playwright install chromium
    npm run test:e2e
    npm audit

Relatórios temporários ficam fora do Git. Capturas revisadas acompanham a documentação em docs/images.
