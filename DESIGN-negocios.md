# Três demonstrações setoriais — 14/10/2026

Referência de qualidade: central de serviços aprovada pelo titular. Identidade Jhou em verde, ícone J original, componentes nativos e estados verificáveis. Marcas, fotos, processos e dados dos negócios prospectados não são reproduzidos. Os exemplos apresentam hipóteses sobre fluxos administrativos; nenhum cliente ou implantação é alegado.

## Direções visuais

- **Gráfica:** bancada de prova em papel marfim, marcas de registro e tintas pontuais. O destaque é a peça gerada em HTML/CSS com marca Jhou, sem simular arquivo real enviado pela gráfica. Verde escuro, névoa oliva e tipografia editorial distinguem o produto, enquanto controles densos comunicam operação.
- **Locação:** mesa de frota em oliva seco, cartões de equipamento desenhados em CSS, faixa horizontal de reserva a conferência. O período integra a disponibilidade e a visão do cliente. Nenhuma inspeção ou liberação de segurança é representada.
- **Recepção:** agenda em verde água calmo, linha curta das etapas, sala/equipe no mesmo horário e histórico de confirmação. Somente solicitações numeradas; nenhuma informação de paciente, prontuário ou decisão clínica.

## Comportamento

O modelo puro de negócio está em `negocios-model.js`; `negocios-ui.js` apresenta as quatro visões e o painel em foco. Os estados são somente da memória da página e são apagados ao expirar. Existe busca, filtro, seleção, erro de regra, evento de histórico, indicadores derivados, visão demonstrativa e exportação TXT quando o fluxo termina. Dados vindos de campo passam por escape antes da renderização HTML. A interface é apenas uma amostra; backend, login, permissões, sincronização e privacidade de produção dependeriam de escopo próprio.

O layout separa rail, área de trabalho e detalhe. Abaixo de930px o rail vira menu horizontal; abaixo de760px o detalhe fica em outra linha. As listas, filtros e agenda usam `minmax(0,1fr)` para evitar corte; no celular o registro selecionado rola para o painel. Labels nativas, foco visível, mensagens de erro/estado, botões sem ação durante expiração e movimento reduzido. Testes de regras e de prazo no runner e validação visual no navegador fazem parte da entrega.

## Decisão técnica

HTML/CSS/JavaScript existentes atendem à demonstração; bibliotecas externas não acrescentariam comportamento e aumentariam dependência/risco de publicação. Nenhum SDK, telemetria, logo ou código do prospect foi incorporado. O workflow usa Node Test Runner e unittest já disponíveis, com fontes oficiais e sem gastos. Os três registros usam o mesmo ciclo de até72h e limpeza por hora da página, sujeitos ao histórico público do GitHub.
