# Contagem de visitas às prévias

As prévias ativas podem registrar uma visualização por carregamento no Umami Cloud. O painel mostra a rota sintética `/previas/<id-da-amostra>` para separar as amostras sem acrescentar e-mail, nome ou token de destinatário ao link. O código só carrega o tracker em `jhouautomacoes-art.github.io`, para um ID válido, antes da expiração de 72 horas e respeitando Do Not Track e Global Privacy Control. A página informa sobre a contagem. Não há pixel no e-mail, `identify()`, evento de clique ou coleta de campos preenchidos.

**Estado atual: ativado em 15/10/2026.** O site `jhouautomacoes-art.github.io` foi adicionado ao Umami Cloud da conta do operador e o *Website ID* público está em `previas.html`. A visita inicial de teste foi confirmada na rota `/previas/agiair-servicos-20261014`; ela não é tráfego de um prospect. Para configurar outro site, use o novo UUID público. Nunca use API key, token ou senha:

```text
python scripts/configure_analytics.py set --website-id UUID_DO_SITE
node --test tests/test_preview_analytics.cjs
python -m unittest discover -s tests -v
```

Publicar `previas.html` atualizado no GitHub Pages pelo workflow existente. Abrir uma prévia ativa no domínio público e conferir **uma** visita na rota `/previas/<id>` no painel Umami. Para desativar, executar `python scripts/configure_analytics.py disable` e publicar novamente. Os IDs e as estatísticas não são segredo; a conta do painel deve permanecer privada.

O recurso não reconstrói visitas passadas, não confirma que o próprio destinatário abriu o link (ele pode ter sido encaminhado ou acessado por um verificador de segurança) e pode perder visitas bloqueadas pelo navegador. Não usar a métrica como prova de leitura nem para disparar follow-ups automáticos. A expiração da amostra não remove necessariamente estatísticas já coletadas nem cópias externas do site.
