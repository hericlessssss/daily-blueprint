#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
LOG_FILE="$LOG_DIR/cron.log"
LOCK_FILE="$LOG_DIR/generate.lock"

mkdir -p "$LOG_DIR"

{
  echo "[$(date -Is)] daily-blueprint run started"

  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    echo "[$(date -Is)] another run is already active"
    exit 0
  fi

  cd "$ROOT_DIR"
  npm run generate

  echo "[$(date -Is)] daily-blueprint run finished"
} >>"$LOG_FILE" 2>&1
