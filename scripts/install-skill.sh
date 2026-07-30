#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$REPO_ROOT/skills/better-art-direction"
SCOPE="user"
PROJECT_DIR=""
MODE="copy"
FORCE=0

usage() {
  cat <<'HELP'
Установка Better Art Direction для Codex

Использование:
  ./scripts/install-skill.sh --user [--copy|--link] [--force]
  ./scripts/install-skill.sh --project /путь/к/проекту [--copy|--link] [--force]

Параметры:
  --user               Установить в $HOME/.agents/skills (по умолчанию)
  --project <каталог>  Установить в <каталог>/.agents/skills
  --copy               Скопировать навык (по умолчанию)
  --link               Создать символическую ссылку на текущий клон
  --force              Заменить существующую установку
  --help               Показать справку
HELP
}

while (($#)); do
  case "$1" in
    --user)
      SCOPE="user"
      shift
      ;;
    --project)
      [[ $# -ge 2 ]] || { echo "После --project нужен путь" >&2; exit 2; }
      SCOPE="project"
      PROJECT_DIR="$2"
      shift 2
      ;;
    --copy)
      MODE="copy"
      shift
      ;;
    --link)
      MODE="link"
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Неизвестный параметр: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

[[ -f "$SOURCE_DIR/SKILL.md" ]] || { echo "Не найден исходный навык: $SOURCE_DIR" >&2; exit 1; }

if [[ "$SCOPE" == "user" ]]; then
  : "${HOME:?Переменная HOME не задана}"
  DEST_ROOT="$HOME/.agents/skills"
else
  [[ -n "$PROJECT_DIR" ]] || { echo "Для проектной установки укажите --project" >&2; exit 2; }
  mkdir -p "$PROJECT_DIR"
  PROJECT_DIR="$(CDPATH= cd -- "$PROJECT_DIR" && pwd)"
  DEST_ROOT="$PROJECT_DIR/.agents/skills"
fi

DEST_DIR="$DEST_ROOT/better-art-direction"
mkdir -p "$DEST_ROOT"

if [[ -e "$DEST_DIR" || -L "$DEST_DIR" ]]; then
  if [[ "$FORCE" -eq 1 ]]; then
    rm -rf -- "$DEST_DIR"
  else
    echo "Навык уже существует: $DEST_DIR" >&2
    echo "Добавьте --force для замены." >&2
    exit 1
  fi
fi

if [[ "$MODE" == "link" ]]; then
  ln -s "$SOURCE_DIR" "$DEST_DIR"
else
  cp -R "$SOURCE_DIR" "$DEST_DIR"
fi

[[ -f "$DEST_DIR/SKILL.md" ]] || { echo "Установка не завершена: нет SKILL.md" >&2; exit 1; }

echo "✅ Better Art Direction установлен: $DEST_DIR"
echo "🔎 В Codex выполните /skills или вызовите \$better-art-direction."
echo "♻️ Если навык не появился, перезапустите Codex."
