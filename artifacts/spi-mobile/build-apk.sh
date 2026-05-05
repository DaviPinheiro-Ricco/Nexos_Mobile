#!/usr/bin/env bash
# =============================================================================
# build-apk.sh — Gera o APK do SPI Mobile via EAS Build
#
# Uso (a partir da raiz do projeto baixado):
#   bash artifacts/spi-mobile/build-apk.sh
#
# O script cria um diretório isolado com apenas o app mobile e roda o
# EAS Build a partir dele, evitando conflitos com o monorepo.
# =============================================================================
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="/tmp/spi-mobile-eas-$(date +%s)"

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║         SPI Mobile — EAS APK Build        ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# ── Pré-requisitos ────────────────────────────────────────────────────────────
if ! command -v eas &> /dev/null; then
  echo "❌  EAS CLI não encontrado. Instale com: npm install -g eas-cli"
  exit 1
fi

if ! command -v git &> /dev/null; then
  echo "❌  git não encontrado."
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌  npm não encontrado. Instale o Node.js primeiro."
  exit 1
fi

echo "📂 Criando diretório isolado: $BUILD_DIR"
mkdir -p "$BUILD_DIR"

# ── Copiar arquivos do app (excluindo node_modules, .expo, dist, .git) ────────
echo "📋 Copiando arquivos do app..."
rsync -a \
  --exclude='node_modules' \
  --exclude='.expo' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env.local' \
  "$APP_DIR/" \
  "$BUILD_DIR/"

cd "$BUILD_DIR"

# ── Criar repositório git limpo (EAS exige) ───────────────────────────────────
echo "🔧 Inicializando repositório git..."
git init -q
git config user.email "build@spi.local"
git config user.name "SPI Build"
git add -A
git commit -q -m "eas build" --no-verify

# ── Instalar dependências com npm ─────────────────────────────────────────────
echo "📦 Instalando dependências com npm..."
npm install --legacy-peer-deps --prefer-offline 2>&1 | tail -5

# ── Rodar o build ─────────────────────────────────────────────────────────────
echo ""
echo "🚀 Iniciando EAS Build (Android APK — profile: preview)..."
echo ""
eas build --profile preview --platform android

echo ""
echo "✅ Pronto! O APK estará disponível em: https://expo.dev/builds"
echo "   Diretório isolado usado: $BUILD_DIR"
echo "   (pode apagar depois com: rm -rf $BUILD_DIR)"
