'use strict';
(function (host) {
  const materials = ['Granito', 'Mármore', 'Quartzito'];
  const works = [
    { id: 'freios', name: 'Freios', labor: 180, part: 240 },
    { id: 'oleo', name: 'Óleo e filtros', labor: 90, part: 160 },
    { id: 'suspensao', name: 'Suspensão', labor: 220, part: 320 }
  ];
  const parts = [
    { id: 'rolete', name: 'Roletes', stock: 3, min: 2 },
    { id: 'fusor', name: 'Unidade fusora', stock: 2, min: 1 },
    { id: 'kit', name: 'Kit de limpeza', stock: 4, min: 2 }
  ];
  function integer(n, min, max) { return Number.isInteger(n) && n >= min && n <= max; }
  function seed(type) {
    if (type === 'pedra') return { type, pieces: [], finish: 'Polido', material: 'Granito', revision: 1, exported: false };
    if (type === 'oficina') return { type, selected: [], stage: 'rascunho', revision: 1, customer: 'Veículo de exemplo' };
    if (type === 'impressoras') return { type, stock: parts.map(p => ({ ...p })), ticket: { id: 'OS-204', device: 'Impressora laser de exemplo', stage: 'triagem', part: null, note: '' }, movements: [] };
    throw Error('Modelo desconhecido.');
  }
  function addPiece(s, width, depth, quantity, openings) {
    if (s.type !== 'pedra' || !integer(width, 30, 300) || !integer(depth, 20, 180) || !integer(quantity, 1, 8) || !integer(openings, 0, 4))
      throw Error('Use medidas inteiras de 30–300 × 20–180 cm, 1–8 peças e 0–4 recortes.');
    if (s.pieces.length >= 6) throw Error('O exemplo aceita até seis linhas.');
    s.pieces.push({ id: s.revision++, width, depth, quantity, openings }); s.exported = false;
    return summaryStone(s);
  }
  function removePiece(s, id) {
    const before = s.pieces.length; s.pieces = s.pieces.filter(p => p.id !== id);
    if (before === s.pieces.length) throw Error('Peça não encontrada.');
    s.exported = false; return summaryStone(s);
  }
  function configureStone(s, material, finish) {
    if (s.type !== 'pedra' || !materials.includes(material) || !['Polido','Acetinado','Escovado'].includes(finish)) throw Error('Seleção inválida.');
    s.material = material; s.finish = finish; s.exported = false;
  }
  function summaryStone(s) {
    const units = s.pieces.reduce((n,p) => n + p.quantity, 0);
    const area = s.pieces.reduce((n,p) => n + p.width * p.depth * p.quantity / 10000, 0);
    const openings = s.pieces.reduce((n,p) => n + p.openings * p.quantity, 0);
    return { units, area: Math.round(area * 100) / 100, openings, gross: Math.round(area * 1.12 * 100) / 100 };
  }
  function exportStone(s) {
    const x = summaryStone(s);
    if (!x.units) throw Error('Inclua pelo menos uma peça para gerar o briefing.');
    s.exported = true;
    return ['BRIEFING FICTÍCIO · SEM ORÇAMENTO', s.material + ' / ' + s.finish,
      ...s.pieces.map((p,i) => `${i+1}. ${p.quantity} × ${p.width} × ${p.depth} cm · ${p.openings} recorte(s)/peça`),
      `Área geométrica: ${x.area.toFixed(2)} m²`, `Área ilustrativa com margem de 12%: ${x.gross.toFixed(2)} m²`,
      'A margem não é plano de corte nem consumo real. Medição, projeto, disponibilidade, preço e prazo exigem análise profissional.'].join('\n');
  }
  function toggleWork(s, id) {
    if (s.type !== 'oficina' || s.stage !== 'rascunho' || !works.some(w => w.id === id)) throw Error('Itens só podem ser alterados antes da aprovação de exemplo.');
    s.selected = s.selected.includes(id) ? s.selected.filter(x => x !== id) : [...s.selected, id]; s.revision++;
    return summaryWork(s);
  }
  function summaryWork(s) {
    const chosen = works.filter(w => s.selected.includes(w.id));
    return { chosen, labor: chosen.reduce((n,w) => n + w.labor, 0), parts: chosen.reduce((n,w) => n + w.part, 0), total: chosen.reduce((n,w) => n + w.labor + w.part, 0) };
  }
  function approveWork(s) {
    if (s.type !== 'oficina' || s.stage !== 'rascunho' || !s.selected.length) throw Error('Selecione ao menos um serviço antes de aprovar o exemplo.');
    s.stage = 'aprovado';
  }
  function finishWork(s) {
    if (s.type !== 'oficina' || s.stage !== 'aprovado') throw Error('A aprovação fictícia vem antes da conclusão.');
    s.stage = 'concluido';
  }
  function selectPart(s, id) {
    if (s.type !== 'impressoras' || s.ticket.stage !== 'triagem' || !s.stock.some(p => p.id === id)) throw Error('Escolha uma peça disponível na triagem.');
    s.ticket.part = id;
  }
  function consumePart(s, note) {
    if (s.type !== 'impressoras' || s.ticket.stage !== 'triagem') throw Error('Movimentação indisponível nesta etapa.');
    if (typeof note !== 'string' || note.trim().length < 8 || note.trim().length > 160) throw Error('Descreva a ação fictícia em 8 a 160 caracteres.');
    const p = s.stock.find(x => x.id === s.ticket.part);
    if (!p) throw Error('Escolha a peça antes de registrar.');
    if (p.stock < 1) throw Error('Peça sem saldo. Registre reposição fictícia antes de continuar.');
    p.stock--; s.ticket.note = note.trim(); s.ticket.stage = 'em teste';
    s.movements.push({ part: p.name, action: 'Consumo de 1 unidade', balance: p.stock });
    return p.stock <= p.min;
  }
  function replenish(s, id, qty) {
    if (s.type !== 'impressoras' || !integer(qty, 1, 20)) throw Error('Reposição fictícia de 1 a 20 unidades.');
    const p = s.stock.find(x => x.id === id); if (!p) throw Error('Peça não encontrada.');
    p.stock += qty; s.movements.push({ part: p.name, action: `Reposição fictícia de ${qty}`, balance: p.stock });
  }
  function finishTicket(s) {
    if (s.type !== 'impressoras' || s.ticket.stage !== 'em teste') throw Error('Registre uma movimentação antes de encerrar a OS fictícia.');
    s.ticket.stage = 'encerrada';
  }
  const api = { materials, works, parts, seed, addPiece, removePiece, configureStone, summaryStone, exportStone,
    toggleWork, summaryWork, approveWork, finishWork, selectPart, consumePart, replenish, finishTicket };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else host.ConceptDemo = api;
})(typeof window === 'undefined' ? {} : window);
