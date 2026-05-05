# SPI Mobile — Guia Completo
## Como baixar, entender e gerar o APK

---

## 1. COMO BAIXAR O CÓDIGO

### No Replit
1. Clique nos **três pontinhos** no topo do painel de arquivos
2. Selecione **"Download as ZIP"**
3. Descompacte o arquivo no seu computador
4. A pasta do app está em: `artifacts/spi-mobile/`

---

## 2. PRÉ-REQUISITOS (instalar no seu PC)

| Ferramenta | Versão mínima | Para que serve |
|---|---|---|
| Node.js | 18+ | Roda JavaScript no computador |
| pnpm | 9+ | Gerenciador de pacotes |
| Expo CLI | via npx | Ferramentas do Expo |
| EAS CLI | via npm | Gera o APK na nuvem |
| Conta Expo | gratuita | Necessária para o build |

```bash
# Instalar pnpm (se não tiver)
npm install -g pnpm

# Instalar EAS CLI
npm install -g eas-cli

# Fazer login no Expo
eas login
```

---

## 3. GERAR O APK (3 opções)

### Opção A — Build na nuvem com EAS (RECOMENDADO, mais fácil)
Não precisa instalar Android Studio. O Expo compila na nuvem deles e te manda o link para baixar.

```bash
# Entrar na pasta do app
cd artifacts/spi-mobile

# Instalar dependências
pnpm install

# Gerar APK de preview (Android)
eas build --profile preview --platform android
```

Após 5–15 minutos, aparece um link para baixar o `.apk`.  
Instale direto no celular Android (ativar "Fontes desconhecidas" nas configurações).

---

### Opção B — Testar instantaneamente com Expo Go (sem build)
Expo Go é um app gratuito que roda seu projeto sem precisar compilar.

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm exec expo start
```

1. Baixe **Expo Go** na Play Store ou App Store
2. Escaneie o QR Code que aparecer no terminal
3. O app abre direto no celular

> ⚠️ Expo Go não suporta módulos nativos customizados. Como este app usa `expo-print` e `expo-sharing`, algumas funções de PDF podem não funcionar no Expo Go — use a Opção A para testar tudo.

---

### Opção C — Build local (precisa do Android Studio)
```bash
# Gerar o projeto nativo Android
pnpm exec expo prebuild --platform android

# Compilar com Gradle
cd android
./gradlew assembleRelease

# O APK fica em:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 4. ESTRUTURA DO PROJETO EXPLICADA

```
artifacts/spi-mobile/
├── app/                    ← Telas do app (Expo Router)
│   ├── _layout.tsx         ← Layout raiz (providers, fontes, auth)
│   ├── login.tsx           ← Tela de login
│   ├── nova-avaliacao.tsx  ← Formulário de nova avaliação
│   ├── avaliacao/[id].tsx  ← Detalhes de uma avaliação
│   └── (tabs)/             ← Telas com barra de navegação inferior
│       ├── _layout.tsx     ← Define as abas (Início, Avaliações, Pacientes, Config)
│       ├── index.tsx       ← Dashboard (tela Início)
│       ├── avaliacoes.tsx  ← Lista de avaliações
│       ├── pacientes.tsx   ← Lista de pacientes
│       └── configuracoes.tsx ← Configurações do sistema
├── context/                ← Estado global do app
│   ├── AuthContext.tsx     ← Autenticação e permissões
│   ├── DbContext.tsx       ← Banco de dados local + seed de dados
│   └── SyncContext.tsx     ← Sincronização com servidor .NET
├── constants/
│   ├── forms.ts            ← Formulários SPI, CARS, M-CHAT-R
│   ├── questions.ts        ← Re-exporta forms.ts (compatibilidade)
│   └── colors.ts           ← Tema de cores do app
├── hooks/
│   └── useColors.ts        ← Hook para acessar as cores do tema
├── utils/
│   └── generatePdf.ts      ← Gerador de PDF das avaliações
├── assets/images/          ← Ícone, logo, splash screen
├── app.json                ← Configuração do app (nome, ícone, pacote Android/iOS)
└── eas.json                ← Perfis de build (preview/production)
```

---

## 5. TECNOLOGIAS USADAS — EXPLICAÇÃO DETALHADA

### 5.1 React Native
**O quê:** Framework da Meta para criar apps mobile com JavaScript/TypeScript.  
**Como funciona:** Você escreve componentes em JavaScript e o React Native os "traduz" para componentes nativos reais do Android (`TextView`, `ImageView`, etc.) e iOS (`UILabel`, `UIImageView`, etc.). Não é um WebView — é código nativo de verdade.

