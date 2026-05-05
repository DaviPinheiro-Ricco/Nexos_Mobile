#!/usr/bin/env node
/**
 * prepare-local-build.js
 *
 * Execute este script UMA VEZ após baixar o ZIP do Replit.
 * Ele adapta o projeto para rodar fora do ambiente Replit.
 *
 * Uso:
 *   node artifacts/spi-mobile/prepare-local-build.js
 *
 * (Execute a partir da raiz do projeto extraído)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const log = (msg) => console.log(`[prepare] ${msg}`);
const ok  = (msg) => console.log(`✅ ${msg}`);
const warn = (msg) => console.log(`⚠️  ${msg}`);

// ─── 1. Limpar overrides do esbuild/lightningcss/rollup no pnpm-workspace.yaml
// Esses overrides excluem plataformas não-Linux e só fazem sentido no Replit
log("Atualizando pnpm-workspace.yaml...");
const wsPath = path.join(ROOT, "pnpm-workspace.yaml");
if (fs.existsSync(wsPath)) {
  let ws = fs.readFileSync(wsPath, "utf-8");

  // Remove todos os blocos de overrides de plataforma
  ws = ws.replace(/overrides:\s*\n([\s\S]*?)(?=\n\w|\n#[^\n]*\n\w|$)/m, (match) => {
    // Mantém apenas overrides não relacionados a plataformas binárias
    const lines = match.split("\n");
    const kept = lines.filter(line => {
      const isBinaryOverride =
        line.includes("darwin") ||
        line.includes("win32") ||
        line.includes("freebsd") ||
        line.includes("linux-arm") ||
        line.includes("linux-ia32") ||
        line.includes("linux-loong") ||
        line.includes("linux-mips") ||
        line.includes("linux-ppc") ||
        line.includes("linux-riscv") ||
        line.includes("linux-s390") ||
        line.includes("linux-x64-musl") ||
        line.includes("linux-arm64-musl") ||
        line.includes("netbsd") ||
        line.includes("openbsd") ||
        line.includes("sunos") ||
        line.includes("android-arm") ||
        line.includes("openharmony") ||
        line.includes("aix") ||
        line.includes("ngrok-bin") ||
        line.includes("esbuild-kit");
      return !isBinaryOverride;
    });
    return kept.join("\n");
  });

  // Garante versão do esbuild sem o override restritivo
  ws = ws.replace(/  esbuild: "0\.27\.3"\n?/, "");

  fs.writeFileSync(wsPath, ws, "utf-8");
  ok("pnpm-workspace.yaml atualizado");
} else {
  warn("pnpm-workspace.yaml não encontrado na raiz");
}

// ─── 2. Corrigir o script "dev" do package.json do app mobile
// Remove as variáveis de ambiente específicas do Replit
log("Atualizando artifacts/spi-mobile/package.json...");
const pkgPath = path.join(ROOT, "artifacts", "spi-mobile", "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.scripts.dev = "expo start";
  pkg.scripts.start = "expo start";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  ok("package.json do app atualizado");
}

// ─── 3. Criar .npmrc local para desabilitar minimumReleaseAge fora do Replit
log("Criando .npmrc na raiz...");
const npmrcPath = path.join(ROOT, ".npmrc");
const npmrcContent = `# Gerado por prepare-local-build.js\nauto-install-peers=false\n`;
fs.writeFileSync(npmrcPath, npmrcContent, "utf-8");
ok(".npmrc criado");

// ─── 4. Remover minimumReleaseAge do pnpm-workspace.yaml (não suportado em todos os clientes)
log("Removendo minimumReleaseAge do pnpm-workspace.yaml...");
if (fs.existsSync(wsPath)) {
  let ws = fs.readFileSync(wsPath, "utf-8");
  // Remove o bloco de comentário + a linha minimumReleaseAge
  ws = ws.replace(/# ={10,}[\s\S]*?# ={10,}\n/g, "");
  ws = ws.replace(/minimumReleaseAge: \d+\n?/g, "");
  ws = ws.replace(/minimumReleaseAgeExclude:[\s\S]*?(?=\n\w)/g, "");
  fs.writeFileSync(wsPath, ws, "utf-8");
  ok("minimumReleaseAge removido");
}

// ─── 5. Verificar se o eas.json existe
log("Verificando eas.json...");
const easPath = path.join(ROOT, "artifacts", "spi-mobile", "eas.json");
if (fs.existsSync(easPath)) {
  ok("eas.json encontrado");
} else {
  warn("eas.json não encontrado — verifique se o download está completo");
}

console.log(`
╔════════════════════════════════════════════════════╗
║          Projeto preparado com sucesso!            ║
╠════════════════════════════════════════════════════╣
║  Próximos passos:                                  ║
║                                                    ║
║  1. npm install -g pnpm eas-cli                    ║
║  2. pnpm install                                   ║
║  3. cd artifacts/spi-mobile                        ║
║  4. eas login                                      ║
║  5. eas build --platform android --profile preview ║
║                                                    ║
║  O APK ficará disponível em expo.dev/builds        ║
╚════════════════════════════════════════════════════╝
`);
