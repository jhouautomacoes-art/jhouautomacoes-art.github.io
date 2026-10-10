(() => {
  'use strict';
  const rail = document.querySelector('#work-grid');
  if (!rail) return;
  const slides = [...rail.querySelectorAll('.solution-slide')];
  const sectors = [...document.querySelectorAll('[data-gallery-target]')];
  const hosts = Object.fromEntries([...document.querySelectorAll('[data-demo]')].map(e => [e.dataset.demo, e]));
  const defaults = {
    food: {lane:0,added:false,orders:[{id:'042',title:'2 xis salada',detail:'Retirada · sem cebola',stage:0},{id:'043',title:'Pizza média',detail:'Entrega · bairro fictício',stage:1},{id:'044',title:'1 à la minuta',detail:'Salão · mesa 04',stage:2}]},
    clinic: {filled:false,selected:'15:00'},
    garage: {step:0},
    stock: {days:7,planned:false},
    docs: {selected:1,reviewed:false,tab:'review'},
    android: {checks:[true,false,false],closed:false,synced:false}
  };
  let data = structuredClone(defaults), current = 0, drag = null;
  const money = n => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const button = (action,label,extra='') => `<button type="button" class="concept-action" data-action="${action}" ${extra}>${label}</button>`;
  const head = (title,meta) => `<div class="concept-top"><span><img src="jhou-mark.ico" alt="">${title}</span><small>${meta}</small></div>`;
  const footer = (key,message) => `<div class="concept-footer"><span role="status" aria-live="polite">${message}</span><button type="button" data-reset="${key}">Restaurar ↺</button></div>`;
  const shell = (title,meta,body,key,message) => `<div class="concept-window">${head(title,meta)}<div class="concept-body">${body}</div>${footer(key,message)}</div>`;
  const heading = (eyebrow,title,aside='') => `<div class="concept-heading"><div><small>${eyebrow}</small><h4>${title}</h4></div>${aside}</div>`;

  function food(message='Um pedido percorre as três etapas.') {
    const s=data.food,stages=['Entrada','Cozinha','Retirada'];
    const counts=stages.map((_,i)=>s.orders.filter(o=>o.stage===i).length);
    const board=stages.map((name,i)=>`<section class="kitchen-lane${s.lane===i?' lane-active':''}"><h5><i></i>${name}<span>${counts[i]}</span></h5>${s.orders.filter(o=>o.stage===i).map(o=>`<div class="kitchen-ticket"><div class="ticket-id">#${o.id}<span>${i===2?'PRONTO':i===1?'EM PREPARO':'NOVO'}</span></div><strong>${o.title}</strong><p>${o.detail}</p><div class="ticket-note">${o.id==='042'?'Observação destacada na cozinha':o.id==='045'?'Pedido incluído nesta demonstração':'Balcão e cozinha veem a mesma etapa'}</div>${i<2?button('food-advance',i===0?'Preparar →':'Pronto para sair ✓',`data-order="${o.id}"`):'<span class="ticket-ready">✓ Pode chamar no balcão</span>'}</div>`).join('')||'<div class="lane-empty">Nenhum pedido nesta etapa.</div>'}</section>`).join('');
    hosts.food.innerHTML=shell('Balcão + cozinha','SEX · 19:40 / EXEMPLO',heading('HORÁRIO DE PICO','Cada pedido encontra seu lugar.',button('food-add',s.added?'Pedido simulado ✓':'+ Simular pedido',s.added?'disabled':''))+`<div class="lane-tabs" role="group" aria-label="Etapa da cozinha">${stages.map((n,i)=>`<button type="button" data-action="food-lane" data-lane="${i}" aria-pressed="${s.lane===i}">${n} <b>${counts[i]}</b></button>`).join('')}</div><div class="kitchen-board">${board}</div>`,'food',message);
  }

  function clinic(message='O encaixe fica reservado só neste exemplo.') {
    const s=data.clinic;
    hosts.clinic.innerHTML=shell('Agenda com encaixes','RECEPÇÃO / EXEMPLO',heading('CANCELAMENTO À TARDE','Um horário livre, uma alternativa.')+`<div class="day-strip"><span>Seg<small>12</small></span><span>Ter<small>13</small></span><span class="day-active">Qua<small>14</small></span><span>Qui<small>15</small></span><span>Sex<small>16</small></span></div><div class="appointment-list"><div><time>14:00</time><span>Atendimento 08<small>Confirmado</small></span><b class="status-dot">●</b></div><div class="vacancy ${s.filled?'vacancy-filled':''}"><time>15:00</time><span>${s.filled?'Encaixe reservado':'Horário disponível'}<small>${s.filled?'Solicitação 12 · confirmação pendente':'Cancelamento registrado pela recepção'}</small></span><b>${s.filled?'✓':'↗'}</b></div><div><time>16:00</time><span>Atendimento 10<small>Confirmado</small></span><b class="status-dot">●</b></div></div><div class="waitlist-card"><div><small>LISTA DE ESPERA</small><strong>Solicitação 12</strong><p>Preferência: quarta à tarde · aceita encaixe</p></div>${button('clinic-fill',s.filled?'Reservado ✓':'Reservar 15:00',s.filled?'disabled':'')}</div><div class="quiet-note">A recepção revisa e confirma. Sem mensagem automática.</div>`,'clinic',message);
  }

  function garage(message='Acompanhe a passagem do orçamento ao serviço.') {
    const s=data.garage,stages=['Orçamento','Aprovado','Em serviço','Concluído'];
    hosts.garage.innerHTML=shell('Orçamento & serviço','OS 041 / EXEMPLO',heading('O CLIENTE ENTENDE O QUE SERÁ FEITO','Antes de começar, tudo à vista.')+`<div class="service-timeline">${stages.map((n,i)=>`<span class="${i<=s.step?'step-done':''}"><b>${i<s.step?'✓':String(i+1).padStart(2,'0')}</b>${n}</span>`).join('')}</div><div class="quote-sheet"><div class="quote-title"><strong>Revisão de exemplo</strong><span>ORÇAMENTO ILUSTRATIVO</span></div><div><span>Peça de reposição</span><b>${money(180)}</b></div><div><span>Mão de obra</span><b>${money(120)}</b></div><div class="quote-total"><span>Total para conferência</span><b>${money(300)}</b></div></div><div class="service-context"><i>${s.step===0?'?':'✓'}</i><p><strong>${['Aguardando decisão','Aprovação registrada','Serviço em andamento','Registro de entrega pronto'][s.step]}</strong><span>${['Itens e valor visíveis antes da autorização.','Escopo aprovado; próxima etapa é iniciar o serviço.','A etapa fica disponível para acompanhamento.','Resumo das etapas reunido no histórico da ordem.'][s.step]}</span></p></div>${s.step<3?button('garage-next',['Aprovar exemplo →','Iniciar serviço →','Concluir serviço ✓'][s.step]):'<div class="completion-note">✓ Histórico completo nesta demonstração</div>'}`,'garage',message);
  }

  const products=[{name:'Arroz 5 kg',sku:'021',stock:8,weekly:14,lead:2,price:18},{name:'Leite 1 L',sku:'022',stock:12,weekly:28,lead:1,price:4.8},{name:'Sabão 500 g',sku:'023',stock:20,weekly:7,lead:3,price:6}];
  const quantity=(p,days)=>Math.max(0,Math.ceil(p.weekly/7*(days+p.lead)-p.stock));
  function stock(message='Saída e prazo do fornecedor orientam a lista.') {
    const s=data.stock,quantities=products.map(p=>quantity(p,s.days)),total=products.reduce((sum,p,i)=>sum+quantities[i]*p.price,0);
    hosts.stock.innerHTML=shell('Reposição com contexto','LOJA / EXEMPLO',heading('A COMPRA COMEÇA NA SAÍDA DOS PRODUTOS','Quanto precisa repor?')+`<div class="coverage-selector"><span>Planejar para</span><div role="group" aria-label="Cobertura do estoque">${[7,14].map(n=>`<button type="button" data-action="stock-days" data-days="${n}" aria-pressed="${s.days===n}">${n} dias</button>`).join('')}</div></div><div class="purchase-table"><div class="purchase-labels"><span>Produto</span><span>Em estoque</span><span>Sugestão</span></div>${products.map((p,i)=>`<div class="purchase-row"><span><strong>${p.name}</strong><small>${p.weekly} saídas/semana · entrega ${p.lead}d</small></span><b>${p.stock}<small>un.</small></b><b class="recommended">${quantities[i]}<small>un.</small></b></div>`).join('')}</div><div class="purchase-summary"><span>${s.planned?'LISTA MONTADA':'VALOR ILUSTRATIVO DA REPOSIÇÃO'}<strong>${money(total)}</strong><small>${s.planned?quantities.reduce((a,b)=>a+b,0)+' unidades para revisar':'Com base nos preços fictícios do exemplo'}</small></span>${button('stock-plan',s.planned?'Lista pronta ✓':'Montar lista →',s.planned?'disabled':'')}</div><div class="quiet-note">Cálculo demonstrativo: saída média × (cobertura + prazo de entrega) − estoque.</div>`,'stock',message);
  }

  const documents=[{ref:'DOC-028',file:'proposta-028.pdf',total:'R$ 840,00',date:'15/10/2026',source:'Validade desta proposta: 15/10/2026.'},{ref:'DOC-029',file:'proposta-029.pdf',total:'R$ 1.250,00',date:'A conferir',source:'Validade: quinze de outubro de 2026.'},{ref:'DOC-030',file:'proposta-030.pdf',total:'R$ 460,00',date:'20/10/2026',source:'Validade desta proposta: 20/10/2026.'}];
  function docs(message='Confira a origem do campo antes de liberar a tabela.') {
    const s=data.docs,d=documents[s.selected],pending=s.selected===1&&!s.reviewed;
    const finalDate=s.selected===1&&s.reviewed?'15/10/2026':d.date;
    const body=heading('LOTE DE DOCUMENTOS','Da página para uma base conferida.',`<span class="audit-count">${s.reviewed?'3 conferidos':'1 pendência'}</span>`)+`<div class="document-tabs" role="group" aria-label="Visualização do lote"><button type="button" data-action="docs-tab" data-tab="review" aria-pressed="${s.tab==='review'}">Conferir campos</button><button type="button" data-action="docs-tab" data-tab="table" aria-pressed="${s.tab==='table'}">Ver tabela</button></div>`+(s.tab==='review'?`<div class="batch-tabs" role="group" aria-label="Documento do lote">${documents.map((r,i)=>`<button type="button" data-action="docs-select" data-document="${i}" aria-pressed="${s.selected===i}">${r.ref}<i>${i===1&&!s.reviewed?'!':'✓'}</i></button>`).join('')}</div><div class="source-paper"><div><span>PROPOSTA COMERCIAL</span><small>página 01 · documento fictício</small></div><strong>${d.ref}</strong><p>Valor do serviço: ${d.total}.</p><mark>${d.source}</mark><span class="source-reference">↑ Trecho de origem do campo selecionado</span></div><div class="review-field"><div><small>VALIDADE IDENTIFICADA</small><strong>${finalDate}</strong></div>${pending?button('docs-review','Conferir 15/10 ✓'):'<span class="checked-field">✓ Conferido</span>'}</div>`:`<div class="export-preview"><div class="export-header"><span>base-conferida.csv</span><small>${s.reviewed?'PRONTA PARA REVISÃO FINAL':'1 CAMPO A CONFERIR'}</small></div><table><thead><tr><th>Referência</th><th>Valor</th><th>Validade</th></tr></thead><tbody>${documents.map((r,i)=>`<tr><td>${r.ref}</td><td>${r.total}</td><td class="${i===1&&!s.reviewed?'cell-pending':''}">${i===1&&s.reviewed?'15/10/2026':r.date}</td></tr>`).join('')}</tbody></table><p>${s.reviewed?'✓ Todos os campos do exemplo foram conferidos.':'Volte à conferência para revisar o DOC-029.'}</p></div>`);
    hosts.docs.innerHTML=shell('Documentos → dados','3 ARQUIVOS / EXEMPLO',body,'docs',message);
  }

  function android(message='O registro fica na fila deste exemplo.') {
    const s=data.android,done=s.checks.filter(Boolean).length,tasks=['Equipamento identificado','Itens de funcionamento conferidos','Observações da visita registradas'];
    hosts.android.innerHTML=`<div class="field-preview"><div class="field-phone"><div class="phone-sensor" aria-hidden="true"></div><div class="field-app"><img src="jhou-mark.ico" alt=""><span>Minha visita</span><small>${s.synced?'SINCRONIZADO':'MODO SEM REDE'}</small></div><div class="visit-title"><small>VISITA 018 / DEMONSTRAÇÃO</small><h4>O trabalho termina.<br>O registro fica.</h4><p>Manutenção · local de exemplo</p></div><div class="visit-progress"><span>Checklist</span><b>${done} / 3</b><i style="--progress:${done/3*100}%"></i></div><div class="field-checks">${tasks.map((t,i)=>`<label class="${s.checks[i]?'task-done':''}"><input type="checkbox" data-field-check="${i}" ${s.checks[i]?'checked':''} ${s.closed?'disabled':''}><span>${t}</span></label>`).join('')}</div>${button('android-close',s.closed?'Visita registrada ✓':'Concluir visita →',done<3||s.closed?'disabled':'')}<div class="phone-sync"><span>${s.closed&&!s.synced?'1 registro na fila local':s.synced?'✓ Registro sincronizado':'Preencha o checklist para concluir'}</span>${s.closed&&!s.synced?button('android-sync','Sincronizar exemplo ↗'):''}</div>${footer('android',message)}</div><div class="field-desk"><small>NO PAINEL DO ESCRITÓRIO</small><strong>Uma visita,<br>um registro completo.</strong><div class="field-sync-line"><i class="${s.synced?'sync-ready':''}"></i><span>${s.synced?'Recebido no exemplo':'Aguardando sincronização'}</span></div><p>Checklist e observações reunidos para acompanhar o que foi feito.</p></div></div>`;
  }

  const renders={food,clinic,garage,stock,docs,android};
  Object.values(renders).forEach(render=>render());
  rail.addEventListener('click',event=>{
    const control=event.target.closest('button');if(!control)return;
    const key=control.closest('[data-demo]')?.dataset.demo;if(!key)return;
    let message='',focusSelector='';
    if(control.dataset.reset){data[key]=structuredClone(defaults[key]);message='Exemplo restaurado.';}
    else switch(control.dataset.action){
      case 'food-add':if(!data.food.added){data.food.orders.push({id:'045',title:'1 xis frango',detail:'Retirada · sem tomate',stage:0});data.food.added=true;data.food.lane=0;message='Pedido #045 entrou na fila.';}break;
      case 'food-lane':data.food.lane=Number(control.dataset.lane);focusSelector=`[data-action="food-lane"][data-lane="${data.food.lane}"]`;break;
      case 'food-advance':{const order=data.food.orders.find(o=>o.id===control.dataset.order);if(order){order.stage=Math.min(2,order.stage+1);data.food.lane=order.stage;message=`Pedido #${order.id} avançou para ${['Entrada','Cozinha','Retirada'][order.stage]}.`;focusSelector=`[data-order="${order.id}"]`;}}break;
      case 'clinic-fill':data.clinic.filled=true;message='15:00 reservado para Solicitação 12; falta confirmar.';break;
      case 'garage-next':data.garage.step=Math.min(3,data.garage.step+1);message=['','Orçamento aprovado no exemplo.','Serviço iniciado no exemplo.','Serviço concluído no exemplo.'][data.garage.step];focusSelector='[data-action="garage-next"]';break;
      case 'stock-days':data.stock.days=Number(control.dataset.days);data.stock.planned=false;message=`Sugestão recalculada para ${data.stock.days} dias.`;focusSelector=`[data-days="${data.stock.days}"]`;break;
      case 'stock-plan':data.stock.planned=true;message='Lista demonstrativa pronta para conferência.';break;
      case 'docs-select':data.docs.selected=Number(control.dataset.document);focusSelector=`[data-document="${data.docs.selected}"]`;break;
      case 'docs-tab':data.docs.tab=control.dataset.tab;focusSelector=`[data-tab="${data.docs.tab}"]`;break;
      case 'docs-review':data.docs.reviewed=true;message='Validade conferida com o trecho do DOC-029.';break;
      case 'android-close':if(data.android.checks.every(Boolean)){data.android.closed=true;message='Visita 018 registrada na fila do exemplo.';focusSelector='[data-action="android-sync"]';}break;
      case 'android-sync':data.android.synced=true;message='Registro recebido no painel demonstrativo.';break;
      default:return;
    }
    renders[key](message||undefined);
    const focus=focusSelector&&hosts[key].querySelector(focusSelector);
    (focus&&!focus.disabled?focus:hosts[key].querySelector('[data-reset]')).focus({preventScroll:true});
  });
  rail.addEventListener('change',event=>{
    if(event.target.dataset.fieldCheck===undefined||data.android.closed)return;
    const i=Number(event.target.dataset.fieldCheck);data.android.checks[i]=event.target.checked;android('Checklist atualizado no exemplo.');hosts.android.querySelector(`[data-field-check="${i}"]`).focus({preventScroll:true});
  });

  const previous=document.querySelector('#gallery-prev'),next=document.querySelector('#gallery-next');
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update(){current=slides.reduce((best,slide,index)=>Math.abs(slide.offsetLeft-rail.scrollLeft)<Math.abs(slides[best].offsetLeft-rail.scrollLeft)?index:best,0);slides.forEach((slide,index)=>slide.inert=index!==current);rail.style.height=`${slides[current].offsetHeight+16}px`;if(rail.scrollTop)rail.scrollTop=0;sectors.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.galleryTarget===slides[current].dataset.key)));document.querySelector('#gallery-position').textContent=`${String(current+1).padStart(2,'0')} / 06`;document.querySelector('#gallery-current').textContent=slides[current].dataset.title;document.querySelector('.rail-progress i').style.width=`${(current+1)/6*100}%`;previous.disabled=current===0;next.disabled=current===slides.length-1;}
  function go(index){const target=slides[Math.max(0,Math.min(slides.length-1,index))];rail.scrollTo({left:target.offsetLeft,behavior:reduced()?'auto':'smooth'});}
  previous.addEventListener('click',()=>go(current-1));next.addEventListener('click',()=>go(current+1));
  sectors.forEach(b=>b.addEventListener('click',()=>go(slides.findIndex(s=>s.dataset.key===b.dataset.galleryTarget))));
  rail.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',()=>{go(current);update();});
  rail.addEventListener('keydown',event=>{if(event.target!==rail)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();go(current+(event.key==='ArrowRight'?1:-1));}else if(event.key==='Home'||event.key==='End'){event.preventDefault();go(event.key==='Home'?0:slides.length-1);}});
  rail.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.button!==0||event.target.closest('button,a,input,label'))return;drag={id:event.pointerId,x:event.clientX,left:rail.scrollLeft,moved:false};});
  rail.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const delta=event.clientX-drag.x;if(!drag.moved&&Math.abs(delta)>8){drag.moved=true;rail.classList.add('is-dragging');rail.setPointerCapture(event.pointerId);}if(drag.moved){event.preventDefault();rail.scrollLeft=drag.left-delta;}});
  function finish(event){if(!drag||event.pointerId!==drag.id)return;const moved=drag.moved;drag=null;rail.classList.remove('is-dragging');if(rail.hasPointerCapture(event.pointerId))rail.releasePointerCapture(event.pointerId);if(moved){update();go(current);}}
  rail.addEventListener('pointerup',finish);rail.addEventListener('pointercancel',finish);rail.addEventListener('pointerleave',()=>{if(drag&&!drag.moved)drag=null;});rail.addEventListener('dragstart',event=>event.preventDefault());
  const resizeObserver=new ResizeObserver(update);slides.forEach(slide=>resizeObserver.observe(slide));
  update();
})();
