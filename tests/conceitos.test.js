'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../conceitos-model.js');

test('projeto de pedra soma unidades, área e recortes sem prometer plano de corte', () => {
  const s=M.seed('pedra');
  assert.throws(()=>M.exportStone(s),/pelo menos uma peça/);
  M.addPiece(s,120,60,2,1);
  M.addPiece(s,80,40,1,0);
  assert.deepEqual(M.summaryStone(s),{units:3,area:1.76,openings:2,gross:1.97});
  assert.match(M.exportStone(s),/não é plano de corte/);
  M.removePiece(s,s.pieces[0].id);
  assert.equal(M.summaryStone(s).units,1);
  assert.equal(s.exported,false);
});
test('projeto de pedra rejeita limites e configuração inválida', () => {
  const s=M.seed('pedra');
  assert.throws(()=>M.addPiece(s,0,60,1,0),/medidas/);
  assert.throws(()=>M.addPiece(s,100,60,1.5,0),/medidas/);
  assert.throws(()=>M.configureStone(s,'Madeira','Polido'),/inválida/);
  assert.equal(s.pieces.length,0);
});
test('oficina exige item antes da aprovação, bloqueia alteração depois e só conclui após aprovar', () => {
  const s=M.seed('oficina');
  assert.throws(()=>M.approveWork(s),/ao menos um/);
  assert.throws(()=>M.finishWork(s),/aprovação/);
  M.toggleWork(s,'freios');M.toggleWork(s,'oleo');
  assert.deepEqual(M.summaryWork(s),{chosen:M.works.slice(0,2),labor:270,parts:400,total:670});
  M.approveWork(s);
  assert.throws(()=>M.toggleWork(s,'suspensao'),/antes da aprovação/);
  M.finishWork(s);assert.equal(s.stage,'concluido');
});
test('impressoras movimenta peça uma vez, gera alerta e exige etapa correta', () => {
  const s=M.seed('impressoras');
  assert.throws(()=>M.finishTicket(s),/movimentação/);
  assert.throws(()=>M.consumePart(s,'troca simulada'),/Escolha a peça/);
  M.selectPart(s,'fusor');
  assert.equal(M.consumePart(s,'troca simulada'),true);
  assert.equal(s.stock.find(x=>x.id==='fusor').stock,1);
  assert.throws(()=>M.consumePart(s,'segunda troca'),/indisponível/);
  M.finishTicket(s);assert.equal(s.ticket.stage,'encerrada');
  M.replenish(s,'fusor',2);assert.equal(s.stock.find(x=>x.id==='fusor').stock,3);
});
