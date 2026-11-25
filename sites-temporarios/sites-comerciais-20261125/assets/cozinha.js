(() => {
  const results = document.getElementById('items');
  if (!results) return;
  const products = [
    {code:'FC-01', name:'Forno combinado', category:'Cocção', detail:'Assar e cozinhar em lotes.'},
    {code:'CH-01', name:'Chapa de bancada', category:'Cocção', detail:'Finalização e grelhados.'},
    {code:'BR-04', name:'Balcão refrigerado', category:'Refrigeração', detail:'Ingredientes à mão durante o serviço.'},
    {code:'AR-07', name:'Armário refrigerado', category:'Refrigeração', detail:'Organização de insumos frios.'},
    {code:'BI-02', name:'Bancada inox', category:'Preparo', detail:'Superfície de apoio e montagem.'},
    {code:'CB-03', name:'Cuba dupla', category:'Preparo', detail:'Separação das etapas de lavagem.'},
  ];
  const byCode = new Map(products.map(product => [product.code, product]));
  const searcher = window.Fuse ? new window.Fuse(products, {keys:['name','category','detail','code'], ignoreDiacritics:true, threshold:.38}) : null;
  const basket = new Map();
  const search = document.getElementById('search');
  const found = document.getElementById('found');
  const items = document.getElementById('lines');
  const count = document.getElementById('count');
  const status = document.getElementById('status');
  const download = document.getElementById('download');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let category = 'Todas';
  function node(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function renderCatalog() {
    const query = search.value.trim();
    const matches = !query ? products : searcher ? searcher.search(query).map(hit => hit.item)
      : products.filter(product => [product.name, product.category, product.code].join(' ').toLowerCase().includes(query.toLowerCase()));
    const list = matches.filter(product => category === 'Todas' || product.category === category);
    found.textContent = list.length ? list.length + ' modelos' : 'Nenhum modelo encontrado. Altere a busca ou a categoria.';
    results.replaceChildren(...list.map(product => {
      const row = node('article', '', 'item');
      const code = node('div', product.code, 'item-code');
      const info = node('div', '');
      info.append(node('small', product.category), node('h3', product.name), node('p', product.detail));
      const add = node('button', 'Adicionar', 'action secondary');
      add.type = 'button';
      add.setAttribute('aria-label', 'Adicionar ' + product.name);
      add.addEventListener('click', () => change(product.code, 1));
      row.append(code, info, add);
      return row;
    }));
  }
  function change(code, delta) {
    const qty = (basket.get(code) || 0) + delta;
    if (qty > 99) { status.textContent = 'Limite de 99 unidades por modelo.'; return; }
    if (qty > 0) basket.set(code, qty); else basket.delete(code);
    const focused = document.activeElement?.dataset.qtyControl;
    const rows = [...basket].map(([key, value]) => {
      const item = byCode.get(key);
      const row = node('li', '');
      const controls = node('div', '', 'qty');
      const minus = node('button', '−');
      const plus = node('button', '+');
      [minus, plus].forEach((button, index) => {
        button.type = 'button';
        button.dataset.qtyControl = key + index;
        button.setAttribute('aria-label', (index ? 'Aumentar ' : 'Diminuir ') + item.name);
        button.addEventListener('click', () => change(key, index ? 1 : -1));
      });
      controls.append(minus, node('output', String(value)), plus);
      row.append(node('span', item.name), controls);
      return row;
    });
    items.replaceChildren(...rows);
    if (focused) {
      const replacement = items.querySelector('[data-qty-control="' + focused + '"]') || items.querySelector('button');
      (replacement || search).focus();
    }
    const total = [...basket.values()].reduce((sum, value) => sum + value, 0);
    count.textContent = total + (total === 1 ? ' equipamento' : ' equipamentos');
    download.disabled = total === 0;
    status.textContent = '';
  }
  filters.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    renderCatalog();
  }));
  search.addEventListener('input', renderCatalog);
  download.addEventListener('click', () => {
    window.downloadExample('cotacao-forja-exemplo.txt', ['LISTA DE COTAÇÃO · EXEMPLO', ...[...basket].map(([key, value]) => key + ' · ' + byCode.get(key).name + ' × ' + value)]);
    status.textContent = 'Lista preparada para baixar.';
  });
  renderCatalog();
})();
