'use strict';
(function (host) {
  const types = ['grafica', 'locacao', 'recepcao'];
  const stages = {
    grafica: ['Briefing', 'Prova preparada', 'Em produção', 'Pronto'],
    locacao: ['Solicitada', 'Reservada', 'Em locação', 'Em conferência', 'Encerrada'],
    recepcao: ['Na fila', 'Horário reservado', 'Confirmada', 'Em recepção', 'Finalizada']
  };
  const days = ['Dia 1', 'Dia 2', 'Dia 3', 'Dia 4', 'Dia 5'];
  const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  function seed(type) {
    if (!types.includes(type)) throw Error('Modelo desconhecido.');
    const clients = ['Solicitação 018', 'Solicitação 019', 'Solicitação 020', 'Solicitação 021'];
    const items = clients.map((client, i) => ({
      id: 'EX-' + (18 + i), client, stage: i === 1 ? 2 : i === 2 ? 1 : i === 3 ? 4 : 0,
      resource: i === 1 || i === 2 ? 'A' : '', day: i === 2 ? 1 : 0, slot: i === 2 ? '11:00' : '10:00',
      note: '', checks: [], log: ['Solicitação fictícia criada.'], version: 1,
      qty: [500, 200, 100, 300][i], product: ['Flyer A5', 'Cartão de visita', 'Adesivo', 'Folder'][i],
      proofVersion: 0, approvedVersion: 0, produced: 0, from: i === 2 ? 3 : 1, to: i === 2 ? 4 : 2,
      professional: i === 2 ? 'Equipe Oliva' : 'Equipe Verde', duration: 60
    }));
    if (type === 'grafica') {
      items[3].stage = 3; items[3].produced = items[3].qty;
      items[1].proofVersion = items[1].approvedVersion = 1;
      items[1].checks = [0, 1];
      items[2].proofVersion = 1;
    }
    if (type === 'locacao') {
      items.forEach(o => o.qty = 1);
      items[1].resource = 'EQ-01'; items[2].resource = 'EQ-02';
    }
    if (type === 'recepcao') {
      items[3].stage = 4;
      items.forEach(o => o.qty = 1);
    }
    return { type, items, blockedAssets: ['EQ-03'] };
  }
  function get(s, id) {
    const o = s.items.find(x => x.id === id);
    if (!o) throw Error('Registro não encontrado.');
    return o;
  }
  function log(o, text) { o.log.push(text); }
  function requireStage(o, n) {
    if (o.stage !== n) throw Error('Esta ação não pertence à etapa atual.');
  }
  function integer(n, min, max) {
    return Number.isInteger(n) && n >= min && n <= max;
  }
  function checked(o, count) {
    if (Array.from({ length: count }, (_, i) => i).some(i => !o.checks.includes(i)))
      throw Error('Conclua todas as conferências administrativas de exemplo.');
  }
  function mark(s, id, index, value) {
    const o = get(s, id);
    const valid = s.type === 'grafica' ? o.stage === 1 : s.type === 'locacao' ? [1, 2, 3].includes(o.stage) : false;
    if (!valid || !integer(index, 0, 1) || typeof value !== 'boolean') throw Error('Conferência indisponível.');
    o.checks = o.checks.filter(x => x !== index);
    if (value) o.checks.push(index);
  }
  function revise(s, id, qty, product) {
    if (s.type !== 'grafica') throw Error('Modelo incorreto.');
    const o = get(s, id);
    if (o.stage >= 2) throw Error('A produção já começou; restaure a amostra para alterar o briefing.');
    if (!integer(qty, 1, 10000) || !['Flyer A5', 'Cartão de visita', 'Adesivo', 'Folder'].includes(product))
      throw Error('Escolha um produto e uma quantidade inteira entre 1 e 10.000.');
    o.qty = qty; o.product = product; o.version++; o.stage = 0;
    o.proofVersion = o.approvedVersion = 0; o.checks = [];
    log(o, 'Briefing v' + o.version + ' atualizado; aprovação anterior invalidada.');
  }
  function prepareProof(s, id) {
    if (s.type !== 'grafica') throw Error('Modelo incorreto.');
    const o = get(s, id); requireStage(o, 0);
    o.proofVersion = o.version; o.stage = 1; o.checks = [];
    log(o, 'Prova ilustrativa v' + o.version + ' preparada. Nenhum arquivo real foi analisado.');
  }
  function startPrint(s, id, resource, day, slot) {
    if (s.type !== 'grafica') throw Error('Modelo incorreto.');
    const o = get(s, id); requireStage(o, 1); checked(o, 2);
    if (o.proofVersion !== o.version) throw Error('A prova está desatualizada.');
    if (!['A', 'B'].includes(resource) || !integer(day, 0, 4) || !slots.includes(slot))
      throw Error('Escolha linha, dia e horário válidos.');
    if (s.items.some(x => x.id !== id && x.stage === 2 && x.resource === resource && x.day === day && x.slot === slot))
      throw Error('Esta linha já tem produção nesse horário. Escolha outro turno ou linha.');
    o.approvedVersion = o.version; o.resource = resource; o.day = day; o.slot = slot; o.stage = 2;
    log(o, 'Prova v' + o.version + ' aprovada no exemplo; produção agendada na linha ' + resource + '.');
  }
  function finishPrint(s, id, produced) {
    if (s.type !== 'grafica') throw Error('Modelo incorreto.');
    const o = get(s, id); requireStage(o, 2);
    if (!integer(produced, 1, 10000) || produced !== o.qty) throw Error('A quantidade conferida deve corresponder ao pedido de exemplo.');
    o.produced = produced; o.stage = 3; log(o, produced + ' unidades conferidas. Pedido pronto na amostra.');
  }
  function availability(s, asset, from, to, exclude) {
    if (s.type !== 'locacao') throw Error('Modelo incorreto.');
    if (!['EQ-01', 'EQ-02', 'EQ-03', 'EQ-04'].includes(asset) || !integer(from, 0, 4) || !integer(to, 0, 4) || from > to)
      throw Error('Selecione equipamento e período válido, do dia 1 ao dia 5.');
    if (s.blockedAssets.includes(asset)) return { free: false, reason: 'Cadastro em conferência. Não disponível para a amostra.' };
    const conflict = s.items.find(x => x.id !== exclude && x.resource === asset &&
      ([1, 2].includes(x.stage) && x.from <= to && x.to >= from || x.stage === 3));
    return { free: !conflict, reason: conflict ? 'Conflito com ' + conflict.id + ' no período ou na conferência de retorno.' : 'Disponível no período de exemplo.' };
  }
  function reserveAsset(s, id, asset, from, to) {
    const o = get(s, id); requireStage(o, 0);
    const result = availability(s, asset, from, to, id);
    if (!result.free) throw Error(result.reason);
    o.resource = asset; o.from = from; o.to = to; o.stage = 1; o.checks = [];
    log(o, 'Reserva fictícia: ' + asset + ', ' + days[from] + ' a ' + days[to] + '.');
  }
  function dispatch(s, id) {
    if (s.type !== 'locacao') throw Error('Modelo incorreto.');
    const o = get(s, id); requireStage(o, 1); checked(o, 2);
    o.stage = 2; o.checks = []; log(o, 'Saída administrativa registrada. Sem despacho ou contrato real.');
  }
  function returnAsset(s, id, note) {
    if (s.type !== 'locacao') throw Error('Modelo incorreto.');
    const o = get(s, id); requireStage(o, 2); checked(o, 2);
    if (typeof note !== 'string' || note.trim().length < 10 || note.length > 400) throw Error('Registre uma observação fictícia de 10 a 400 caracteres.');
    o.note = note.trim(); o.stage = 3; o.checks = [];
    log(o, 'Retorno registrado; cadastro permanece indisponível até a conferência administrativa.');
  }
  function release(s, id) {
    if (s.type !== 'locacao') throw Error('Modelo incorreto.');
    const o = get(s, id); requireStage(o, 3); checked(o, 2);
    o.stage = 4; log(o, 'Conferência administrativa encerrada no exemplo. Não é inspeção técnica ou liberação de segurança.');
  }
  function reserveSlot(s, id, resource, professional, day, slot) {
    if (s.type !== 'recepcao') throw Error('Modelo incorreto.');
    const o = get(s, id); requireStage(o, 0);
    if (!['A', 'B'].includes(resource) || !['Equipe Verde', 'Equipe Oliva'].includes(professional) ||
      !integer(day, 0, 4) || !slots.includes(slot)) throw Error('Escolha sala, equipe, dia e horário válidos.');
    if (s.items.some(x => x.id !== id && !x.cancelled && [1, 2, 3].includes(x.stage) && x.day === day &&
      Math.abs(Number(x.slot.slice(0, 2)) - Number(slot.slice(0, 2))) * 60 < Math.max(x.duration, o.duration) &&
      (x.resource === resource || x.professional === professional)))
      throw Error('A sala ou a equipe já está ocupada nesse horário.');
    o.resource = resource; o.professional = professional; o.day = day; o.slot = slot; o.stage = 1;
    log(o, 'Horário reservado no exemplo. Nenhuma pessoa foi contatada.');
  }
  function nextReception(s, id) {
    if (s.type !== 'recepcao') throw Error('Modelo incorreto.');
    const o = get(s, id);
    if (o.cancelled || ![1, 2, 3].includes(o.stage)) throw Error('Transição indisponível para esta solicitação.');
    o.stage++; log(o, ['','','Confirmação administrativa de exemplo.','Chegada registrada na recepção.','Fluxo administrativo encerrado. Sem registro clínico.'][o.stage]);
  }
  function cancelSlot(s, id) {
    if (s.type !== 'recepcao') throw Error('Modelo incorreto.');
    const o = get(s, id);
    if (o.cancelled || ![1, 2].includes(o.stage)) throw Error('Somente uma reserva futura pode ser cancelada.');
    o.cancelled = true; log(o, 'Reserva cancelada no exemplo; sala e equipe liberadas.');
  }
  function metrics(s) {
    return {
      pending: s.items.filter(x => !x.cancelled && x.stage === 0).length,
      working: s.items.filter(x => !x.cancelled && x.stage > 0 && x.stage < stages[s.type].length - 1).length,
      done: s.items.filter(x => !x.cancelled && x.stage === stages[s.type].length - 1).length,
      cancelled: s.items.filter(x => x.cancelled).length
    };
  }
  function report(s, id) {
    const o = get(s, id);
    if (o.cancelled || o.stage !== stages[s.type].length - 1) throw Error('O resumo fica disponível após encerrar o fluxo de exemplo.');
    return ['JHOU / DEMONSTRAÇÃO INFORMATIVA', 'DADOS FICTÍCIOS — SEM VALIDADE COMERCIAL OU TÉCNICA',
      o.id + ' / ' + o.client, stages[s.type][o.stage], 'Registro: ' + (o.resource || '—'),
      s.type === 'grafica' ? o.product + ' / ' + o.produced + ' unidades / v' + o.version :
      s.type === 'locacao' ? days[o.from] + ' a ' + days[o.to] + ' / ' + o.note :
      days[o.day] + ' / ' + o.slot + ' / ' + o.professional, '', ...o.log].join('\n');
  }
  const api = { types, stages, days, slots, seed, get, mark, revise, prepareProof, startPrint, finishPrint,
    availability, reserveAsset, dispatch, returnAsset, release, reserveSlot, nextReception, cancelSlot, metrics, report };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else host.BusinessDemo = api;
})(typeof window === 'undefined' ? {} : window);
