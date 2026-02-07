#!/usr/bin/env bash
set -euo pipefail

CONF="/etc/nginx/sites-enabled/alo17"
SNIP="/etc/nginx/snippets/alo17-bot-mitigation.conf"

if [[ ! -f "$SNIP" ]]; then
  echo "[ERROR] Missing snippet: $SNIP" >&2
  exit 1
fi

ts="$(date +%Y%m%d_%H%M%S)"
cp "$CONF" "$CONF.bak.$ts"
echo "[OK] Backup: $CONF.bak.$ts"

if ! grep -q "alo17-bot-mitigation.conf" "$CONF"; then
  awk '
    $0 ~ /server_name[[:space:]]+alo17\.tr/ {
      print;
      print "    include /etc/nginx/snippets/alo17-bot-mitigation.conf;";
      next
    }
    { print }
  ' "$CONF" > /tmp/alo17-nginx && mv /tmp/alo17-nginx "$CONF"
  echo "[OK] Inserted include into $CONF"
else
  echo "[OK] Include already present in $CONF"
fi

echo "[INFO] nginx -t"
nginx -t

echo "[INFO] Reloading nginx"
systemctl reload nginx

echo "[OK] Done"

