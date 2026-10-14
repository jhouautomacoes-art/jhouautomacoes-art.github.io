'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../negocios-model.js');

test('gráfica: briefing revisto invalida prova e evita aprovação desatualizada', () => {
  const s=M.seed('grafica');
  M.prepareProof(s,'EX-18');
  M.mark(s,'EX-18',0,true);M.mark(s,'EX-18',1,true);
  M.revise(s,'EX-18',750,'Adesivo');
  assert.equal(M.get(s,'EX-18').stage,0);
  assert.equal(M.get(s,'EX-18').approvedVersion,0);
  assert.throws(()=>M.startPrint(s,'EX-18','A',0,'14:00'),/etapa/);
  M.prepareProof(s,'EX-18');
  assert.throws(()=>M.startPrint(s,'EX-18','A',0,'14:00'),/conferências/);
  M.mark(s,'EX-18',0,true);M.mark(s,'EX-18',1,true);
  M.startPrint(s,'EX-18','A',0,'14:00');
  assert.throws(()=>M.finishPrint(s,'EX-18',500),/corresponder/);
  M.finishPrint(s,'EX-18',750);
  assert.match(M.report(s,'EX-18'),/750 unidades/);
  assert.deepEqual(M.metrics(s),{pending:0,working:2,done:2,cancelled:0});
});
test('gráfica: mesma linha e mesmo turno bloqueiam produção concorrente',()=>{
  const s=M.seed('grafica');
  M.prepareProof(s,'EX-18');M.mark(s,'EX-18',0,true);M.mark(s,'EX-18',1,true);
  assert.throws(()=>M.startPrint(s,'EX-18','A',0,'10:00'),/linha já tem/);
  M.startPrint(s,'EX-18','B',0,'10:00');
  assert.equal(M.get(s,'EX-18').resource,'B');
});
test('locação: intervalos inclusivos bloqueiam conflito e liberam outro item',()=>{
  const s=M.seed('locacao');
  assert.equal(M.availability(s,'EQ-01',2,3).free,false);
  assert.equal(M.availability(s,'EQ-01',3,4).free,true);
  assert.throws(()=>M.reserveAsset(s,'EX-18','EQ-03',3,4),/conferência/);
  assert.throws(()=>M.reserveAsset(s,'EX-18','EQ-01',2,3),/Conflito/);
  M.reserveAsset(s,'EX-18','EQ-04',2,3);
  assert.throws(()=>M.dispatch(s,'EX-18'),/conferências/);
  M.mark(s,'EX-18',0,true);M.mark(s,'EX-18',1,true);M.dispatch(s,'EX-18');
  M.mark(s,'EX-18',0,true);M.mark(s,'EX-18',1,true);
  assert.throws(()=>M.returnAsset(s,'EX-18','curta'),/10 a 400/);
  M.returnAsset(s,'EX-18','Retorno fictício para conferência administrativa.');
  assert.equal(M.availability(s,'EQ-04',4,4).free,false);
  M.mark(s,'EX-18',0,true);M.mark(s,'EX-18',1,true);M.release(s,'EX-18');
  assert.equal(M.availability(s,'EQ-04',4,4).free,true);
  assert.match(M.report(s,'EX-18'),/administrativa/);
});
test('locação: data inválida e resumo precoce são recusados',()=>{
  const s=M.seed('locacao');
  assert.throws(()=>M.availability(s,'EQ-04',4,2),/período válido/);
  assert.throws(()=>M.report(s,'EX-18'),/após encerrar/);
  assert.throws(()=>M.reserveAsset(s,'EX-18','EQ-04',0,6),/período válido/);
});
test('recepção: conflito de sala ou equipe; transições atualizam o mesmo histórico',()=>{
  const s=M.seed('recepcao');
  assert.throws(()=>M.reserveSlot(s,'EX-18','A','Equipe Verde',0,'10:00'),/ocupada/);
  assert.throws(()=>M.reserveSlot(s,'EX-18','B','Equipe Verde',0,'10:00'),/ocupada/);
  M.reserveSlot(s,'EX-18','B','Equipe Oliva',0,'14:00');
  M.nextReception(s,'EX-18');M.nextReception(s,'EX-18');M.nextReception(s,'EX-18');
  assert.equal(M.get(s,'EX-18').stage,4);
  assert.deepEqual(M.metrics(s),{pending:0,working:2,done:2,cancelled:0});
  assert.match(M.report(s,'EX-18'),/14:00/);
  assert.throws(()=>M.nextReception(s,'EX-18'),/Transição indisponível/);
});
test('recepção: cancelar devolve capacidade e mantém histórico sem resumo falso',()=>{
  const s=M.seed('recepcao');
  M.cancelSlot(s,'EX-20');
  M.reserveSlot(s,'EX-18','A','Equipe Oliva',1,'11:00');
  assert.equal(M.get(s,'EX-20').cancelled,true);
  assert.equal(M.metrics(s).cancelled,1);
  assert.throws(()=>M.report(s,'EX-20'),/após encerrar/);
});
