# Guia: Gerar APK do SPI Mobile com EAS Build

Este guia explica como baixar o projeto do Replit e gerar o APK para Android
usando o serviço gratuito de build da Expo (EAS Build).

---

## Pré-requisitos

- **Node.js 20 ou superior** → https://nodejs.org (baixe a versão LTS)
- **Conta gratuita no Expo** → https://expo.dev (crie com Google em 1 minuto)
- Conexão com internet

---

## Passo 1 — Baixar o projeto do Replit

1. No Replit, clique nos **três pontos (⋮)** no painel esquerdo
2. Clique em **"Download as zip"**
3. Extraia o ZIP em uma pasta do seu computador  
   Exemplo: `~/projetos/spi-mobile`

---

## Passo 2 — Instalar as ferramentas

Abra o terminal:

```bash
npm install -g eas-cli
```

Verifique:
```bash
eas --version
```

---

## Passo 3 — Login na conta Expo

```bash
eas login
```

> Se criou conta pelo Google (sem senha), vá em **expo.dev → Account Settings → Security → Set password** para definir uma senha, ou use token:
> ```bash
> # Alternativa sem senha: gere um token em expo.dev → Access Tokens
> export EXPO_TOKEN=seu_token_aqui
> ```

---

## Passo 4 — Gerar o APK (comando único)

Na pasta raiz do projeto extraído, execute:

```bash
bash artifacts/spi-mobile/build-apk.sh
```

Este script:
1. Cria uma cópia isolada do app em `/tmp/` (evita conflitos com o monorepo)
2. Inicializa um repositório git limpo
3. Instala as dependências com `npm`
4. Executa o `eas build` automaticamente

O build roda na nuvem da Expo (~10 a 15 minutos).

---

## Passo 5 — Baixar o APK

Quando o build terminar:

1. Acesse **https://expo.dev** → entre na sua conta
2. Vá em **Projects → spi-mobile → Builds**
3. Clique no build concluído → **"Download"**
4. Copie o `.apk` para o celular Android e instale

*(Pode precisar ativar "Instalar de fontes desconhecidas" nas configurações do Android)*

---

## Perfis de build disponíveis

| Perfil | Resultado | Uso |
|--------|-----------|-----|
| `preview` *(padrão do script)* | `.apk` direto | Teste e distribuição interna |
| `production` | `.aab` | Google Play Store |
| `development` | `.apk` com dev client | Debug com Expo Dev Tools |

Para usar outro perfil, edite a última linha do `build-apk.sh`.

---

## Testar sem gerar APK (mais rápido)

Instale o **Expo Go** na Play Store e execute:

```bash
cd artifacts/spi-mobile
npx expo start
```

Escaneie o QR code com o Expo Go.

> ⚠️ O Expo Go só funciona com internet ativa. Para uso offline, use o APK.

---

## Problemas comuns

**`eas: command not found`**  
→ Feche e reabra o terminal após instalar com `npm install -g eas-cli`

**Build falhou por timeout**  
→ Tente novamente — ocasionalmente os servidores da Expo ficam lentos

**`rsync: command not found` (Windows)**  
→ Use o WSL (Windows Subsystem for Linux) ou Git Bash

**`Erro: Package name already in use`**  
→ Altere o `package` no `app.json` para um nome único, ex: `com.suaorganizacao.spimobile`

---

## Identificadores do app

Configurados no `app.json`:

- **Android package:** `br.gov.saude.spi.mobile`
- **iOS bundle ID:** `br.gov.saude.spi.mobile`
- **Versão:** `1.0.0` (versionCode: 1)

Para alterar antes do build, edite `artifacts/spi-mobile/app.json`.
