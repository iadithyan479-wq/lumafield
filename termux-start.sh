#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${1:-${PORT:-8000}}"

if [[ ! "$PORT" =~ ^[0-9]{1,5}$ ]] || (( PORT < 1024 || PORT > 65535 )); then
  echo "Usage: $0 [port] (choose an unprivileged port from 1024 to 65535)" >&2
  exit 2
fi

if ! command -v python >/dev/null 2>&1; then
  echo "Python is not installed. In Termux run: pkg install python" >&2
  exit 1
fi

if [[ ! -f "$APP_DIR/index.html" ]]; then
  echo "Cannot find LumaField index.html in $APP_DIR" >&2
  exit 1
fi

cd "$APP_DIR"
printf '\nLumaField is running on this Android device.\n'
printf 'Open http://127.0.0.1:%s in Chrome (or another Android browser).\n' "$PORT"
printf 'Keep this Termux session running while you use the app. Stop with Ctrl+C.\n\n'
exec python -m http.server "$PORT" --bind 127.0.0.1
