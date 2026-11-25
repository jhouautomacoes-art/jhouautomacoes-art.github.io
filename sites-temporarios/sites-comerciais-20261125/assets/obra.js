(() => {
  const form = document.getElementById('brief');
  if (!form) return;
  const steps = [...form.querySelectorAll('fieldset')];
  const progress = [...document.querySelectorAll('.progress li')];
  const back = document.getElementById('back');
  const next = document.getElementById('next');
  const download = document.getElementById('download');
  const status = document.getElementById('status');
  let step = 0;
  let summary = [];
  function render() {
    steps.forEach((field, i) => { field.hidden = field.disabled = i !== step; });
    progress.forEach((label, i) => i === step ? label.setAttribute('aria-current','step') : label.removeAttribute('aria-current'));
    back.hidden = step === 0;
    next.hidden = step === 2;
    download.hidden = step !== 2;
    steps[step].querySelector('legend').focus();
    status.textContent = '';
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (step === 0 && !form.querySelector('input:checked')) {
      status.textContent = 'Selecione um serviço para continuar.';
      steps[step].querySelector('input').focus();
      return;
    }
    if (step === 1) {
      const property = form.elements.property;
      const area = form.elements.area;
      if (!property.value || !area.validity.valid) {
        status.textContent = 'Selecione o imóvel e informe uma área inteira entre 1 e 10.000 m².';
        (!property.value ? property : area).focus();
        return;
      }
      summary = ['BRIEFING DE EXEMPLO', 'Serviço: ' + form.querySelector('input:checked').value,
        'Imóvel: ' + property.value, 'Área aproximada: ' + area.value + ' m²', 'Escopo e preço a confirmar.'];
      document.getElementById('summary').textContent = summary.slice(1).join('\n');
    }
    if (step < 2) { step++; render(); }
  });
  back.addEventListener('click', () => { step--; render(); });
  download.addEventListener('click', () => {
    window.downloadExample('briefing-morada-exemplo.txt', summary);
    status.textContent = 'Briefing preparado para baixar.';
  });
})();
