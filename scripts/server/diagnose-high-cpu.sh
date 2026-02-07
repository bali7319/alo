#!/usr/bin/env bash
set -euo pipefail

# Alo17 quick server diagnosis for high CPU.
# Run on the Linux server (as a user with sudo).
#
# Usage:
#   bash diagnose-high-cpu.sh | tee /tmp/alo17-high-cpu.txt
#

section() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

cmd() {
  echo
  echo "+ $*"
  # shellcheck disable=SC2068
  $@ || true
}

section "Host / time"
cmd date -Is
cmd uname -a
cmd uptime

section "CPU / memory / disk overview"
cmd nproc
cmd free -h
cmd df -h

section "Top CPU processes (snapshot)"
cmd ps -eo pid,ppid,cmd,%cpu,%mem --sort=-%cpu | head -20

section "Systemd units (nginx/pm2/node/postgres)"
cmd systemctl --no-pager --full status nginx
cmd systemctl --no-pager --full status pm2-root || true
cmd systemctl --no-pager --full status postgresql || true
cmd systemctl --no-pager --full status postgresql@12-main || true

section "Listening ports"
if command -v ss >/dev/null 2>&1; then
  cmd ss -lntup
else
  cmd netstat -lntup
fi

section "Nginx config check"
if command -v nginx >/dev/null 2>&1; then
  cmd nginx -t
  echo
  echo "[INFO] Checking for alo17 bot-mitigation include..."
  # nginx -T can be large; we only grep for the include
  nginx -T 2>/dev/null | grep -n "alo17-bot-mitigation.conf" || true
fi

section "Recent nginx errors (last 200 lines)"
if [ -f /var/log/nginx/error.log ]; then
  cmd sudo tail -n 200 /var/log/nginx/error.log
else
  echo "No /var/log/nginx/error.log"
fi

section "Top requested paths (nginx access.log)"
ACCESS_LOG=""
for f in /var/log/nginx/access.log /var/log/nginx/alo17.access.log /var/log/nginx/*access*.log; do
  if [ -f "$f" ]; then
    ACCESS_LOG="$f"
    break
  fi
done

if [ -n "$ACCESS_LOG" ]; then
  echo "[INFO] Using access log: $ACCESS_LOG"
  # Works with common combined log format:
  # ... "GET /path?query HTTP/1.1" 200 ...
  cmd bash -lc "awk -F\\\" '{print \$2}' \"$ACCESS_LOG\" | awk '{print \$2}' | sed 's#\\?.*##' | sort | uniq -c | sort -nr | head -30"
  echo
  echo "[INFO] Top user agents (approx)"
  cmd bash -lc "awk -F\\\" '{print \$6}' \"$ACCESS_LOG\" | sort | uniq -c | sort -nr | head -20"
else
  echo "No nginx access log found under /var/log/nginx"
fi

section "PM2 (if installed)"
if command -v pm2 >/dev/null 2>&1; then
  cmd pm2 ls
  cmd pm2 status
  cmd pm2 describe all
fi

section "Node processes details"
cmd pgrep -a node || true

section "Postgres quick health"
if command -v pg_isready >/dev/null 2>&1; then
  cmd pg_isready || true
fi

section "Done"
echo "Attach the output file for analysis."

