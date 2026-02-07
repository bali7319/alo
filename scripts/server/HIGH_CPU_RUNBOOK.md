# Alo17 Sunucu CPU %100+ – Hızlı Teşhis ve Müdahale

## 1) Sunucuda teşhis çıktısını al

Sunucuda çalıştır:

```bash
curl -fsSL https://raw.githubusercontent.com/<REPO>/<BRANCH>/scripts/server/diagnose-high-cpu.sh -o /tmp/diagnose-high-cpu.sh
bash /tmp/diagnose-high-cpu.sh | tee /tmp/alo17-high-cpu.txt
```

Eğer dosya zaten sunucuda varsa:

```bash
bash diagnose-high-cpu.sh | tee /tmp/alo17-high-cpu.txt
```

Sonra `/tmp/alo17-high-cpu.txt` içeriğini buraya yapıştır.

## 2) En sık çıkan kök nedenler

### A) Bot/scan trafiği (nginx access log’da belli olur)
- Belirti: `node`/`next` CPU yüksek + access log’da aynı path’lere çok istek
- Hızlı çözüm: `scripts/alo17-bot-mitigation.conf` snippet’ini nginx config’e include etmek
  - Repo’da hazır: `scripts/apply-nginx-bot-mitigation.sh`

### B) Middleware/uygulama pahalı işlemleri
- Belirti: Trafik normal ama request başına maliyet yüksek
- Repo düzeltmesi: `src/middleware.ts` içinde `getToken()` aynı request’te tek sefer çalışacak şekilde optimize edildi.

### C) Postgres (indeks / ağır sorgu)
- Belirti: `postgres` CPU yüksek
- Sonraki adım: `pg_stat_statements` ve slow query analizi

## 3) Bot mitigation’i uygula (opsiyonel hızlı adım)

```bash
sudo cp ./scripts/alo17-bot-mitigation.conf /etc/nginx/snippets/alo17-bot-mitigation.conf
sudo bash ./scripts/apply-nginx-bot-mitigation.sh
```

## 4) Notlar

- CPU %100 görünen yerlerde (panelde %101 gibi), genelde **tek çekirdek** tam doludur.
- Teşhis için en hızlı yol: “Hangi proses” + “Hangi endpoint” sorularını netleştirmek.

