#!/usr/bin/env bash
# Sunucudan mail.alo17.tr SMTP portlarını test et (587 ve 465).
# SSH ile sunucuya bağlanıp: cd /var/www/alo17 && bash scripts/check-smtp-from-server.sh

HOST="mail.kurumsaleposta.com"

test_port() {
  local port=$1
  echo ""
  echo "=== $HOST:$port TCP testi ==="
  if command -v nc &>/dev/null; then
    if nc -zv -w5 "$HOST" "$port" 2>&1; then
      echo "Sonuc: Port $port ACILIR (nc)"
      return 0
    fi
  fi
  if command -v timeout &>/dev/null; then
    if timeout 5 bash -c "echo >/dev/tcp/$HOST/$port" 2>/dev/null; then
      echo "Sonuc: Port $port ACILIR (bash)"
      return 0
    fi
  fi
  if command -v python3 &>/dev/null; then
    if python3 -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(5)
try:
  s.connect(('$HOST', $port))
  print('Sonuc: Port $port ACILIR (python3)')
  s.close()
except Exception as e:
  print('Sonuc: Port $port ULASILAMADI -', e)
  exit(1)
" 2>/dev/null; then
      return 0
    fi
  fi
  echo "Sonuc: Port $port ULASILAMADI veya timeout"
  return 1
}

echo "SMTP baglanti testi (sunucudan $HOST)"
test_port 587
p587=$?
test_port 465
p465=$?

echo ""
if [ $p587 -eq 0 ]; then
  echo "587 acik - mevcut SMTP_PORT=587 ile calismali."
elif [ $p465 -eq 0 ]; then
  echo "465 acik - .env icinde SMTP_PORT=465 ve SMTP_SECURE=true yapip pm2 restart alo17 deneyin."
else
  echo "Hem 587 hem 465 ulasilamiyor. Firewall/hosting giden SMTP portlarini kapatıyor olabilir; mail sunucu tarafinda da bu IP'ye izin verilmeyebilir."
fi
