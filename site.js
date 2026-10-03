const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  document.querySelectorAll('[data-category]').forEach(project => { project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter; if (!project.hidden) count++; });
  document.querySelector('#filter-status').textContent = `${count} ${count === 1 ? 'projeto exibido' : 'projetos exibidos'}`;
}));
document.querySelector('#year').textContent = new Date().getFullYear();

// Local, fictional demonstrations only. No requests or external actions.
const periodExamples = {
  semana: { created: 24, done: 18, late: 3, values: [2, 4, 3, 5, 4], labels: ['SEG', 'TER', 'QUA', 'QUI', 'SEX'] },
  mes: { created: 96, done: 72, late: 8, values: [12, 18, 16, 26], labels: ['SEM 1', 'SEM 2', 'SEM 3', 'SEM 4'] }
};
document.querySelector('#demo-period').addEventListener('change', event => {
  const sample = periodExamples[event.target.value];
  document.querySelector('#demo-created').textContent = sample.created;
  document.querySelector('#demo-done').textContent = sample.done;
  document.querySelector('#demo-late').textContent = sample.late;
  const bars = document.querySelector('#demo-bars');
  bars.replaceChildren(...sample.values.map((value, index) => {
    const column = document.createElement('div');
    const bar = document.createElement('i');
    bar.style.setProperty('--height', `${value / Math.max(...sample.values) * 100}%`);
    const label = document.createElement('span');
    label.textContent = sample.labels[index];
    column.append(bar, label);
    return column;
  }));
  bars.setAttribute('aria-label', `Dados fictícios: ${sample.values.join(', ')} atividades concluídas`);
});
document.querySelectorAll('[data-routine]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-routine]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#routine-entrada').hidden = button.dataset.routine !== 'entrada';
  document.querySelector('#routine-saida').hidden = button.dataset.routine !== 'saida';
}));
const moduleExamples = {
  cadastros: ['Organização de registros', 'Um espaço para consultar e manter os cadastros da rotina.'],
  documentos: ['Arquivos em um só lugar', 'Um módulo para acessar e organizar os documentos da rotina.'],
  rotinas: ['Etapas de trabalho integradas', 'Um módulo para acessar os fluxos administrativos disponíveis.']
};
document.querySelectorAll('[data-module]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-module]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const sample = moduleExamples[button.dataset.module];
  document.querySelector('#module-title').textContent = sample[0];
  document.querySelector('#module-description').textContent = sample[1];
}));
