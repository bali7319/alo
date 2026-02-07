/* global desktopAgent */

const $ = (id) => document.getElementById(id);
const out = $('out');
const statusEl = $('status');
const lastEl = $('last');

function now() {
  return new Date().toLocaleString();
}

function append(line) {
  out.value += `${line}\n`;
  out.scrollTop = out.scrollHeight;
}

function setStatus(text, kind) {
  statusEl.textContent = text || '';
  statusEl.className = kind === 'ok' ? 'ok' : kind === 'bad' ? 'bad' : 'muted';
}

function loadSettings() {
  $('panelUrl').value = localStorage.getItem('panelUrl') || 'https://alo17.tr';
  $('token').value = localStorage.getItem('agentToken') || '';
}

function saveSettings() {
  localStorage.setItem('panelUrl', $('panelUrl').value.trim());
  localStorage.setItem('agentToken', $('token').value);
}

function requireTokenOrFocus() {
  const tokenEl = $('token');
  const token = (tokenEl.value || '').trim();
  if (token) return token;
  setStatus('Agent Token boş. Sunucudaki MARKETPLACE_AGENT_TOKEN değerini yapıştır.', 'bad');
  try {
    tokenEl.focus();
    tokenEl.select?.();
  } catch {}
  return '';
}

async function withBusy(btn, fn) {
  const prev = btn.textContent;
  btn.disabled = true;
  try {
    await fn();
  } finally {
    btn.disabled = false;
    btn.textContent = prev;
  }
}

async function main() {
  $('ver').textContent = (window.desktopAgent && window.desktopAgent.version) || '-';
  loadSettings();

  // App açılır açılmaz token boşsa token alanına odaklan.
  if (!($('token').value || '').trim()) {
    setStatus('Agent Token gerekli. Kutuyu doldurup Config Al / Senkronla yap.', 'bad');
    setTimeout(() => {
      try {
        $('token').focus();
        $('token').select?.();
      } catch {}
    }, 50);
  } else {
    setStatus('', 'muted');
  }

  $('btnConfig').addEventListener('click', () => {
    saveSettings();
    withBusy($('btnConfig'), async () => {
      out.value = '';
      setStatus('Config alınıyor…');
      append(`[${now()}] GET config`);
      const panelUrl = $('panelUrl').value.trim();
      const token = requireTokenOrFocus();
      if (!token) {
        append(`[${now()}] ERROR Agent token gerekli`);
        lastEl.textContent = `Son: ${now()}`;
        return;
      }
      const provider = $('provider').value;
      try {
        const res = await window.desktopAgent.getConfig({ panelUrl, token, provider });
        if (!res || !res.ok) throw new Error('Config alınamadı');
        append(`[${now()}] OK provider=${res.safe.provider}`);
        append(`baseUrl=${res.safe.credentials.baseUrl}`);
        append(`key=${res.safe.credentials.consumerKeyMasked}`);
        append(`secret=${res.safe.credentials.consumerSecretMasked}`);
        append(`apiPrefix=${res.safe.credentials.apiPrefix}`);
        setStatus('Config OK', 'ok');
        lastEl.textContent = `Son: ${now()}`;
      } catch (e) {
        append(`[${now()}] ERROR ${e && e.message ? e.message : String(e)}`);
        setStatus('Config hata', 'bad');
        lastEl.textContent = `Son: ${now()}`;
      }
    });
  });

  $('btnSync').addEventListener('click', () => {
    saveSettings();
    withBusy($('btnSync'), async () => {
      setStatus('Senkron çalışıyor…');
      append(`[${now()}] SYNC start`);
      const panelUrl = $('panelUrl').value.trim();
      const token = requireTokenOrFocus();
      if (!token) {
        append(`[${now()}] ERROR Agent token gerekli`);
        lastEl.textContent = `Son: ${now()}`;
        return;
      }
      const provider = $('provider').value;
      try {
        const res = await window.desktopAgent.syncNow({ panelUrl, token, provider });
        if (!res || !res.ok) throw new Error('Sync başarısız');
        append(`[${now()}] OK products=${res.counts.products} orders=${res.counts.orders}`);
        append(`[${now()}] Panel response: ${JSON.stringify(res.panel)}`);
        setStatus('Sync OK', 'ok');
        lastEl.textContent = `Son: ${now()}`;
      } catch (e) {
        append(`[${now()}] ERROR ${e && e.message ? e.message : String(e)}`);
        setStatus('Sync hata', 'bad');
        lastEl.textContent = `Son: ${now()}`;
      }
    });
  });

  $('btnLog').addEventListener('click', () => {
    withBusy($('btnLog'), async () => {
      try {
        const p = await window.desktopAgent.getLogPath();
        append(`[${now()}] logPath: ${p}`);
        setStatus('Log path yazıldı', 'ok');
      } catch (e) {
        append(`[${now()}] ERROR ${e && e.message ? e.message : String(e)}`);
        setStatus('Log path hata', 'bad');
      }
    });
  });
}

main().catch((e) => {
  append(`[${now()}] FATAL ${e && e.message ? e.message : String(e)}`);
});

