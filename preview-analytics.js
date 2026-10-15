/* Contagem agregada de prévias ativas. Nenhum identificador de destinatário é enviado. */
(function (root) {
  'use strict';

  const DOMAIN = 'jhouautomacoes-art.github.io';
  const ID_RE = /^[a-z0-9-]{4,64}$/;
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let started = false;

  function eligible(sample, websiteId, hostname, privacy, now) {
    if (!sample || !ID_RE.test(sample.id || '') || !UUID_RE.test(websiteId || '')) return false;
    if (hostname !== DOMAIN || privacy?.doNotTrack === '1' || privacy?.globalPrivacyControl === true) return false;
    const created = Date.parse(sample.created_at);
    const expires = Date.parse(sample.expires_at);
    return Number.isFinite(created) && Number.isFinite(expires) &&
      created <= now && now < expires && expires > created && expires - created <= 72 * 60 * 60 * 1000;
  }

  function payload(sample, websiteId) {
    return { website: websiteId, url: '/previas/' + sample.id, title: 'Prévia temporária Jhou' };
  }

  function track(sample) {
    if (started || !root.document) return false;
    let websiteId;
    try {
      websiteId = JSON.parse(root.document.getElementById('analytics-config').textContent).websiteId;
    } catch {
      return false;
    }
    if (!eligible(sample, websiteId, root.location.hostname, root.navigator, Date.now())) return false;
    started = true;
    root.document.getElementById('visit-notice').hidden = false;
    const script = root.document.createElement('script');
    script.src = 'https://cloud.umami.is/script.js';
    script.defer = true;
    script.dataset.websiteId = websiteId;
    script.dataset.autoTrack = 'false';
    script.dataset.domains = DOMAIN;
    script.dataset.excludeSearch = 'true';
    script.dataset.excludeHash = 'true';
    script.dataset.doNotTrack = 'true';
    script.onload = () => {
      if (root.umami && eligible(sample, websiteId, root.location.hostname, root.navigator, Date.now())) {
        root.umami.track(payload(sample, websiteId));
      }
    };
    root.document.head.appendChild(script);
    return true;
  }

  const api = { eligible, payload, track };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JhouPreviewAnalytics = api;
})(typeof window !== 'undefined' ? window : globalThis);
