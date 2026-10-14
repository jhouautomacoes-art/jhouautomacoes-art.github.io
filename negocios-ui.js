'use strict';
(function () {
  const root = document.getElementById('business-demo');
  if (!root || root.hidden || typeof BusinessDemo === 'undefined') return;
  const M = BusinessDemo, type = root.dataset.template;
  let state = M.seed(type), selected = 'EX-18', view = 'home', day = 0, query = '', filter = 'Todos';
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const config = {
    grafica: { title: 'Estúdio de pedidos', eyebrow: 'GRÁFICA / FLUXO DE PRODUÇÃO',
      headline: 'A arte é aprovada. A produção acompanha.',
      description: 'Revise um briefing, prepare uma prova, evite conflito na linha e confira a quantidade final.',
      nav: ['Visão geral', 'Pedidos & provas', 'Agenda de produção', 'Acompanhamento'],
      hint: 'Prepare a prova da EX-18, marque as duas conferências e tente a linha A às 10h no dia 1. Depois escolha 14h e conclua 500 unidades.' },
    locacao: { title: 'Mesa de locações', eyebrow: 'EQUIPAMENTOS / OPERAÇÃO',
      headline: 'Uma reserva. Todo o caminho de volta.',
      description: 'Confira o período, reserve um item livre, registre a saída e acompanhe o retorno ao cadastro.',
      nav: ['Visão geral', 'Solicitações & saída', 'Disponibilidade', 'Acompanhamento'],
      hint: 'Tente reservar EQ-01 do dia 2 ao dia 3. Há conflito. Escolha EQ-04, confira a saída e percorra o retorno até encerrar o exemplo.' },
    recepcao: { title: 'Recepção em movimento', eyebrow: 'AGENDA / ROTINA ADMINISTRATIVA',
      headline: 'O horário muda. A equipe continua alinhada.',
      description: 'Organize solicitações, confira sala e equipe, registre confirmação e chegada no mesmo painel.',
      nav: ['Visão geral', 'Fila & confirmações', 'Agenda de salas', 'Acompanhamento'],
      hint: 'Tente sala A, Equipe Verde, dia 1 às 10h. Há conflito. Escolha 14h, confirme e registre a chegada até encerrar o fluxo administrativo.' }
  }[type];
  function available() { return !root.hidden && typeof active === 'function' && active(); }
  function current() { return M.get(state, selected); }
  function button(action, text, extra) {
    return '<button type="button" data-n-action="' + action + '" class="' + (extra || '') + '">' + text + '</button>';
  }
  function option(values, chosen) {
    return values.map(v => '<option value="' + esc(v[0]) + '"' + (String(v[0]) === String(chosen) ? ' selected' : '') + '>' + esc(v[1]) + '</option>').join('');
  }
  function select(id, label, values, chosen) {
    return '<label for="' + id + '">' + label + '</label><select id="' + id + '">' + option(values, chosen) + '</select>';
  }
  function badge(o) {
    return '<span class="n-badge ' + (o.cancelled ? 'cancelled' : o.stage === M.stages[type].length - 1 ? 'done' : '') + '">' + esc(o.cancelled ? 'Cancelada' : M.stages[type][o.stage]) + '</span>';
  }
  function resourceName(id) {
    return type === 'grafica' ? {A:'Linha A / digital', B:'Linha B / offset'}[id] || 'A definir' :
      type === 'recepcao' ? 'Sala ' + (id || 'a definir') : id || 'A definir';
  }
  function list(items) {
    if (!items.length) return '<p class="n-empty">Nenhum registro corresponde a este filtro.</p>';
    return '<div class="n-records">' + items.map(o => '<button type="button" data-n-select="' + o.id + '" aria-pressed="' + (selected === o.id) + '"><span><small>' + o.id + ' / EXEMPLO</small><strong>' + esc(o.client) + '</strong><em>' +
      esc(type === 'grafica' ? o.product + ' · ' + o.qty + ' un. · v' + o.version : type === 'locacao' ? resourceName(o.resource) + ' · ' + M.days[o.from] + '—' + M.days[o.to] : o.professional + ' · ' + M.days[o.day] + ' · ' + o.slot) +
      '</em></span>' + badge(o) + '<i aria-hidden="true">↗</i></button>').join('') + '</div>';
  }
  function metrics() {
    const n = M.metrics(state);
    return '<div class="n-metrics">' + [[n.pending,'A organizar'],[n.working,'Em andamento'],[n.done,'Encerrados'],[state.items.length,'Registros fictícios']].map(x => '<div><strong>' + x[0] + '</strong><span>' + x[1] + '</span></div>').join('') + '</div>';
  }
  function proof(o) {
    return '<div class="n-proof"><div class="n-registration" aria-hidden="true">+<span>PROVA ILUSTRATIVA / V' + o.version + '</span>+</div><div class="n-proof-paper"><img src="j.svg" alt=""><div><small>JHOU / CONCEITO GRÁFICO</small><strong>Uma ideia<br>ganha forma.</strong><p>' + esc(o.product) + ' · ' + o.qty + ' unidades fictícias</p></div><div class="n-ink-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div><p>Arte gerada nesta demonstração; não representa arquivo ou trabalho da gráfica.</p></div>';
  }
  function home() {
    const illustration = type === 'grafica' ? proof(current()) : type === 'locacao' ?
      '<div class="n-fleet-strip"><span>RESERVA</span><i>→</i><span>SAÍDA</span><i>→</i><span>RETORNO</span><i>→</i><span>CONFERÊNCIA</span></div>' :
      '<div class="n-reception-line"><span>Solicitação</span><span>Horário</span><span>Confirmação</span><span>Chegada</span></div>';
    return metrics() + '<section class="n-hero"><small>' + config.eyebrow + '</small><h2>' + config.headline + '</h2><p>' + config.description + '</p>' + button('guide','Percorrer um exemplo ↗') + '</section>' + illustration +
      '<div class="n-section"><h2>Em foco agora</h2><span>MESMO ESTADO EM TODAS AS TELAS</span></div>' + list(state.items.filter(o => !o.cancelled && o.stage < M.stages[type].length - 1));
  }
  function filtered() {
    return list(state.items.filter(o => (!query || [o.id,o.client,o.product,o.resource].join(' ').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))) &&
      (filter === 'Todos' || (o.cancelled ? 'Cancelada' : M.stages[type][o.stage]) === filter)));
  }
  function board() {
    return '<h2 class="n-view-title">Do primeiro registro ao resultado.</h2><div class="n-filters"><input id="n-search" type="search" aria-label="Buscar registros" placeholder="Buscar registro ou item" value="' + esc(query) + '"><select id="n-filter" aria-label="Filtrar etapa">' +
      option(['Todos',...M.stages[type],...(type === 'recepcao' ? ['Cancelada'] : [])].map(x=>[x,x]),filter) + '</select></div><div id="n-filtered">' + filtered() + '</div>' + (type === 'grafica' ? proof(current()) : '');
  }
  function resources() {
    if (type === 'locacao') return '<h2 class="n-view-title">O período faz parte da disponibilidade.</h2><p class="n-muted">Disponibilidade fictícia do dia 2 ao dia 3. O cadastro em conferência permanece bloqueado.</p><div class="n-equipment-grid">' +
      ['EQ-01','EQ-02','EQ-03','EQ-04'].map((id,i) => {
        const a = M.availability(state,id,1,2);
        return '<article class="n-equipment"><small>' + id + ' / FICTÍCIO</small><div class="n-equipment-art" aria-hidden="true"><span></span><i></i></div><h3>' + ['Ferramenta elétrica','Conjunto hidráulico','Ferramenta em conferência','Kit de apoio'][i] +
          '</h3><b class="' + (a.free?'n-free':'n-blocked') + '">' + (a.free?'Disponível':'Indisponível') + '</b><p>' + esc(a.reason) + '</p></article>';
      }).join('') + '</div><p class="n-muted">Nenhuma recomendação de uso, inspeção técnica ou reserva real.</p>';
    const rows = ['A','B'];
    return '<h2 class="n-view-title">' + (type === 'grafica' ? 'Cada linha, um horário claro.' : 'Sala e equipe no mesmo horário.') + '</h2><div class="n-days">' +
      M.days.map((d,i) => '<button type="button" data-n-day="' + i + '" aria-pressed="' + (day===i) + '">' + d + '</button>').join('') + '</div><div class="n-agenda"><div class="n-agenda-row n-agenda-head"><span></span>' + rows.map(r=>'<strong>'+resourceName(r)+'</strong>').join('') + '</div>' +
      M.slots.map(slot => '<div class="n-agenda-row"><time>'+slot+'</time>'+rows.map(r => {
        const o = state.items.find(o => !o.cancelled && o.resource===r && o.day===day && o.slot===slot && (type==='grafica'?o.stage===2:[1,2,3].includes(o.stage)));
        return o ? '<button type="button" data-n-select="'+o.id+'"><b>'+o.id+'</b><span>'+esc(type==='grafica'?o.product:o.professional)+'</span></button>' : '<span class="n-open-slot">Livre</span>';
      }).join('')+'</div>').join('') + '</div><p class="n-muted">Horários e duração de 60min apenas ilustrativos; nenhum atendimento ou produção foi marcado.</p>';
  }
  function client() {
    const o = current();
    return '<div class="n-client-view"><small>ACOMPANHAMENTO / SEM LOGIN REAL</small><h2>Um registro claro.<br>Uma etapa de cada vez.</h2><p>Veja as mudanças realizadas nesta mesma amostra.</p>' +
      select('n-client-select','Registro de exemplo',state.items.map(x=>[x.id,x.id+' / '+x.client]),selected) +
      '<article class="n-client-card">' + badge(o) + '<h3>'+esc(o.client)+'</h3><p>'+esc(type==='grafica'?o.product+' · '+o.qty+' unidades':resourceName(o.resource))+'</p><ol class="n-log">' + o.log.map(x=>'<li>'+esc(x)+'</li>').join('') + '</ol>' +
      (o.stage===M.stages[type].length-1 && !o.cancelled ? button('report','Baixar resumo de exemplo ↓') : '<p class="n-muted">O resumo ficará disponível após encerrar este fluxo.</p>') + '</article></div>';
  }
  function checkboxes(labels, o) {
    return '<div class="n-checks">'+labels.map((x,i)=>'<label><input type="checkbox" data-n-check="'+i+'"'+(o.checks.includes(i)?' checked':'')+'><span>'+x+'</span></label>').join('')+'</div>';
  }
  function schedule(o, reception) {
    return '<div class="n-fields">' + select('n-resource',reception?'Sala de exemplo':'Linha de exemplo',[['','Escolher'],['A',resourceName('A')],['B',resourceName('B')]],o.resource) +
      (reception?select('n-professional','Equipe de exemplo',['Equipe Verde','Equipe Oliva'].map(x=>[x,x]),o.professional):'') +
      select('n-day','Dia',M.days.map((x,i)=>[i,x]),o.day) + select('n-slot','Horário',M.slots.map(x=>[x,x]),o.slot) + '</div>';
  }
  function graphicControls(o) {
    if (o.stage < 2) return '<div class="n-fields">' + select('n-product','Produto fictício',['Flyer A5','Cartão de visita','Adesivo','Folder'].map(x=>[x,x]),o.product) +
      '<label for="n-qty">Quantidade</label><input id="n-qty" type="number" min="1" max="10000" value="'+o.qty+'"></div>' + button('revise','Salvar briefing e invalidar prova','n-secondary') +
      (o.stage===0 ? button('proof','Preparar prova de exemplo →','n-wide') : '<div class="n-version">PROVA V'+o.proofVersion+' / BRIEFING V'+o.version+'</div>'+checkboxes(['Arquivo de exemplo conferido','Aprovação do exemplo registrada'],o)+schedule(o,false)+button('print','Aprovar e iniciar produção →','n-wide'));
    return o.stage===2 ? '<label for="n-produced">Unidades conferidas no exemplo</label><input id="n-produced" type="number" min="1" max="10000" value="0">'+button('finish-print','Conferir e concluir pedido →','n-wide') : '<div class="n-completion">✓ '+o.produced+' unidades conferidas</div>'+button('report','Baixar resumo de produção ↓','n-wide');
  }
  function rentalControls(o) {
    if (o.stage===0) return '<div class="n-fields">'+select('n-resource','Equipamento fictício',['EQ-01','EQ-02','EQ-03','EQ-04'].map(x=>[x,x]),o.resource||'EQ-01') +
      select('n-from','Do dia',M.days.map((x,i)=>[i,x]),o.from)+select('n-to','Até o dia',M.days.map((x,i)=>[i,x]),o.to)+'</div><p id="n-availability" class="n-muted">Confira a disponibilidade do período antes de reservar.</p>'+button('reserve-asset','Conferir e reservar exemplo →','n-wide');
    if (o.stage===1) return checkboxes(['Código de exemplo conferido','Registro de saída preparado'],o)+button('dispatch','Registrar saída fictícia →','n-wide');
    if (o.stage===2) return checkboxes(['Código de retorno conferido','Observação administrativa preparada'],o)+'<label for="n-note">Observação fictícia</label><textarea id="n-note" maxlength="400" placeholder="Ex.: retorno registrado; cadastro aguardando conferência.">'+esc(o.note)+'</textarea>'+button('return','Registrar retorno →','n-wide');
    if (o.stage===3) return '<p class="n-muted">Cadastro indisponível durante a conferência administrativa; sem avaliação técnica de segurança.</p>'+checkboxes(['Registro de retorno conferido','Encerramento administrativo preparado'],o)+button('release','Encerrar conferência de exemplo →','n-wide');
    return '<div class="n-completion">✓ Ciclo administrativo encerrado</div>'+button('report','Baixar resumo da locação ↓','n-wide');
  }
  function receptionControls(o) {
    if (o.cancelled) return '<div class="n-completion">Reserva cancelada; histórico preservado.</div>';
    if (o.stage===0) return schedule(o,true)+button('reserve-slot','Reservar horário fictício →','n-wide');
    if (o.stage<4) return '<div class="n-assigned">'+esc(resourceName(o.resource)+' · '+o.professional)+'<br>'+esc(M.days[o.day]+' / '+o.slot)+'</div>'+
      button('next',['','Registrar confirmação →','Registrar chegada →','Encerrar fluxo administrativo →'][o.stage],'n-wide')+
      (o.stage<3?button('cancel','Cancelar reserva de exemplo','n-secondary'):'')+'<p class="n-muted">Sem dados de pacientes, prontuário, decisão clínica ou mensagem automática.</p>';
    return '<div class="n-completion">✓ Recepção encerrada na amostra</div>'+button('report','Baixar resumo administrativo ↓','n-wide');
  }
  function detail() {
    const o=current();
    return '<small class="n-kicker">'+o.id+' / EM FOCO</small>'+badge(o)+'<h2>'+esc(o.client)+'</h2><div class="n-step-track">'+M.stages[type].map((x,i)=>'<span class="'+(i<=o.stage&&!o.cancelled?'filled':'')+'" title="'+esc(x)+'"></span>').join('')+'</div><p class="n-stage-label">'+esc(o.cancelled?'Cancelada':M.stages[type][o.stage])+'</p>'+
      ({grafica:graphicControls,locacao:rentalControls,recepcao:receptionControls}[type])(o)+'<p id="n-error" class="n-error" role="alert"></p><div class="n-section"><h3>Histórico conectado</h3></div><ol class="n-log">'+o.log.slice(-4).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>';
  }
  function render() {
    if (!available()) return;
    $('n-app-title').textContent=config.title;
    $('n-heading').textContent=config.nav[['home','board','resources','client'].indexOf(view)];
    $('n-nav').innerHTML=['home','board','resources','client'].map((v,i)=>'<button type="button" data-n-view="'+v+'" aria-current="'+(view===v?'page':'false')+'"><span>0'+(i+1)+'</span>'+config.nav[i]+'</button>').join('');
    $('n-content').innerHTML=({home,board,resources,client}[view])();
    $('n-detail').innerHTML=detail();
  }
  function feedback(text) { $('n-status').textContent=text; }
  function action(name) {
    if (!available()) return;
    try {
      if (name==='guide') { selected='EX-18';view='board';render();feedback(config.hint);$('n-heading').focus();return; }
      if (name==='reset') { state=M.seed(type);selected='EX-18';view='home';query='';filter='Todos';day=0;render();feedback('Amostra restaurada. Todos os dados são fictícios.');return; }
      if (name==='revise') M.revise(state,selected,Number($('n-qty').value),$('n-product').value);
      if (name==='proof') M.prepareProof(state,selected);
      if (name==='print') M.startPrint(state,selected,$('n-resource').value,Number($('n-day').value),$('n-slot').value);
      if (name==='finish-print') M.finishPrint(state,selected,Number($('n-produced').value));
      if (name==='reserve-asset') M.reserveAsset(state,selected,$('n-resource').value,Number($('n-from').value),Number($('n-to').value));
      if (name==='dispatch') M.dispatch(state,selected);
      if (name==='return') M.returnAsset(state,selected,$('n-note').value);
      if (name==='release') M.release(state,selected);
      if (name==='reserve-slot') M.reserveSlot(state,selected,$('n-resource').value,$('n-professional').value,Number($('n-day').value),$('n-slot').value);
      if (name==='next') M.nextReception(state,selected);
      if (name==='cancel') M.cancelSlot(state,selected);
      if (name==='report') {
        const content=M.report(state,selected),url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));
        const a=document.createElement('a');a.href=url;a.download=selected+'-'+type+'-demonstrativo.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        feedback('Resumo fictício baixado. Nada foi enviado ou executado em um negócio.');return;
      }
      render();feedback('Etapa atualizada nesta amostra. Indicadores e acompanhamento refletem o mesmo registro.');$('n-status').focus();
    } catch(error) { $('n-error').textContent=error.message; }
  }
  root.addEventListener('click',e=>{
    if (!available()) return;
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.nView){view=b.dataset.nView;render();$('n-heading').focus();}
    else if(b.dataset.nSelect){selected=b.dataset.nSelect;render();if(innerWidth<760)$('n-detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    else if(b.dataset.nDay!==undefined){day=Number(b.dataset.nDay);render();}
    else if(b.dataset.nAction)action(b.dataset.nAction);
  });
  root.addEventListener('input',e=>{
    if (!available()) return;
    if(e.target.id==='n-search'){query=e.target.value;$('n-filtered').innerHTML=filtered();}
    if(e.target.id==='n-note')current().note=e.target.value;
  });
  root.addEventListener('change',e=>{
    if (!available()) return;
    if(e.target.id==='n-filter'){filter=e.target.value;$('n-filtered').innerHTML=filtered();}
    if(e.target.id==='n-client-select'){selected=e.target.value;render();}
    if(e.target.dataset.nCheck!==undefined)M.mark(state,selected,Number(e.target.dataset.nCheck),e.target.checked);
    if(type==='locacao'&&current().stage===0&&['n-resource','n-from','n-to'].includes(e.target.id)){
      try{$('n-availability').textContent=M.availability(state,$('n-resource').value,Number($('n-from').value),Number($('n-to').value),selected).reason;}
      catch(error){$('n-availability').textContent=error.message;}
    }
  });
  document.addEventListener('sample-expired',()=>{state.items=[];$('n-content').replaceChildren();$('n-detail').replaceChildren();$('n-nav').replaceChildren();feedback('');});
  render();
})();
