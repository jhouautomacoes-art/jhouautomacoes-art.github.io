# Jhou Automações

Site pessoal de Jhonata Machado, desenvolvedor solo. Jhou Automações é sua marca pessoal.

## Publicação

GitHub Pages em https://jhouautomacoes-art.github.io/, com origem GitHub Actions e código na branch main. O workflow `.github/workflows/previas-pages.yml` monta somente os arquivos públicos e publica o site após alterações. HTML, CSS e JavaScript continuam nativos. As URLs dos estilos e scripts identificam a revisão.

## Cenários interativos

- Lancheria no horário de pico: incluir um pedido e acompanhar entrada, cozinha e retirada.
- Clínica com cancelamento: reservar um horário para uma solicitação da lista de espera.
- Oficina: aprovar um orçamento ilustrativo, iniciar e concluir a ordem.
- Comércio: alterar a cobertura e calcular reposição a partir da saída média, prazo e saldo.
- Escritório: conferir a data na fonte documental preparada e atualizar a tabela do lote.
- Visita em campo: preencher o checklist, concluir o registro e simular a fila de sincronização.

Cada slide possui uma aparência própria. Os conceitos usam dados fictícios e estados apenas na memória do navegador. Não processam PDFs reais, realizam compras, enviam mensagens, conectam sistemas ou instalam um APK. Apresentam o que pode ser desenvolvido sob um escopo combinado.

## Navegação

Galeria lateral no computador e celular, com mouse, swipe, setas, teclado e categorias. A altura acompanha o exemplo ativo. Restauração individual, foco visível, slides inativos com inert e movimento reduzido.

## Marca e contato

Foto, PNG transparente e ícone J originais do titular. Conteúdo em primeira pessoa, sem apresentar empresa ou equipe. Contatos públicos: jhouautomacoes@gmail.com e https://wa.me/5551984170069.

## Prévia local

Sirva somente esta pasta com python -m http.server 8821 --bind 127.0.0.1 e acesse http://127.0.0.1:8821/#projetos.

## Pedidos

Formulário existente com validação, prévia, mailto e download JSON. O visitante revisa e decide o envio no seu aplicativo de e-mail. Sem envio automático, backend ou armazenamento de pedidos no site.

## Prévias temporárias

`previas.html?amostra=ID` apresenta somente uma amostra ativa do registro reutilizável. A primeira demonstração organiza um pedido de uniformes com dados fictícios, sem assumir o fluxo interno do negócio. Layout editorial, marca Jhou, formulário e resumo responsivos.

Cada registro dura no máximo 72 horas a partir da criação. O navegador bloqueia a exibição ao vencer; a limpeza no GitHub remove registros vencidos e publica o site atualizado a cada hora, no minuto 17, sem depender do computador local. Tarefas agendadas do GitHub podem atrasar e são desativadas depois de 60 dias sem atividade. Não existe garantia de exclusão física no segundo exato; commits antigos e cópias já baixadas continuam existindo. O controle limita as amostras ativas e reaproveita arquivos, sem reescrever histórico.

Para preparar uma nova amostra de uniformes: `python scripts/previas.py add --id ID-NOVO --title "Ideia ilustrativa para o negócio" --hours 72`, seguido de revisão e publicação da alteração. Use identificadores novos e somente informações públicas/dados fictícios. O limite é 20 registros; outros modelos de interface precisam de desenvolvimento e testes próprios. O script não envia e-mails ou aceita trabalho de cliente.

Validação: `python -m unittest discover -s tests -v`, `node --test tests/test_service_model.cjs` e `python scripts/previas.py check`. A publicação inclui apenas assets rastreados no Git. Scripts, testes e arquivos locais sem rastreamento não entram no site.

### Central de serviços (14/10/2026)

Novo modelo `servicos`: agenda com bloqueio de conflito, ordens de serviço com etapas, checklist administrativo, histórico por equipamento, indicadores e visão demonstrativa do cliente. Exporta um relatório TXT após concluir os registros. Dados fictícios somente na memória; sem backend, login real, laudo, integração ou envio. Recarregar ou restaurar reinicia a amostra.

Para usar o novo modelo: `python scripts/previas.py add --id ID-NOVO --title "Ideia para o negócio" --template servicos --hours 72`. Mantém o mesmo limite total de20 e o mesmo vencimento; a amostra anterior de uniformes conserva seu endereço e prazo. O renderizador compartilhado não é apagado junto de cada registro. Documentação visual em DESIGN-servicos.md.

### Três fluxos de negócio (14/10/2026)

Novos modelos próprios: `grafica` (briefing, versão de prova, conferências, conflito de linha e quantidade produzida), `locacao` (disponibilidade por intervalo, reserva, saída, retorno e conferência administrativa) e `recepcao` (solicitação fictícia, conflito de sala/equipe, confirmação, chegada e cancelamento). As três telas usam o mesmo registro em todas as visões e permitem baixar TXT apenas após concluir o fluxo. Não há envio, dados de clientes, produção, reserva real, prontuário ou inspeção técnica. Visual e escopo em DESIGN-negocios.md.

Criar um registro com `python scripts/previas.py add --id ID-NOVO --title "Ideia informativa" --template grafica --hours 72` (troque o modelo conforme o segmento), testar `python -m unittest discover -s tests -v` e `node --test tests/test_service_model.cjs tests/test_business_model.cjs`. O registro continua limitado a20 amostras e até72h; não reusar IDs.
