#!/usr/bin/env bash
set -euo pipefail

PG_HOST="${PG_HOST:-127.0.0.1}"
PG_PORT="${PG_PORT:-5432}"
PG_UNIT="${PG_UNIT:-postgresql@12-main}"

ALERT_EMAIL_TO="${ALERT_EMAIL_TO:-}"
ALERT_EMAIL_FROM="${ALERT_EMAIL_FROM:-}"
ALERT_COOLDOWN_SEC="${ALERT_COOLDOWN_SEC:-1800}" # 30dk
ALERT_STATE_FILE="${ALERT_STATE_FILE:-/var/tmp/alo17-db-watchdog.lastalert}"

# Optional SMTP (python3) fallback when local mail/sendmail is not configured
SMTP_HOST="${SMTP_HOST:-}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_USER="${SMTP_USER:-}"
SMTP_PASS="${SMTP_PASS:-}"
SMTP_TLS="${SMTP_TLS:-true}"

log() {
  # log to journald (systemd will capture stdout anyway); also mirror to syslog
  echo "[alo17-db-watchdog] $*"
  logger -t alo17-db-watchdog -- "$*" 2>/dev/null || true
}

should_send_alert() {
  # Avoid spamming: only one alert per cooldown window
  local now
  now="$(date +%s)"
  if [ -f "$ALERT_STATE_FILE" ]; then
    local last
    last="$(cat "$ALERT_STATE_FILE" 2>/dev/null || echo 0)"
    if [ "$last" -gt 0 ] && [ $((now - last)) -lt "$ALERT_COOLDOWN_SEC" ]; then
      return 1
    fi
  fi
  echo "$now" > "$ALERT_STATE_FILE" 2>/dev/null || true
  return 0
}

send_email_alert() {
  local subject="$1"
  local body="$2"

  if [ -z "$ALERT_EMAIL_TO" ]; then
    log "ALERT_EMAIL_TO not set; skipping email alert."
    return 0
  fi

  if ! should_send_alert; then
    log "Alert suppressed by cooldown (ALERT_COOLDOWN_SEC=${ALERT_COOLDOWN_SEC})."
    return 0
  fi

  # 1) Prefer local 'mail'
  if command -v mail >/dev/null 2>&1; then
    if [ -n "$ALERT_EMAIL_FROM" ]; then
      echo "$body" | mail -a "From: ${ALERT_EMAIL_FROM}" -s "$subject" "$ALERT_EMAIL_TO" || true
    else
      echo "$body" | mail -s "$subject" "$ALERT_EMAIL_TO" || true
    fi
    log "Email alert attempted via local mail to $ALERT_EMAIL_TO."
    return 0
  fi

  # 2) Fallback to sendmail if present
  if command -v sendmail >/dev/null 2>&1; then
    {
      if [ -n "$ALERT_EMAIL_FROM" ]; then
        echo "From: $ALERT_EMAIL_FROM"
      fi
      echo "To: $ALERT_EMAIL_TO"
      echo "Subject: $subject"
      echo
      echo "$body"
    } | sendmail -t || true
    log "Email alert attempted via sendmail to $ALERT_EMAIL_TO."
    return 0
  fi

  # 3) SMTP via python3 (no external packages)
  if command -v python3 >/dev/null 2>&1 && [ -n "$SMTP_HOST" ]; then
    python3 - <<'PY' || true
import os, ssl, smtplib
from email.message import EmailMessage

to_addr = os.environ.get("ALERT_EMAIL_TO", "")
from_addr = os.environ.get("ALERT_EMAIL_FROM") or to_addr
subject = os.environ.get("__ALERT_SUBJECT__", "alo17 DB alert")
body = os.environ.get("__ALERT_BODY__", "")

host = os.environ.get("SMTP_HOST", "")
port = int(os.environ.get("SMTP_PORT", "587"))
user = os.environ.get("SMTP_USER", "")
pw = os.environ.get("SMTP_PASS", "")
use_tls = (os.environ.get("SMTP_TLS", "true").lower() == "true")

msg = EmailMessage()
msg["To"] = to_addr
msg["From"] = from_addr
msg["Subject"] = subject
msg.set_content(body)

if not host or not to_addr:
    raise SystemExit(0)

if use_tls:
    context = ssl.create_default_context()
    with smtplib.SMTP(host, port, timeout=15) as s:
        s.ehlo()
        s.starttls(context=context)
        s.ehlo()
        if user and pw:
            s.login(user, pw)
        s.send_message(msg)
else:
    with smtplib.SMTP(host, port, timeout=15) as s:
        if user and pw:
            s.login(user, pw)
        s.send_message(msg)
PY
    log "Email alert attempted via SMTP (python3) to $ALERT_EMAIL_TO."
    return 0
  fi

  log "No mailer available (mail/sendmail/python3+SMTP_HOST). Skipping email alert."
  return 0
}

if pg_isready -h "$PG_HOST" -p "$PG_PORT" >/dev/null 2>&1; then
  exit 0
fi

log "DB is not ready at ${PG_HOST}:${PG_PORT}. Attempting to start/restart ${PG_UNIT}..."

systemctl start "${PG_UNIT}.service" >/dev/null 2>&1 || true
sleep 2

if pg_isready -h "$PG_HOST" -p "$PG_PORT" >/dev/null 2>&1; then
  log "DB recovered."
  exit 0
fi

log "DB still not ready. Restarting ${PG_UNIT}..."
systemctl restart "${PG_UNIT}.service" >/dev/null 2>&1 || true
sleep 3

if pg_isready -h "$PG_HOST" -p "$PG_PORT" >/dev/null 2>&1; then
  log "DB recovered after restart."
  exit 0
fi

log "DB still down after restart attempt."
export __ALERT_SUBJECT__="[alo17] DB DOWN on $(hostname -f 2>/dev/null || hostname)"
export __ALERT_BODY__="DB is still down after restart attempt.

Host: $(hostname -f 2>/dev/null || hostname)
Time: $(date -Is)
Check: pg_isready -h ${PG_HOST} -p ${PG_PORT}
Unit: ${PG_UNIT}.service

Hint:
- systemctl status ${PG_UNIT}.service
- journalctl -u ${PG_UNIT}.service -n 200 --no-pager
"
send_email_alert "$__ALERT_SUBJECT__" "$__ALERT_BODY__"
exit 2

