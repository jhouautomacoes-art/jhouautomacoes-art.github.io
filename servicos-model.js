/* Regras próprias da demonstração. Nenhum dado real, rede ou persistência. */
(function (root) {
  'use strict';
  const technicians = ['Equipe Verde', 'Equipe Oliva', 'Equipe Areia'];
  const slots = ['08:00', '10:00', '13:00', '15:00'];
  const days = ['Hoje', 'Amanhã', 'Sexta'];
  const checks = ['Registro do atendimento', 'Atividades documentadas', 'Observações conferidas'];
  function seed() {
    return [
      {id: 'OS-1042', client: 'Espaço Horizonte', zone: 'Zona Norte', asset: 'SPL-018', equipment: 'Split · sala 02', type: 'Preventiva', status: 'Aberta', priority: 'Alta', day: 'Hoje', slot: '10:00', tech: '', checked: [], note: '', events: ['Chamado de exemplo recebido']},
      {id: 'OS-1041', client: 'Galeria Aurora', zone: 'Centro', asset: 'VRF-004', equipment: 'VRF · loja 01', type: 'Corretiva', status: 'Agendada', priority: 'Alta', day: 'Hoje', slot: '10:00', tech: 'Equipe Verde', checked: [], note: '', events: ['Visita de exemplo agendada']},
      {id: 'OS-1040', client: 'Estúdio Jardim', zone: 'Zona Sul', asset: 'SPL-031', equipment: 'Split · recepção', type: 'Preventiva', status: 'Em visita', priority: 'Normal', day: 'Hoje', slot: '08:00', tech: 'Equipe Oliva', checked: [0], note: '', events: ['Visita de exemplo iniciada']},
      {id: 'OS-1039', client: 'Oficina do Parque', zone: 'Zona Norte', asset: 'EXA-012', equipment: 'Exaustor · setor A', type: 'Inspeção', status: 'Agendada', priority: 'Normal', day: 'Hoje', slot: '13:00', tech: 'Equipe Verde', checked: [], note: '', events: ['Visita de exemplo agendada']},
      {id: 'OS-1038', client: 'Espaço Horizonte', zone: 'Zona Norte', asset: 'SPL-019', equipment: 'Split · sala 03', type: 'Preventiva', status: 'Concluída', priority: 'Normal', day: 'Hoje', slot: '08:00', tech: 'Equipe Areia', checked: [0,1,2], note: 'Registro fictício: visita finalizada e próxima avaliação a combinar.', events: ['Visita registrada', 'Atividades documentadas', 'Relatório de exemplo concluído']},
      {id: 'OS-1037', client: 'Galeria Aurora', zone: 'Centro', asset: 'VENT-007', equipment: 'Ventilação · área comum', type: 'Preventiva', status: 'Agendada', priority: 'Normal', day: 'Amanhã', slot: '10:00', tech: 'Equipe Oliva', checked: [], note: '', events: ['Visita de exemplo agendada']}
    ];
  }
  function get(state, id) { const item=state.find(x=>x.id===id); if(!item) throw Error('Ordem não encontrada.'); return item; }
  function assign(state,id,tech,day,slot) {
    const o=get(state,id);
    if(o.status==='Concluída'||o.status==='Em visita') throw Error('Esta etapa não permite reagendar.');
    if(!technicians.includes(tech)||!days.includes(day)||!slots.includes(slot)) throw Error('Escolha uma equipe, um dia e um horário.');
    if(state.some(x=>x.id!==id&&x.tech===tech&&x.day===day&&x.slot===slot&&x.status!=='Concluída')) throw Error('Conflito: essa equipe já tem uma visita neste horário.');
    Object.assign(o,{tech,day,slot,status:'Agendada'}); o.events.push('Visita agendada · '+tech+' · '+day+' '+slot); return o;
  }
  function start(state,id) {const o=get(state,id); if(o.status!=='Agendada'||!o.tech)throw Error('Agende a visita antes de iniciar.'); o.status='Em visita';o.events.push('Visita iniciada');return o;}
  function check(state,id,index,enabled) {const o=get(state,id);if(o.status!=='Em visita'||!Number.isInteger(index)||index<0||index>=checks.length)throw Error('Checklist disponível durante a visita.');o.checked=o.checked.filter(x=>x!==index);if(enabled)o.checked.push(index);return o;}
  function complete(state,id,note) {const o=get(state,id);if(o.status!=='Em visita'||o.checked.length!==checks.length)throw Error('Conclua os três registros antes de finalizar.');if(typeof note!=='string'||note.trim().length<10||note.length>400)throw Error('Registre uma observação entre 10 e 400 caracteres.');o.note=note.trim();o.status='Concluída';o.events.push('Atendimento concluído · relatório disponível');return o;}
  function metrics(state) {return {open:state.filter(x=>x.status==='Aberta').length,scheduled:state.filter(x=>x.status==='Agendada').length,visiting:state.filter(x=>x.status==='Em visita').length,done:state.filter(x=>x.status==='Concluída').length};}
  function report(state,id) {const o=get(state,id);if(o.status!=='Concluída')throw Error('Finalize o atendimento para gerar o relatório.');return ['RELATÓRIO DEMONSTRATIVO — DADOS FICTÍCIOS',o.id+' · '+o.client,o.equipment+' · '+o.asset,'Equipe: '+o.tech,'Visita: '+o.day+' às '+o.slot,'Registros: '+checks.join('; '),'Observação: '+o.note,'Histórico:',...o.events.map(x=>'• '+x),'Exemplo Jhou Automações. Sem validade técnica, laudo ou certificação.'].join('\n');}
  const api={seed,technicians,slots,days,checks,get,assign,start,check,complete,metrics,report};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ServiceDemo=api;
})(typeof window!=='undefined'?window:globalThis);