**Componentes usados no app:**
- `View` → equivalente a uma `<div>` do HTML, mas nativa
- `Text` → para exibir texto
- `Image` → exibe imagens locais ou remotas
- `TextInput` → campo de texto editável
- `Pressable` → botão com feedback de toque
- `ScrollView` → área com scroll vertical
- `FlatList` → lista otimizada para muitos itens
- `StyleSheet` → cria estilos (parecido com CSS, mas em objeto JS)

---

### 5.2 Expo SDK 54
**O quê:** Conjunto de ferramentas e bibliotecas que simplificam muito o React Native.  
**Por que usar:** Sem Expo, você precisaria configurar Android Studio, Xcode, Gradle, CocoaPods, etc. Com Expo, você foca só no código do app.

**Módulos Expo usados:**
| Módulo | Função |
|---|---|
| `expo-router` | Navegação baseada em arquivos (como Next.js) |
| `expo-font` | Carrega fontes customizadas (Inter) |
| `expo-haptics` | Vibração do celular (feedback tátil) |
| `expo-print` | Gera PDF a partir de HTML |
| `expo-sharing` | Compartilha arquivos (PDF, etc.) |
| `expo-splash-screen` | Controla a tela de splash |
| `expo-status-bar` | Controla a barra de status do celular |
| `expo-blur` | Efeito de desfoque |
| `expo-linear-gradient` | Gradientes |
| `expo-constants` | Acessa variáveis de ambiente e info do app |

---

### 5.3 Expo Router v6
**O quê:** Sistema de navegação do app baseado na estrutura de pastas.  
**Como funciona:** Cada arquivo `.tsx` dentro de `app/` vira automaticamente uma rota:

```
app/login.tsx              →  /login
app/(tabs)/index.tsx       →  /         (tab Início)
app/(tabs)/pacientes.tsx   →  /pacientes
app/avaliacao/[id].tsx     →  /avaliacao/123  (parâmetro dinâmico)
```

Os parênteses `(tabs)` são grupos — não aparecem na URL.  
O `[id]` entre colchetes é um parâmetro dinâmico (como `:id` no Express).

**Arquivo `_layout.tsx`:** Define o "esqueleto" de cada grupo de rotas. O raiz `app/_layout.tsx` envolve todo o app com os Providers de contexto.

---

### 5.4 React Context API — Estado global
**O quê:** Sistema do React para compartilhar dados entre componentes sem passar props manualmente.

O app tem 3 contextos:

#### `AuthContext` — Autenticação
```typescript
// O que guarda:
- user: { id, nome, email, role, groupIds }
- token: string
- isLoading: boolean

// Funções:
- login(email, senha)      → chama API .NET real
- loginDemo(nome, role)    → login offline sem servidor
- logout()
- isAdmin(), canViewDashboard(), canCreateEvaluations()...
```

#### `DbContext` — Banco de dados local
```typescript
// O que guarda:
- patients: Patient[]      → lista de pacientes
- evaluations: Evaluation[] → lista de avaliações

// Funções:
- addPatient(), updatePatient()
- addEvaluation(), updateEvaluation()
- clearAllData()           → limpa tudo (reset demo)
```
Usa `AsyncStorage` como banco de dados (JSON salvo no dispositivo).

#### `SyncContext` — Sincronização
```typescript
// O que guarda:
- isOnline: boolean        → tem internet?
- isSyncing: boolean       → está sincronizando?
- pendingCount: number     → quantos itens aguardam sync

// Sincroniza automaticamente a cada 30 segundos quando online
```

---

### 5.5 AsyncStorage — Armazenamento offline
**O quê:** Banco de dados simples do React Native, salva dados como pares chave/valor (igual ao `localStorage` do navegador, mas para mobile).

**Como o app usa:**
```typescript
// Salvar pacientes
await AsyncStorage.setItem("spi_db_patients", JSON.stringify(patients));

// Ler pacientes
const raw = await AsyncStorage.getItem("spi_db_patients");
const patients = JSON.parse(raw ?? "[]");

// Chaves usadas no app:
"spi_token"          → token JWT do usuário logado
"spi_user"           → dados do usuário logado
"spi_api_url"        → URL do servidor .NET configurada
"spi_db_patients"    → todos os pacientes
"spi_db_evaluations" → todas as avaliações
```

Os dados persistem mesmo fechando o app.

---

### 5.6 TypeScript
**O quê:** JavaScript com tipagem estática — detecta erros antes de rodar.

**Tipos principais definidos no app:**
```typescript
type UserRole = "admin" | "analista" | "agente_saude" | "gestor";

interface Patient {
  id: string;
  nome: string;
  dataNascimento: string;
  groupId?: number;
  // ...
}

interface Evaluation {
  id: string;
  patientId: string;
  formType: "SPI" | "CARS" | "M-CHAT-R";
  answers: Record<string, number>;
  scoreTotal: number;
  // ...
}
```

