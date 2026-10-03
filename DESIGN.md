# Jhou Automações — sistema visual

## Direção

Portfólio pessoal com uma galeria horizontal de software. Fotografia real, marca pessoal original e paleta verde. O palco escuro cria contraste com o restante da apresentação em papel claro. Interfaces vetoriais em perspectiva representam dados, OCR, fluxos, camadas de aplicação e uso mobile.

## Cores e tipografia

- Papel: #f4f5ed.
- Texto e apresentação: #17392d.
- Palco do portfólio: #0e281f.
- Acento verde: #c6eb85.
- Cartão claro: #c6dfaa.
- Texto secundário claro: #9db68c; texto secundário no papel: #5b685e.
- Manrope nos títulos e DM Sans no conteúdo, com fallback Arial.

## Layout

Conteúdo limitado a 1280px. Hero em duas colunas, galeria de projetos em uma única faixa horizontal. Um projeto ocupa a maior parte do palco; o próximo fica parcialmente visível com um fade na borda. A galeria permanece horizontal no celular. A apresentação completa abre em dialog nativo, com duas colunas no desktop e uma no celular. Projeto aberto não aumenta a altura da página principal.

## Componentes e estados

- Filtros atualizam cards, posição e índice de projetos.
- Arraste com mouse, swipe nativo, setas, teclado e índice direto.
- Posição anunciada e setas desativadas nos limites.
- Arrastar não abre o card por acidente.
- Janela de detalhes com fechamento por botão, Escape e fundo externo; navegação respeita o filtro ativo.
- Foco retorna ao card e a rolagem do corpo é restaurada após fechamento.
- Simulação de laboratório com estados aguardando, em execução e concluído; reiniciar/fechar cancela timers.

## Movimento e acessibilidade

Perspectiva e transições de camadas, gráficos, leitura OCR e fluxo de dados. Foco visível, controles nativos e movimento reduzido respeitado. A animação não carrega informação exclusiva: todas as funções também são descritas em texto.

## Conteúdo e identidade

Cinco projetos apresentam funções verificadas de ferramentas desenvolvidas pelo titular. O laboratório de orquestração é identificado como estudo conceitual, com arquitetura proposta e simulação local. Interfaces e dados são ilustrativos. Sem nomes de empresas, aplicativos internos, clientes, depoimentos, implantações ou métricas comerciais inventadas. A foto, o PNG com transparência e o ícone J são originais do titular. Endereço e telefone permanecem privados.

## Implementação

HTML, CSS, SVG e JavaScript nativos; sem dependências de build ou scripts de terceiros. Google Fonts com fallback local. A skill OpenDesign frontend-design orienta a composição e a revisão. Contato por mailto, sem formulário, analytics ou backend de coleta.


## Entrada de pedidos

Dialog acessível com validação, prévia, mailto e download JSON. O visitante envia o e-mail; não há backend, envio automático, analytics ou armazenamento no site. IA e avaliação de escopo são informadas. A importação local é validada por comercial.py e não libera contatos, execução, preços ou contratos.
