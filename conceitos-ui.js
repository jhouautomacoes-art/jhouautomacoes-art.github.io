'use strict';
(function () {
  const root = document.getElementById('concept-demo');
  if (!root || root.hidden || typeof ConceptDemo === 'undefined') return;
  const M = ConceptDemo, type = root.dataset.template;
  let s = M.seed(type), notice = '', report = '';
  const app = document.getElementById('c-app');
  const safe = x => String(x).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const money = n => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(n);
  const setNotice = (message, error) => { notice = message; const e = document.getElementById('c-status'); e.textContent = message; e.dataset.error = error ? 'true' : 'false'; };
  const alive = () => !root.hidden && typeof active === 'function' && active();
  function frame(label, title, caption, body) {
    return `<div class="c-top"><div class="c-mark"><img src="j.svg" alt=""><span>JHOU / LABORATÓRIO DE IDEIAS</span></div><button type="button" data-c-action="reset" class="c-reset">Recomeçar ↺</button></div>
      <div class="c-head"><div><small>${label}</small><h1>${title}</h1><p>${caption}</p></div><span class="c-index">0${{pedra:1,oficina:2,impressoras:3}[type]} / 03</span></div>${body}`;
  }
  function stone() {
    const x = M.summaryStone(s);
    const pieces = s.pieces.length ? s.pieces.map((p,i) => `<li><span><b>${String(i+1).padStart(2,'0')}</b> ${p.quantity} peça(s) · ${p.width} × ${p.depth} cm <small>${p.openings} recorte(s) por peça</small></span><button type="button" data-c-action="remove" data-id="${p.id}" aria-label="Remover peça ${i+1}">×</button></li>`).join('') : '<li class="c-empty">Inclua uma peça para compor o projeto ilustrativo.</li>';
    return frame('ESTUDO DE PROJETO / MARMORARIA', 'Antes da pedra, clareza.', 'Uma leitura inicial de peças, área e recortes. Cálculo ilustrativo, sem plano de corte ou preço.',
      `<div class="c-stone-grid"><section class="c-panel c-entry"><div class="c-section-label">01 / ESPECIFICAÇÃO</div><div class="c-fields"><label>Material ilustrativo<select id="c-material">${M.materials.map(v=>`<option ${s.material===v?'selected':''}>${v}</option>`).join('')}</select></label><label>Acabamento ilustrativo<select id="c-finish">${['Polido','Acetinado','Escovado'].map(v=>`<option ${s.finish===v?'selected':''}>${v}</option>`).join('')}</select></label></div><form id="c-stone-form" novalidate><div class="c-section-label">02 / NOVA PEÇA</div><div class="c-fields c-four"><label>Largura · cm<input name="width" type="number" min="30" max="300" step="1" value="120"></label><label>Profundidade · cm<input name="depth" type="number" min="20" max="180" step="1" value="60"></label><label>Unidades<input name="quantity" type="number" min="1" max="8" step="1" value="1"></label><label>Recortes / peça<input name="openings" type="number" min="0" max="4" step="1" value="1"></label></div><button class="c-primary" type="submit">Adicionar ao estudo <span>↗</span></button></form><div class="c-section-label c-list-label">03 / COMPOSIÇÃO ATUAL</div><ul class="c-pieces">${pieces}</ul></section>
      <aside class="c-panel c-drawing"><span class="c-drawing-tag">ESQUEMA / NÃO É PROJETO EXECUTIVO</span><div class="c-plan"><div class="c-plan-shape"><i></i><span>${s.pieces.length ? s.pieces[0].width+' × '+s.pieces[0].depth+' cm' : 'SUA PEÇA'}</span></div><div class="c-plan-rule">Medições reais e encaixe precisam de conferência.</div></div><div class="c-stat-row"><div><strong>${x.units}</strong><span>peças</span></div><div><strong>${x.area.toFixed(2).replace('.',',')}</strong><span>m² geométricos</span></div><div><strong>${x.openings}</strong><span>recortes</span></div></div><p class="c-footnote">Margem de 12% apenas ilustrativa: <b>${x.gross.toFixed(2).replace('.',',')} m²</b>. Não indica consumo, compra ou aproveitamento real.</p><button class="c-secondary" type="button" data-c-action="export">Gerar briefing de exemplo ↓</button>${report?`<pre class="c-report">${safe(report)}</pre>`:''}</aside></div>`);
  }
  function auto() {
    const x = M.summaryWork(s), stage = s.stage;
    const rows = M.works.map(w => `<button class="c-work" type="button" data-c-action="work" data-id="${w.id}" aria-pressed="${s.selected.includes(w.id)}" ${stage!=='rascunho'?'disabled':''}><span class="c-work-check">${s.selected.includes(w.id)?'✓':'+'}</span><span><strong>${w.name}</strong><small>Mão de obra ${money(w.labor)} · peça ${money(w.part)}</small></span><b>${money(w.labor+w.part)}</b></button>`).join('');
    return frame('ORÇAMENTO DIDÁTICO / OFICINA', 'Uma decisão bem explicada.', 'Escolha serviços, confira o valor fictício e percorra aprovação e conclusão sem contato real.',
      `<div class="c-auto-grid"><section class="c-panel c-auto-board"><div class="c-auto-ribbon"><span>OS / EXEMPLO 204</span><span>${safe(s.customer)}</span></div><div class="c-auto-steps"><span class="${stage==='rascunho'?'on':''}">01 · Montagem</span><span class="${stage==='aprovado'?'on':''}">02 · Aprovação</span><span class="${stage==='concluido'?'on':''}">03 · Concluído</span></div><h2>Componha o serviço</h2><p>Valores inventados para demonstrar a lógica; diagnóstico, peças, impostos e preço real são definidos pela oficina.</p><div class="c-work-list">${rows}</div><div class="c-auto-actions"><button type="button" data-c-action="approve" ${stage!=='rascunho'?'disabled':''}>Aprovar exemplo →</button><button type="button" data-c-action="finish" ${stage!=='aprovado'?'disabled':''}>Concluir OS fictícia →</button></div></section><aside class="c-panel c-receipt"><div class="c-receipt-head"><small>ESPELHO DA OS</small><b>J / 204</b></div><div class="c-receipt-line"><span>Revisão</span><b>v${s.revision}</b></div><div class="c-receipt-line"><span>Serviços</span><b>${x.chosen.length}</b></div><div class="c-receipt-line"><span>Mão de obra fictícia</span><b>${money(x.labor)}</b></div><div class="c-receipt-line"><span>Peças fictícias</span><b>${money(x.parts)}</b></div><div class="c-receipt-total"><span>Total demonstrativo</span><strong>${money(x.total)}</strong></div><div class="c-receipt-state">${stage==='rascunho'?'Aguardando composição e aprovação':stage==='aprovado'?'Aprovação registrada apenas nesta página':'Fluxo fictício concluído'}</div><p>Nenhum orçamento foi solicitado ou enviado. Esta amostra não representa valores ou rotinas da Auto Service.</p></aside></div>`);
  }
  function printers() {
    const t=s.ticket, alerts=s.stock.filter(p=>p.stock<=p.min);
    const stock=s.stock.map(p=>`<div class="c-stock-item"><div><strong>${p.name}</strong><small>mínimo ilustrativo ${p.min} · saldo ${p.stock}</small></div><div class="c-stock-track"><i style="width:${Math.min(100,p.stock*20)}%"></i></div><button type="button" data-c-action="replenish" data-id="${p.id}">+ 2 fictícias</button></div>`).join('');
    return frame('LABORATÓRIO / ESTOQUE DE PEÇAS', 'A peça sai. O estoque responde.', 'Uma OS de impressora movimenta o saldo e sinaliza reposição. Nada conecta ao estoque da empresa.',
      `<div class="c-print-grid"><section class="c-panel c-ticket"><div class="c-ticket-top"><span>OS-204</span><span class="c-ticket-status">${safe(t.stage)}</span></div><div class="c-printer-art" aria-hidden="true"><div class="c-printer-paper"></div><div class="c-printer-body"><i></i></div><div class="c-printer-tray"></div></div><h2>${safe(t.device)}</h2><p>Fluxo ilustrativo: escolher uma peça, registrar uma ação, ver o saldo atualizado e encerrar a OS.</p><form id="c-ticket-form" novalidate><label>Peça para este atendimento<select name="part" ${t.stage!=='triagem'?'disabled':''}><option value="">Selecione</option>${s.stock.map(p=>`<option value="${p.id}" ${t.part===p.id?'selected':''}>${p.name} · ${p.stock} em estoque</option>`).join('')}</select></label><label>Registro fictício<textarea name="note" rows="3" maxlength="160" placeholder="Ex.: Troca ilustrativa após inspeção" ${t.stage!=='triagem'?'disabled':''}>${safe(t.note)}</textarea></label><button class="c-primary" type="submit" ${t.stage!=='triagem'?'disabled':''}>Registrar consumo →</button></form><button class="c-secondary" data-c-action="close" type="button" ${t.stage!=='em teste'?'disabled':''}>Encerrar OS fictícia ✓</button></section>
      <aside class="c-panel c-inventory"><div class="c-section-label">ESTOQUE / SIMULAÇÃO</div><h2>Peças & saldos</h2><div class="c-stock">${stock}</div><div class="c-alert ${alerts.length?'':'calm'}"><strong>${alerts.length?'Atenção a '+alerts.length+' item(ns)':'Saldos acima do mínimo'}</strong><span>${alerts.length?alerts.map(p=>p.name).join(' · '):'Sem alerta na simulação.'}</span></div><div class="c-section-label">MOVIMENTAÇÕES NESTA PÁGINA</div><ol class="c-movements">${s.movements.length?s.movements.map(m=>`<li>${safe(m.action)} · ${safe(m.part)} <b>saldo ${m.balance}</b></li>`).join(''):'<li>Nenhuma movimentação registrada.</li>'}</ol><p class="c-footnote">Dados e limites inventados. Diagnóstico técnico e reposição real exigem conferência.</p></aside></div>`);
  }
  function render() { if (!alive()) return; app.innerHTML = type==='pedra' ? stone() : type==='oficina' ? auto() : printers(); document.getElementById('c-status').textContent=notice; }
  root.addEventListener('change', e => {
    if (!alive()) return;
    try {
      if (e.target.id==='c-material' || e.target.id==='c-finish') {
        M.configureStone(s, document.getElementById('c-material').value, document.getElementById('c-finish').value);
        report=''; render(); setNotice('Especificação atualizada. Gere um novo briefing após compor as peças.');
      }
      if (e.target.name==='part') { M.selectPart(s,e.target.value); setNotice('Peça escolhida para a OS fictícia.'); }
    } catch(err) { setNotice(err.message,true); }
  });
  root.addEventListener('submit', e => {
    if (!alive()) return; e.preventDefault();
    try {
      const d = new FormData(e.target);
      if (e.target.id==='c-stone-form') { M.addPiece(s,Number(d.get('width')),Number(d.get('depth')),Number(d.get('quantity')),Number(d.get('openings'))); report=''; render(); setNotice('Peça adicionada. O resumo de área foi recalculado.'); }
      if (e.target.id==='c-ticket-form') { M.selectPart(s,String(d.get('part'))); M.consumePart(s,String(d.get('note'))); render(); setNotice('Consumo fictício registrado. Veja o novo saldo e o alerta.'); }
    } catch(err) { setNotice(err.message,true); }
  });
  root.addEventListener('click', e => {
    const b=e.target.closest('[data-c-action]'); if (!b || !alive()) return;
    try {
      const action=b.dataset.cAction, id=b.dataset.id;
      if(action==='reset'){s=M.seed(type);report='';}
      if(action==='remove'){M.removePiece(s,Number(id));report='';}
      if(action==='export')report=M.exportStone(s);
      if(action==='work')M.toggleWork(s,id);
      if(action==='approve')M.approveWork(s);
      if(action==='finish')M.finishWork(s);
      if(action==='replenish')M.replenish(s,id,2);
      if(action==='close')M.finishTicket(s);
      render(); setNotice(action==='export'?'Briefing ilustrativo gerado abaixo. Nada foi enviado.':action==='reset'?'Amostra restaurada.':'Ação registrada nesta amostra.');
    } catch(err) { setNotice(err.message,true); }
  });
  document.addEventListener('sample-expired', () => { s=M.seed(type); report=''; app.replaceChildren(); });
  render();
})();