---

### 5.7 Formulários de avaliação (SPI, CARS, M-CHAT-R)
Definidos em `constants/forms.ts`. Cada formulário é um objeto com:
```typescript
{
  id: "SPI",
  name: "SPI — Sistema de Prevalência e Indicadores",
  questions: [
    {
      id: "q1",
      text: "Contato visual...",
      options: [
        { value: 1, label: "Normal para a idade" },
        { value: 2, label: "Levemente anormal" },
        // ...
      ]
    },
    // ... 14 questões no total para SPI
  ]
}
```
A pontuação é calculada somando os `value` de cada resposta.  
Classificação TEA pelo score total (SPI): ≤ 29,5 = Sem TEA / 30–36 = Leve/Mod. / ≥ 37 = Grave

---

### 5.8 Geração de PDF (`utils/generatePdf.ts`)
**Fluxo:**
1. Monta uma string HTML completa com os dados da avaliação
2. `expo-print` converte o HTML em PDF e retorna um URI de arquivo
3. `expo-sharing` abre o menu nativo de compartilhamento (WhatsApp, email, salvar, etc.)

```typescript
const { uri } = await Print.printToFileAsync({ html: htmlContent });
await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
```

---

### 5.9 Nova Arquitetura do React Native (`newArchEnabled: true`)
O app está configurado com a **Nova Arquitetura** do React Native (JSI + Fabric).  
**Diferença prática:** Comunicação mais rápida entre JavaScript e código nativo. Animações e gestos mais fluidos. É o padrão do futuro — o app já está preparado.

---

### 5.10 React Compiler (`reactCompiler: true`)
Otimização experimental do React que analisa o código e elimina `useMemo`/`useCallback` desnecessários automaticamente. O app já tem isso habilitado.

---

## 6. FLUXO COMPLETO DO APP

```
Abrir app
    ↓
_layout.tsx carrega fontes + verifica AsyncStorage (tem token salvo?)
    ↓
NÃO tem token → tela Login
    ↓
Login com servidor real (JWT) OU Demo (offline)
    ↓
DbContext carrega pacientes/avaliações do AsyncStorage
    ↓
Se modo demo → seed automático com 10 pacientes, 10 avaliações, 2 grupos, 10 agentes
    ↓
Tela inicial (tabs):
  ├── Início: dashboard com stats e avaliações recentes
  ├── Avaliações: lista com filtro por formulário/score
  ├── Pacientes: lista com badge de grupo
  └── Config: dados do usuário, grupos, agentes, sync manual
    ↓
Nova Avaliação:
  1. Seleciona paciente
  2. Seleciona formulário (SPI/CARS/M-CHAT-R)
  3. Responde questões (barra de progresso)
  4. Score calculado automaticamente
  5. Salvo no AsyncStorage
  6. Se online → enviado para API .NET
    ↓
Exportar PDF:
  Botão compartilhar → gera HTML → converte em PDF → abre menu nativo
```

---

## 7. CONECTAR COM A API .NET

O app foi projetado para funcionar com um backend .NET. Para configurar:

1. No app, vá em **Login** → toque em "Configurar endereço do servidor"
2. Digite o IP/URL do servidor (ex: `http://192.168.1.100:5080`)
3. O app salva e usa essa URL para login e sync

**Endpoints esperados pela API:**
```
POST /api/auth/login          → { email, senha } → { token, user }
GET  /api/pacientes           → lista de pacientes
POST /api/pacientes           → criar paciente
PUT  /api/pacientes/{id}      → atualizar paciente
GET  /api/avaliacoes          → lista de avaliações
POST /api/avaliacoes          → criar avaliação
PUT  /api/avaliacoes/{id}     → atualizar avaliação
```

---

## 8. PERSONALIZAR PARA OUTRO ESTADO/MUNICÍPIO

Para adaptar o app para outra secretaria de saúde:

1. **Nome e ícone:** editar `app.json` → campos `name` e `icon`
2. **Cores:** editar `constants/colors.ts` → mudar `primary` e derivados
3. **Formulários:** editar `constants/forms.ts` → adicionar/remover questões
4. **ID Android:** editar `app.json` → `android.package` (ex: `br.sp.saude.tea`)
5. **ID iOS:** editar `app.json` → `ios.bundleIdentifier`

---

## 9. PUBLICAR NA PLAY STORE

```bash
# 1. Gerar AAB (Android App Bundle) para produção
eas build --profile production --platform android

# 2. Submeter para revisão do Google
eas submit --platform android
```

Você precisa de uma conta de desenvolvedor Google Play (~$25 uma vez só).

---

*Guia gerado para o projeto SPI Mobile — Sistema de Prevalência e Indicadores de Saúde (TEA)*
