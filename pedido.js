(() => {
  const dialog = document.querySelector('#pedido-dialog');
  const form = document.querySelector('#pedido-form');
  if (!dialog || !form) return;
  let opener;
  document.querySelectorAll('[data-open-pedido]').forEach(button => button.addEventListener('click', () => {
    opener = button; dialog.showModal();
  }));
  document.querySelector('[data-close-pedido]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  const status = document.querySelector('#pedido-status');
  const preview = document.querySelector('#pedido-preview');
  const email = document.querySelector('#pedido-email');
  const download = document.querySelector('#pedido-download');
  let current;
  function invalidate() {
    current = undefined; preview.hidden = true; email.hidden = true; download.hidden = true;
    status.textContent = 'Revise os campos e prepare seu pedido.';
  }
  form.addEventListener('input', invalidate);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    if (fields.get('website')) { status.textContent = 'Não foi possível preparar o pedido.'; return; }
    current = { schema_version: 1, request_id: crypto.randomUUID?.() || String(Date.now()),
      name: fields.get('name').trim(), email: fields.get('email').trim(), service: fields.get('service'),
      problem: fields.get('problem').trim(), tool: fields.get('tool').trim(),
      expected_result: fields.get('expected_result').trim(), deadline: fields.get('deadline').trim(),
      budget: fields.get('budget').trim(), consent: fields.get('consent') === 'on', language: 'pt' };
    const summary = `Pedido de avaliação — Jhou Automações\n\nNome: ${current.name}\nE-mail: ${current.email}\nServiço: ${current.service}\nFerramenta: ${current.tool || 'A definir'}\nProblema: ${current.problem}\nResultado esperado: ${current.expected_result}\nPrazo desejado: ${current.deadline || 'A definir'}\nOrçamento informado: ${current.budget || 'A definir'}\n\nSolicito avaliação deste pedido e autorizo resposta sobre ele. Entendo que a execução usa agente de IA e que escopo, preço e prazo dependem de confirmação.\n\nRADAR_REQUEST_JSON\n${JSON.stringify(current)}\nEND_RADAR_REQUEST_JSON`;
    preview.textContent = summary; preview.hidden = false;
    email.href = `mailto:jhouautomacoes@gmail.com?subject=${encodeURIComponent('Pedido Jhou — ' + current.service)}&body=${encodeURIComponent(summary)}`;
    email.hidden = false; download.hidden = false;
    status.textContent = 'Pedido preparado. Abra seu e-mail, revise e envie para concluir. Nada foi enviado automaticamente.';
  });
  download.addEventListener('click', () => {
    if (!current) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(current, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'pedido-jhou.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Arquivo preparado para download. O pedido ainda precisa ser enviado por e-mail.';
  });
})();
