const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.querySelector('#year').textContent = new Date().getFullYear();

const grid = document.querySelector('#work-grid');
const galleryPrev = document.querySelector('#gallery-prev');
const galleryNext = document.querySelector('#gallery-next');
const galleryPosition = document.querySelector('#gallery-position');
function visibleTiles() { return [...grid.querySelectorAll('.work-tile')].filter(tile => !tile.hidden); }
function updateGallery() {
  const tiles = visibleTiles();
  const maxScroll = grid.scrollWidth - grid.clientWidth;
  const index = tiles.length ? tiles.reduce((best, tile, current) => Math.abs(tile.offsetLeft - grid.scrollLeft) < Math.abs(tiles[best].offsetLeft - grid.scrollLeft) ? current : best, 0) : 0;
  document.querySelector('#gallery-current').textContent = tiles[index]?.querySelector('h3').innerText.replace(/\s+/g, ' ').trim() || '';
  document.querySelectorAll('[data-gallery-target]').forEach(button => {
    button.hidden = !tiles.some(tile => tile.querySelector('[data-project]').dataset.project === button.dataset.galleryTarget);
    button.setAttribute('aria-pressed', String(tiles[index]?.querySelector('[data-project]').dataset.project === button.dataset.galleryTarget));
  });
  galleryPosition.textContent = `${String(index + 1).padStart(2, '0')} / ${String(tiles.length).padStart(2, '0')}`;
  galleryPrev.disabled = grid.scrollLeft < 4;
  galleryNext.disabled = maxScroll < 4 || grid.scrollLeft >= maxScroll - 4;
}
grid.addEventListener('scroll', updateGallery, { passive: true });
window.addEventListener('resize', updateGallery);
function moveGallery(direction) {
  const tile = visibleTiles()[0];
  if (!tile) return;
  const gap = parseFloat(getComputedStyle(grid).columnGap) || 12;
  grid.scrollBy({ left: direction * (tile.offsetWidth + gap), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
galleryPrev.addEventListener('click', () => moveGallery(-1));
galleryNext.addEventListener('click', () => moveGallery(1));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  grid.classList.toggle('is-filtered', button.dataset.filter !== 'all');
  grid.querySelectorAll('[data-category]').forEach(tile => { tile.hidden = button.dataset.filter !== 'all' && tile.dataset.category !== button.dataset.filter; });
  const count = visibleTiles().length;
  document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'projeto exibido' : 'projetos exibidos'}`;
  grid.scrollLeft = 0;
  updateGallery();
}));
grid.querySelectorAll('.work-tile').forEach(tile => tile.addEventListener('pointermove', event => {
  if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;
  const rect = tile.getBoundingClientRect();
  tile.style.setProperty('--pointer-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
  tile.style.setProperty('--pointer-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
}));

const projects = {
  ops: ['Inteligência operacional', '01 / DATA SYSTEMS · PROJETO DESENVOLVIDO'],
  docs: ['Processamento documental', '02 / DOCUMENT SYSTEMS · PROJETO DESENVOLVIDO'],
  routine: ['Automação administrativa', '03 / WORKFLOW AUTOMATION · PROJETO DESENVOLVIDO'],
  desktop: ['Plataforma modular', '04 / DESKTOP APPLICATION · PROJETO DESENVOLVIDO'],
  mobile: ['Finanças no Android', '05 / ANDROID APPLICATION · PROJETO DESENVOLVIDO'],
  concept: ['Orquestração de fluxos', '06 / LAB · ESTUDO CONCEITUAL']
};
const dialog = document.querySelector('#project-dialog');
const dialogContent = document.querySelector('#dialog-content');
let activeKey;
let opener;
let originalOverflow = '';
let simulationTimers = [];
function clearSimulation() { simulationTimers.forEach(timer => clearTimeout(timer)); simulationTimers = []; }
function projectOrder() { return visibleTiles().map(tile => tile.querySelector('[data-project]').dataset.project); }
function renderProject(key) {
  clearSimulation();
  activeKey = key;
  document.querySelector('#dialog-title').textContent = projects[key][0];
  document.querySelector('#dialog-type').textContent = projects[key][1];
  dialogContent.replaceChildren(document.querySelector(`#project-${key}`).content.cloneNode(true));
  document.querySelector('#dialog-note').textContent = key === 'concept' ? 'Estudo conceitual. Simulação local, sem implantação ou ação em sistemas externos.' : 'Projeto desenvolvido. Interface reconstruída com dados fictícios e identidade dos clientes preservada.';
  const order = projectOrder();
  const index = order.indexOf(key);
  document.querySelector('#project-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(order.length).padStart(2, '0')}`;
  document.querySelector('#project-prev').disabled = index <= 0;
  document.querySelector('#project-next').disabled = index >= order.length - 1;
  dialog.scrollTop = 0;
}
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  opener = button;
  originalOverflow = document.body.style.overflow;
  renderProject(button.dataset.project);
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  document.querySelector('.dialog-close').focus();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { clearSimulation(); document.body.style.overflow = originalOverflow; dialogContent.replaceChildren(); opener?.focus({ preventScroll: true }); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
document.querySelector('#project-prev').addEventListener('click', () => { const order = projectOrder(); const index = order.indexOf(activeKey); if (index > 0) renderProject(order[index - 1]); });
document.querySelector('#project-next').addEventListener('click', () => { const order = projectOrder(); const index = order.indexOf(activeKey); if (index < order.length - 1) renderProject(order[index + 1]); });

// Interactive reconstructed interfaces: every value is fictional, no network calls.
const periodExamples = {
  semana: { created: 24, done: 18, late: 3, values: [2, 4, 3, 5, 4], labels: ['SEG', 'TER', 'QUA', 'QUI', 'SEX'] },
  mes: { created: 96, done: 72, late: 8, values: [12, 18, 16, 26], labels: ['SEM 1', 'SEM 2', 'SEM 3', 'SEM 4'] }
};
dialogContent.addEventListener('change', event => {
  if (event.target.id !== 'demo-period') return;
  const sample = periodExamples[event.target.value];
  dialogContent.querySelector('#demo-created').textContent = sample.created;
  dialogContent.querySelector('#demo-done').textContent = sample.done;
  dialogContent.querySelector('#demo-late').textContent = sample.late;
  const bars = dialogContent.querySelector('#demo-bars');
  bars.replaceChildren(...sample.values.map((value, index) => {
    const column = document.createElement('div');
    const bar = document.createElement('i');
    bar.style.setProperty('--height', `${value / Math.max(...sample.values) * 100}%`);
    const label = document.createElement('span'); label.textContent = sample.labels[index];
    column.append(bar, label); return column;
  }));
  bars.setAttribute('aria-label', `Dados fictícios: ${sample.values.join(', ')} atividades concluídas`);
});
const moduleExamples = {
  cadastros: ['Organização de registros', 'Um espaço para consultar e manter os cadastros da rotina.'],
  documentos: ['Arquivos em um só lugar', 'Um módulo para acessar e organizar os documentos da rotina.'],
  rotinas: ['Etapas de trabalho integradas', 'Um módulo para acessar os fluxos administrativos disponíveis.']
};
function resetSimulation() {
  clearSimulation();
  dialogContent.querySelectorAll('[data-sim-step]').forEach(step => { step.removeAttribute('data-state'); step.querySelector('b').textContent = 'Aguardando'; });
  const result = dialogContent.querySelector('#concept-result');
  result.dataset.state = 'idle'; result.textContent = 'Pronto para explorar a sequência.';
  dialogContent.querySelector('#simulate-flow').disabled = false;
}
function startSimulation() {
  resetSimulation();
  const steps = [...dialogContent.querySelectorAll('[data-sim-step]')];
  const result = dialogContent.querySelector('#concept-result');
  dialogContent.querySelector('#simulate-flow').disabled = true;
  result.dataset.state = 'running'; result.textContent = 'Simulando uma tarefa de exemplo…';
  steps.forEach((step, index) => {
    simulationTimers.push(setTimeout(() => { step.dataset.state = 'running'; step.querySelector('b').textContent = 'Em execução'; }, index * 650));
    simulationTimers.push(setTimeout(() => {
      step.dataset.state = 'done'; step.querySelector('b').textContent = 'Concluído';
      if (index === steps.length - 1) { result.dataset.state = 'complete'; result.textContent = 'Sequência simulada concluída. Nenhum sistema externo foi executado.'; dialogContent.querySelector('#simulate-flow').disabled = false; }
    }, index * 650 + 500));
  });
}
dialogContent.addEventListener('click', event => {
  const routineButton = event.target.closest('[data-routine]');
  if (routineButton) {
    dialogContent.querySelectorAll('[data-routine]').forEach(item => item.setAttribute('aria-pressed', String(item === routineButton)));
    dialogContent.querySelector('#routine-entrada').hidden = routineButton.dataset.routine !== 'entrada';
    dialogContent.querySelector('#routine-saida').hidden = routineButton.dataset.routine !== 'saida';
  }
  const moduleButton = event.target.closest('[data-module]');
  if (moduleButton) {
    dialogContent.querySelectorAll('[data-module]').forEach(item => item.setAttribute('aria-pressed', String(item === moduleButton)));
    const sample = moduleExamples[moduleButton.dataset.module];
    dialogContent.querySelector('#module-title').textContent = sample[0];
    dialogContent.querySelector('#module-description').textContent = sample[1];
  }
  if (event.target.closest('#simulate-flow')) startSimulation();
  if (event.target.closest('#reset-flow')) resetSimulation();
});
updateGallery();

grid.addEventListener('keydown', event => {
  if (event.target !== grid) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); moveGallery(event.key === 'ArrowRight' ? 1 : -1); }
});
document.querySelectorAll('[data-gallery-target]').forEach(button => button.addEventListener('click', () => {
  const tile = visibleTiles().find(item => item.querySelector('[data-project]').dataset.project === button.dataset.galleryTarget);
  if (tile) grid.scrollTo({ left: tile.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}));
// Pointer dragging supplements native touch scrolling. A drag must not open a card.
let dragState = null;
let suppressGalleryClick = false;
let suppressTimer;
grid.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  dragState = { id: event.pointerId, startX: event.clientX, initialScroll: grid.scrollLeft, moved: false };
});
grid.addEventListener('pointermove', event => {
  if (!dragState || dragState.id !== event.pointerId) return;
  const distance = event.clientX - dragState.startX;
  if (!dragState.moved && Math.abs(distance) > 6) {
    dragState.moved = true; grid.classList.add('is-dragging'); grid.setPointerCapture(event.pointerId);
  }
  if (dragState.moved) { event.preventDefault(); grid.scrollLeft = dragState.initialScroll - distance; }
});
function finishDrag(event) {
  if (!dragState || dragState.id !== event.pointerId) return;
  const moved = dragState.moved;
  dragState = null;
  grid.classList.remove('is-dragging');
  if (grid.hasPointerCapture(event.pointerId)) grid.releasePointerCapture(event.pointerId);
  if (moved) {
    suppressGalleryClick = true;
    clearTimeout(suppressTimer);
    suppressTimer = setTimeout(() => { suppressGalleryClick = false; }, 350);
    const tiles = visibleTiles();
    const nearest = tiles.reduce((best, tile) => Math.abs(tile.offsetLeft - grid.scrollLeft) < Math.abs(best.offsetLeft - grid.scrollLeft) ? tile : best, tiles[0]);
    if (nearest) grid.scrollTo({ left: nearest.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}
grid.addEventListener('pointerup', finishDrag);
grid.addEventListener('pointercancel', finishDrag);
grid.addEventListener('pointerleave', event => { if (dragState && !dragState.moved) dragState = null; });
grid.addEventListener('click', event => { if (suppressGalleryClick) { event.preventDefault(); event.stopImmediatePropagation(); suppressGalleryClick = false; } }, true);
grid.addEventListener('dragstart', event => event.preventDefault());
