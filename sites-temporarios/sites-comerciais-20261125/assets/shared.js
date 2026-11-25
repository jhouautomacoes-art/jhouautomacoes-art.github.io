(() => {
  const expiration = Date.parse(document.querySelector('time')?.dateTime);
  const demo = document.getElementById('demo');
  const expire = () => {
    demo.remove();
    document.getElementById('expiration').hidden = false;
  };
  if (!Number.isFinite(expiration) || Date.now() >= expiration) expire();
  else {
    demo.hidden = false;
    setTimeout(expire, expiration - Date.now());
  }
  window.downloadExample = (filename, lines) => {
    if (!Number.isFinite(expiration) || Date.now() >= expiration) return;
    const url = URL.createObjectURL(new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'}));
    const link = Object.assign(document.createElement('a'), {href:url, download:filename});
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
})();
