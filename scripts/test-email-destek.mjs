/**
 * destek@alo17.tr adresine SMTP ile test emaili gönderir.
 * Kullanım: node scripts/test-email-destek.mjs
 * (Proje kökünden çalıştırın; .env okunur)
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import nodemailer from 'nodemailer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const envPath = existsSync(join(root, '.env')) ? join(root, '.env') : join(process.cwd(), '.env');

if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) {
      const value = m[2].replace(/^["']|["']$/g, '').trim();
      process.env[m[1]] = value;
    }
  }
}

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const TO = 'destek@alo17.tr';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('Hata: .env içinde SMTP_HOST, SMTP_USER, SMTP_PASS tanımlı olmalı.');
  console.error('Alternatif: Tarayıcıda /admin/test-email sayfasını açıp "Gönder" ile destek@alo17.tr adresine test gönderin.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' },
});

const subject = '[TEST] destek@alo17.tr test – bilgisayar ve mobil';
const html = `
  <p>Bu bir test emailidir. <strong>destek@alo17.tr</strong> SMTP ile sorunsuz çalışıyor.</p>
  <p>Gönderim: ${new Date().toLocaleString('tr-TR')}</p>
`;
const text = `Test email – destek@alo17.tr SMTP çalışıyor. ${new Date().toLocaleString('tr-TR')}`;

console.log('SMTP ile test emaili gönderiliyor:', { from: SMTP_USER, to: TO, host: SMTP_HOST, port: SMTP_PORT });

try {
  await transporter.verify();
  console.log('SMTP bağlantısı OK.');
} catch (e) {
  console.error('SMTP bağlantı hatası:', e.message);
  process.exit(1);
}

try {
  const info = await transporter.sendMail({
    from: SMTP_USER,
    to: TO,
    subject,
    html,
    text,
  });
  console.log('Email gönderildi:', info.messageId);
  console.log('destek@alo17.tr kutusunu (bilgisayar ve mobil) kontrol edin.');
} catch (e) {
  console.error('Gönderim hatası:', e.message);
  process.exit(1);
}
