const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const analytics = require('../preview-analytics.js');

const website = 'e676c9b4-11e4-4ef1-a4d7-87001773e9f2';
const now = Date.parse('2026-10-15T12:00:00Z');
const sample = {
  id: 'teste-20261015',
  created_at: '2026-10-15T11:00:00Z',
  expires_at: '2026-10-18T11:00:00Z',
};

test('only an active sample on the public domain can be counted', () => {
  assert.equal(analytics.eligible(sample, website, 'jhouautomacoes-art.github.io', {}, now), true);
  assert.equal(analytics.eligible(sample, website, 'localhost', {}, now), false);
  assert.equal(analytics.eligible(sample, '', 'jhouautomacoes-art.github.io', {}, now), false);
  assert.equal(analytics.eligible(sample, website, 'jhouautomacoes-art.github.io', {doNotTrack: '1'}, now), false);
  assert.equal(analytics.eligible(sample, website, 'jhouautomacoes-art.github.io', {globalPrivacyControl: true}, now), false);
  assert.equal(analytics.eligible(sample, website, 'jhouautomacoes-art.github.io', {}, Date.parse(sample.expires_at)), false);
  assert.equal(analytics.eligible({...sample, expires_at: '2026-10-18T12:00:01Z'}, website, 'jhouautomacoes-art.github.io', {}, now), false);
});

test('payload uses only a registry id, never query strings or recipient data', () => {
  assert.deepEqual(analytics.payload(sample, website), {
    website, url: '/previas/teste-20261015', title: 'Prévia temporária Jhou',
  });
  assert.equal(analytics.eligible({...sample, id: 'teste?email=alguem@example.com'}, website, 'jhouautomacoes-art.github.io', {}, now), false);
});

test('browser integration sends one explicit pageview and no automatic pageview', () => {
  const appended = [];
  const sent = [];
  const notice = {hidden: true};
  const browser = {
    location: {hostname: 'jhouautomacoes-art.github.io', search: '?amostra=teste-20261015&email=privado@example.com'},
    navigator: {},
    document: {
      getElementById(id) {
        return id === 'analytics-config' ? {textContent: JSON.stringify({websiteId: website})} : notice;
      },
      createElement() { return {dataset: {}}; },
      head: {appendChild(script) { appended.push(script); }},
    },
    umami: {track(item) { sent.push(item); }},
  };
  const code = fs.readFileSync(path.join(__dirname, '..', 'preview-analytics.js'), 'utf8');
  const context = vm.createContext({window: browser, Date: class extends Date { static now() { return now; } }});
  vm.runInContext(code, context);
  assert.equal(browser.JhouPreviewAnalytics.track(sample), true);
  assert.equal(browser.JhouPreviewAnalytics.track(sample), false);
  assert.equal(appended.length, 1);
  assert.equal(appended[0].dataset.autoTrack, 'false');
  assert.equal(appended[0].dataset.domains, 'jhouautomacoes-art.github.io');
  assert.equal(notice.hidden, false);
  appended[0].onload();
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, '/previas/teste-20261015');
  assert.equal(JSON.stringify(sent[0]).includes('privado@example.com'), false);
});

test('unconfigured website does not load the external tracker', () => {
  const appended = [];
  const browser = {
    location: {hostname: 'jhouautomacoes-art.github.io'}, navigator: {},
    document: {
      getElementById() { return {textContent: '{"websiteId":""}', hidden: true}; },
      createElement() { return {dataset: {}}; },
      head: {appendChild(script) { appended.push(script); }},
    },
  };
  const code = fs.readFileSync(path.join(__dirname, '..', 'preview-analytics.js'), 'utf8');
  const context = vm.createContext({window: browser, Date: class extends Date { static now() { return now; } }});
  vm.runInContext(code, context);
  assert.equal(browser.JhouPreviewAnalytics.track(sample), false);
  assert.equal(appended.length, 0);
});
