# SPI Mobile — Documentação Técnica de Arquitetura

> **Sistema de Prevalência e Indicadores de Saúde — TEA**  
> Aplicativo mobile para triagem do Transtorno do Espectro Autista (TEA) por agentes de saúde pública.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Por que AsyncStorage e não SQLite](#3-por-que-asyncstorage-e-não-sqlite)
4. [Estrutura de Arquivos](#4-estrutura-de-arquivos)
5. [Arquitetura de Estado — Três Contextos](#5-arquitetura-de-estado--três-contextos)
6. [Modelos de Dados](#6-modelos-de-dados)
7. [Formulários Clínicos](#7-formulários-clínicos)
8. [Navegação — Expo Router](#8-navegação--expo-router)
9. [Sincronização Offline-First](#9-sincronização-offline-first)
10. [Contrato com o Servidor .NET](#10-contrato-com-o-servidor-net)
11. [Configuração da URL do Servidor](#11-configuração-da-url-do-servidor)
12. [Geração de PDF](#12-geração-de-pdf)
13. [Sistema de Design e Temas](#13-sistema-de-design-e-temas)
14. [Build e Deploy — EAS](#14-build-e-deploy--eas)
15. [TypeScript e Ferramental](#15-typescript-e-ferramental)

---

## 1. Visão Geral

O SPI Mobile é um app **offline-first** para Android (e iOS/Web em modo de desenvolvimento). O agente de saúde pode cadastrar pacientes, aplicar formulários de triagem e consultar resultados **sem nenhuma conexão com a internet**. Quando o dispositivo detecta o servidor da secretaria, os dados são enviados automaticamente em background.

### Fluxo de vida de um dado

```
[Agente cria avaliação]
        │
        ▼
[DbContext salva no AsyncStorage]
[syncStatus = "pending"]
        │
        ▼
[SyncContext verifica a cada 30s]
[GET /api/healthz → servidor respondeu?]
        │
   ┌────┴────┐
  Sim       Não
   │         │
   ▼         ▼
[POST /api/evaluations]   [Fica na fila]
[syncStatus = "synced"]
[GET /api/patients + /api/evaluations → merge]
```

---

## 2. Stack Tecnológica

### Core

| Biblioteca | Versão | Razão da escolha |
|---|---|---|
| **React Native** | 0.81.5 | Framework cross-platform com acesso a APIs nativas |
| **Expo SDK** | 54 | Abstrai câmera, haptics, PDF, splash, fontes sem configuração nativa manual |
| **Expo Router** | v6 | Navegação baseada em sistema de arquivos (file-based routing) — elimina boilerplate de navegação |
| **TypeScript** | ~5.9.2 | Tipagem estática — evita bugs em runtime, especialmente em dados vindos da API |
| **React** | 19.1.0 | Versão mais recente com React Compiler habilitado |

### Persistência

| Biblioteca | Versão | Razão da escolha |
|---|---|---|
| **@react-native-async-storage/async-storage** | 2.2.0 | Armazenamento chave-valor assíncrono, zero configuração nativa extra (ver seção 3) |

### UI e Experiência

| Biblioteca | Versão | Razão da escolha |
|---|---|---|
| **@expo/vector-icons (Feather)** | ^15.0.3 | Ícones vetoriais prontos — Android e Web |
| **expo-symbols (SymbolView)** | ~1.0.8 | SF Symbols nativos do iOS — ícones com animação e peso tipográfico do sistema |
| **expo-blur** | ~15.0.8 | Tab bar com efeito vidro fosco (frosted glass) no iOS |
| **expo-haptics** | ~15.0.8 | Feedback tátil (vibração) ao selecionar respostas do formulário |
| **react-native-safe-area-context** | ~5.6.0 | Insets corretos para notch, Dynamic Island, barra de navegação Android |
| **react-native-gesture-handler** | ~2.28.0 | Gestos nativos de alta performance (obrigatório para Expo Router) |
| **react-native-keyboard-controller** | 1.18.5 | Controle de teclado suave com animações — melhora UX em formulários |
| **@expo-google-fonts/inter** | ^0.4.0 | Fonte Inter em 4 pesos (400/500/600/700) — tipografia consistente |

### Funcionalidades Nativas

| Biblioteca | Versão | Razão da escolha |
|---|---|---|
| **expo-print** | ~15.0.8 | Converte HTML em PDF no dispositivo (sem servidor) |
| **expo-sharing** | ~14.0.8 | Abre o compartilhamento nativo (WhatsApp, e-mail, Drive, etc.) |
| **expo-splash-screen** | ~31.0.12 | Controla quando a splash screen some (aguarda fontes carregarem) |
| **expo-linear-gradient** | ~15.0.8 | Gradientes nativos |
| **expo-image** | ~3.0.11 | Componente de imagem otimizado com cache |

### Estado e Cache

| Biblioteca | Versão | Razão da escolha |
|---|---|---|
| **@tanstack/react-query** | ^5.90.21 | Disponível para futuras queries com cache, retry, background refetch |
| **zod** | ^3.25.76 | Validação de schema em runtime (disponível para validar respostas da API) |

### Build

| Biblioteca | Razão da escolha |
|---|---|
| **react-native-reanimated** | Animações em thread nativa (obrigatório pelo gesture handler) |
| **react-native-screens** | Otimização de memória: renderiza telas nativas reais em vez de Views |
| **react-native-web** | Permite rodar o app no navegador (modo desenvolvimento/preview) |
| **babel-plugin-react-compiler** | Compilador experimental React 19 — memoização automática |

---

## 3. Por que AsyncStorage e não SQLite

Esta é uma decisão de arquitetura deliberada, não uma limitação. Abaixo a análise completa.

### O que foi considerado

**expo-sqlite** (Expo SDK 54 inclui nativamente):
- Banco relacional completo com SQL
- WAL mode, transações, índices
- Ideal para datasets grandes (10.000+ registros), queries complexas com JOIN, filtragens em colunas

**@react-native-async-storage/async-storage**:
- Armazenamento chave-valor (JSON serializado)
- API 100% Promise-based, sem SQL
- Zero setup nativo adicional
- Leitura e gravação de coleções inteiras como arrays JSON

### Por que AsyncStorage foi escolhido

**1. Volume de dados compatível**

O SPI opera por município/UBS. Um agente de saúde atende em média 150–400 famílias. Mesmo com 1.000 pacientes × 5 avaliações cada = 5.000 objetos. JSON serializado de 5.000 objetos `LocalEvaluation` ≈ 2–4 MB — dentro do limite confortável do AsyncStorage (sem restrição documentada abaixo de 50 MB no Android).

**2. Modelo de dados plano**

Os dados do SPI são naturalmente planos:
- `LocalPatient` — 18 campos simples, sem arrays aninhados
- `LocalEvaluation` — `respostas: Record<number, number>` é um mapa simples

Não há queries com JOIN, GROUP BY, ou agregações que justifiquem SQL. Toda filtragem e ordenação é feita em JavaScript sobre arrays em memória (`.filter()`, `.sort()`, `useMemo()`).

**3. Estratégia de sync simplificada**

O sync é baseado em **snapshots completos** (ver seção 9). O servidor retorna todos os pacientes e avaliações do usuário, e o app substitui o estado local. Com SQLite isso exigiria `INSERT OR REPLACE`, `DELETE WHERE id NOT IN (...)` e gestão de transações. Com AsyncStorage é uma única chamada `AsyncStorage.setItem(KEY, JSON.stringify(mergedArray))`.

**4. Nenhum módulo nativo adicional**

`expo-sqlite` com a nova API assíncrona do Expo SDK 53+ funciona bem, mas adiciona um módulo nativo ao bundle. `@react-native-async-storage/async-storage` já é dependência transitiva de vários pacotes Expo e não adiciona nada ao bundle nativo.

**5. Modelo mental mais simples para manutenção**

O time que vai dar manutenção no futuro é de saúde pública, não de engenharia. O código que usa AsyncStorage é lido como "pega o JSON, faz o parse, filtra o array, salva de volta" — sem necessidade de entender SQL ou schema migrations.

### Quando SQLite seria a escolha certa

- Se o app precisasse guardar **histórico de anos** de avaliações (10.000+ por dispositivo)
- Se houvesse **queries analíticas** locais (médias por UBS, correlações, etc.)
- Se os dados precisassem de **índices** para busca rápida por CPF em bases grandes
- Se múltiplas **threads/workers** precisassem acessar o banco simultaneamente

### Migração futura

Se o volume crescer, a migração para SQLite é isolada no `DbContext.tsx`. As assinaturas públicas (`addPatient`, `addEvaluation`, etc.) não mudam — só a implementação interna muda. Nenhum componente de tela precisaria ser alterado.

---

## 4. Estrutura de Arquivos

```
artifacts/spi-mobile/
│
├── app/                          # Expo Router — cada arquivo = uma rota
│   ├── _layout.tsx               # Root layout: providers, AuthGate, Stack navigator
│   ├── login.tsx                 # /login — tela de autenticação
│   ├── nova-avaliacao.tsx        # /nova-avaliacao — modal de nova avaliação (5 steps)
│   ├── +not-found.tsx            # Rota 404
│   ├── avaliacao/
│   │   └── [id].tsx              # /avaliacao/:id — detalhe de avaliação + PDF export
│   ├── paciente/
│   │   └── [id].tsx              # /paciente/:id — detalhe de paciente
│   └── (tabs)/                   # Grupo de rotas com tab bar
│       ├── _layout.tsx           # Configuração da tab bar (4 abas)
│       ├── index.tsx             # / → Aba Início (dashboard + ações rápidas)
│       ├── avaliacoes.tsx        # /avaliacoes → Lista com filtros
│       ├── pacientes.tsx         # /pacientes → Lista + modal de cadastro
│       └── configuracoes.tsx     # /configuracoes → Sync, URL API, seed, logout
│
├── context/                      # Estado global via React Context
│   ├── AuthContext.tsx           # Sessão do usuário, token, permissões por role
│   ├── DbContext.tsx             # Banco local (pacientes + avaliações) em AsyncStorage
│   └── SyncContext.tsx           # Sincronização background com o servidor .NET
│
├── constants/
│   ├── forms.ts                  # Definição dos 3 formulários (SPI, CARS, M-CHAT-R)
│   ├── questions.ts              # Re-export de compatibilidade para SPI_QUESTIONS
│   └── colors.ts                 # Design tokens de cores (light mode)
│
├── utils/
│   ├── apiUrl.ts                 # Resolução da URL do servidor (prioridade: storage > env > null)
│   └── generatePdf.ts            # Geração de PDF via HTML → expo-print
│
├── hooks/
│   └── useColors.ts              # Hook que retorna tokens do tema atual (light/dark)
│
├── components/
│   ├── ErrorBoundary.tsx         # Captura erros React em produção
│   ├── ErrorFallback.tsx         # UI de fallback quando há crash
│   └── KeyboardAwareScrollViewCompat.tsx  # ScrollView com comportamento de teclado cross-platform
│
├── assets/images/
│   ├── icon.png                  # Ícone do app (512×512 recomendado)
│   └── logo.png                  # Logo exibido no header (transparente, SVG exportado como PNG)
│
├── app.json                      # Configuração Expo: nome, bundle ID, plugins, orientação
├── eas.json                      # Profiles de build: development / preview / production
├── package.json                  # Dependências standalone (não usa workspace catalog)
├── tsconfig.json                 # TS estrito com path alias @/* → raiz do projeto
├── babel.config.js               # babel-preset-expo com unstable_transformImportMeta
├── metro.config.js               # Bundler padrão Expo (sem customizações)
├── build-apk.sh                  # Script helper para build EAS em diretório isolado
│
├── .env                          # EXPO_PUBLIC_API_URL=http://localhost:5000
├── .env.preview                  # URL do servidor de homologação
├── .env.production               # URL do servidor de produção
│
└── GUIA-*.md                     # Documentação de uso e build para a equipe
```

---

## 5. Arquitetura de Estado — Três Contextos

O app usa React Context puro, sem Redux, Zustand ou MobX. A decisão foi pragmática: o estado tem três domínios independentes, cada um com uma responsabilidade clara.

### Hierarquia de providers

```tsx
// app/_layout.tsx
<SafeAreaProvider>
  <ErrorBoundary>
    <QueryClientProvider>           // TanStack Query (disponível mas não essencial)
      <GestureHandlerRootView>
        <KeyboardProvider>
          <AuthProvider>            // 1º: autenticação (sem dependências)
            <DbProvider>            // 2º: banco local (independente de auth)
              <SyncProvider>        // 3º: sync (depende de auth + db)
                <RootLayoutNav />
              </SyncProvider>
            </DbProvider>
          </AuthProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  </ErrorBoundary>
</SafeAreaProvider>
```

A ordem importa: `SyncProvider` usa `useAuth()` (precisa do token) e `useDb()` (precisa das funções de banco), então vem depois de ambos.

### AuthContext — Detalhes de implementação

```typescript
// Persistência da sessão
const restore = async () => {
  const [savedToken, savedUser] = await Promise.all([
    AsyncStorage.getItem("spi_token"),
    AsyncStorage.getItem("spi_user"),
  ]);
  // Restaura sessão ao reabrir o app
};
```

O token é armazenado como string simples. Em modo demo, o token é `demo_token_${role}` — o servidor .NET nunca é chamado neste modo.

**Normalização da resposta do servidor:**

O `login()` normaliza ambos os formatos (camelCase e PascalCase) que o servidor .NET pode retornar:

```typescript
const rawUser = (data.user ?? data.User ?? {}) as Record<string, unknown>;
const normalizedUser: AuthUser = {
  id:    Number(rawUser.id    ?? rawUser.Id    ?? 0),
  nome:  String(rawUser.nome  ?? rawUser.Nome  ?? ""),
  email: String(rawUser.email ?? rawUser.Email ?? ""),
  role:  String(rawUser.role  ?? rawUser.Role  ?? "agente_saude") as UserRole,
  // ...
};
```

**Matriz de permissões:**

```typescript
const canViewDashboard    = () => role === "admin" || role === "analista" || role === "gestor";
const canViewPatients     = () => true; // todos os roles autenticados
const canManagePatients   = () => role === "admin" || role === "gestor" || role === "agente_saude";
const canViewEvaluations  = () => true;
const canCreateEvaluations= () => role === "admin" || role === "gestor" || role === "agente_saude";
const canManageGroups     = () => role === "admin" || role === "gestor";
const canManageUsers      = () => role === "admin" || role === "gestor";
```

### DbContext — Detalhes de implementação

**Ref pattern para evitar stale closures:**

```typescript
const patientsRef = useRef<LocalPatient[]>([]);
const evalsRef    = useRef<LocalEvaluation[]>([]);

useEffect(() => { patientsRef.current = patients; }, [patients]);
useEffect(() => { evalsRef.current = evaluations; }, [evaluations]);
```

`useCallback` com dependências em `savePatients` criaria stale closures se usasse `patients` diretamente do state. O ref garante que o callback sempre acessa a versão mais recente sem precisar ser recriado.

**Geração de IDs locais:**

```typescript
function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
// Exemplo: "1748123456789abc3d7"
```

IDs locais são strings de ~19 caracteres. O `serverId` (number | null) é o ID numérico atribuído pelo servidor após sync.

**Algoritmo de merge no refreshFromServer:**

```typescript
// Prioridade: dados do servidor prevalecem
// Exceção: pendentes locais que ainda não foram ao servidor são preservados
const mergedPatients = [
  ...syncedPatients,         // todos os pacientes do servidor (sobrescreve locais synced)
  ...pendingPatients.filter( // pendentes locais que NÃO existem no servidor ainda
    (p) => !serverPatientMap.has(p.serverId ?? -1)
  ),
];
```

### SyncContext — Detalhes de implementação

**Mutex com useRef:**

```typescript
const syncInProgress = useRef(false);

const syncNow = useCallback(async () => {
  if (syncInProgress.current || !token) return; // evita concorrência
  syncInProgress.current = true;
  // ...
  syncInProgress.current = false;
}, [token, db, checkOnline]);
```

**Intervalo de polling:**

```typescript
useEffect(() => {
  const runCheck = async () => {
    const online = await checkOnline();
    setIsOnline(online);
    if (online && token && db.isLoaded) syncNow();
  };

  runCheck();                              // roda imediatamente ao montar
  const id = setInterval(runCheck, 30000); // repete a cada 30 segundos
  return () => clearInterval(id);
}, [checkOnline, syncNow, token, db.isLoaded]);
```

**Foreground sync:**

```typescript
useEffect(() => {
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active" && token) syncNow(); // sync ao voltar do background
  });
  return () => sub.remove();
}, [syncNow, token]);
```

---

## 6. Modelos de Dados

### LocalPatient

```typescript
interface LocalPatient {
  id: string;                                        // ID local gerado pelo app
  serverId: number | null;                           // ID no servidor após sync
  nome: string;                                      // obrigatório
  cpf: string | null;                                // "12345678909" (sem formatação)
  carteiraSus: string | null;                        // 15 dígitos
  dataNascimento: string | null;                     // "DD/MM/AAAA"
  sexo: "masculino" | "feminino" | "outro" | null;
  nomeResponsavel: string | null;
  telefone: string | null;
  email: string | null;
  cep: string | null;
  estado: string | null;
  cidade: string | null;
  bairro: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  observacoes: string | null;
  groupId: number | null;                            // ID do grupo/UBS
  criadoEm: string;                                  // ISO 8601
  syncStatus: "synced" | "pending" | "error";
}
```

### LocalEvaluation

```typescript
interface LocalEvaluation {
  id: string;                          // ID local
  serverId: number | null;             // ID no servidor
  patientId: string;                   // LocalPatient.id (referência local)
  patientNome: string;                 // desnormalizado para exibição sem join
  avaliadorId: number;                 // AuthUser.id
  avaliadorNome: string;               // desnormalizado
  respostas: Record<number, number>;   // { 1: 2, 2: 3, 3: 1, ... } — questionId → score
  scoreTotal: number;                  // soma de respostas
  classificacao: string;               // label textual ("Sem indicativo de TEA", etc.)
  dataAvaliacao: string;               // ISO 8601
  formId: number | null;               // 1=SPI, 2=CARS, 3=M-CHAT-R
  syncStatus: "synced" | "pending" | "error";
}
```

**Por que desnormalizar `patientNome` e `avaliadorNome`?**

Evita a necessidade de fazer lookup nos arrays em toda listagem. Em uma `FlatList` com 500 avaliações, iterar sobre duas arrays a cada render seria custoso. Com desnormalização, cada item tem tudo que precisa para ser renderizado.

### Chaves no AsyncStorage

```
spi_token          → string — JWT ou "demo_token_{role}"
spi_user           → JSON — AuthUser serializado
spi_db_patients    → JSON — LocalPatient[] serializado
spi_db_evaluations → JSON — LocalEvaluation[] serializado
spi_api_url        → string — URL override configurada pelo admin
```

---

## 7. Formulários Clínicos

### Estrutura de um FormDefinition

```typescript
interface FormDefinition {
  id: number;            // 1 | 2 | 3
  slug: string;          // "spi" | "cars" | "mchat"
  name: string;          // nome completo
  shortName: string;     // badge curto: "SPI", "CARS", "M-CHAT-R"
  description: string;
  targetAge: string;     // faixa etária recomendada
  questionCount: number;
  scaleInfo: string;     // descrição da escala para o usuário
  maxScore: number;      // pontuação máxima possível
  isDemo: boolean;       // se true, respostas NÃO são salvas no banco
  accentColor: string;   // cor primária do formulário
  questions: FormQuestion[];
  classify: (score: number) => FormClassification; // função de classificação
}
```

### Os três formulários

| ID | Slug | Questões | Escala | MaxScore | isDemo | Target |
|---|---|---|---|---|---|---|
| 1 | `spi` | 14 | Likert 1–4 | 56 | false | 2–18 anos |
| 2 | `cars` | 15 | Likert 1–4 | 60 | true | 2+ anos |
| 3 | `mchat` | 20 | Binário 0/1 | 20 | true | 16–30 meses |

**SPI — Limiares de classificação:**
```
score ≤ 29.5  → "Sem indicativo de TEA"   (verde)
score < 37    → "TEA Leve a Moderado"      (amarelo)
score ≥ 37    → "TEA Grave"               (vermelho)
```

**CARS — Limiares:**
```
score < 30  → "Sem indicativo de TEA"
score < 37  → "TEA Leve a Moderado"
score ≥ 37  → "TEA Grave"
```

**M-CHAT-R — Limiares (risco):**
```
score ≤ 2  → "Baixo Risco de TEA"
score ≤ 7  → "Risco Médio — Acompanhar"
score > 7  → "Alto Risco — Encaminhar"
```

**Por que CARS e M-CHAT-R são `isDemo: true`?**

Esses instrumentos são padronizados e reconhecidos internacionalmente. A decisão de habilitar em produção pertence ao gestor de saúde/coordenador do sistema — o app expõe a estrutura e permite visualizar, mas não persiste dados para evitar que avaliações com formulários não validados pelo protocolo do município sejam enviadas ao servidor.

---

## 8. Navegação — Expo Router

O Expo Router implementa **file-based routing** sobre o React Navigation. A estrutura de pastas define diretamente as rotas.

### Mapeamento de arquivos para rotas

```
app/login.tsx              → /login
app/(tabs)/index.tsx       → /  (aba Início)
app/(tabs)/avaliacoes.tsx  → /avaliacoes
app/(tabs)/pacientes.tsx   → /pacientes
app/(tabs)/configuracoes.tsx → /configuracoes
app/nova-avaliacao.tsx     → /nova-avaliacao  (modal)
app/avaliacao/[id].tsx     → /avaliacao/abc123
app/paciente/[id].tsx      → /paciente/abc123
```

### AuthGate — Guarda de autenticação centralizada

```typescript
// app/_layout.tsx
function AuthGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // aguarda restauração da sessão do AsyncStorage

    const inAuthGroup = segments[0] === "login";

    if (!user && !inAuthGroup) {
      router.replace("/login");   // não autenticado → força login
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");  // já autenticado → sai do login
    }
  }, [user, isLoading, segments]);

  return null; // componente invisível, só efeito colateral
}
```

O `AuthGate` é um componente filho do Stack que roda em toda navegação. É o único ponto de controle de acesso — sem duplicação nas telas.

### Stack navigator

```typescript
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="login" />
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="nova-avaliacao" options={{ presentation: "modal" }} />
  <Stack.Screen name="avaliacao/[id]" />
</Stack>
```

`nova-avaliacao` usa `presentation: "modal"` — desliza de baixo para cima no iOS, comportamento de sheet no Android.

---

## 9. Sincronização Offline-First

### Protocolo de sync

O sync segue sempre esta ordem:

```
1. GET  /api/healthz                → verifica conectividade
2. POST /api/patients               → envia pacientes pending (sem serverId)
3. PUT  /api/patients/:serverId     → atualiza pacientes pending (com serverId)
4. POST /api/evaluations            → envia avaliações pending
5. GET  /api/patients               → baixa todos os pacientes do servidor
6. GET  /api/evaluations            → baixa todas as avaliações do servidor
7. merge local + server             → preserva pendentes, sobrescreve synced
```

### Tratamento de erros por item

Cada paciente/avaliação é enviado individualmente. Falha em um não cancela os demais:

```typescript
for (const p of pendingPatients) {
  try {
    const res = await fetch(url, { method, headers, body });
    if (res.ok) {
      await db.markPatientSynced(p.id, data.id);
    } else {
      await db.markPatientError(p.id); // marca como "error", não bloqueia o próximo
    }
  } catch {
    await db.markPatientError(p.id);   // timeout, rede caiu, etc.
  }
}
```

### Badge de pendentes

O `pendingCount` é calculado em tempo real:

```typescript
const pendingCount =
  db.getPendingPatients().length + db.getPendingEvaluations().length;
```

Aparece como badge na aba de Configurações (`tabBarBadge: pendingCount > 0 ? pendingCount : undefined`).

---

## 10. Contrato com o Servidor .NET

O servidor é uma API REST em .NET com SQL Server. O app espera os seguintes endpoints:

### Autenticação

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "agente@secretaria.gov.br",
  "password": "senha123"
}
```

**Resposta esperada (200):**

```json
{
  "access_token": "eyJhbGci...",
  "user": {
    "id": 42,
    "nome": "Fernanda Lima",
    "email": "agente@secretaria.gov.br",
    "role": "agente_saude",
    "ativo": true,
    "groupIds": [1, 2],
    "groupNames": ["UBS Centro", "UBS Jardins"],
    "criado_em": "2024-01-15T10:30:00Z"
  }
}
```

> **Compatibilidade:** o app aceita `access_token` ou `AccessToken`, e `user` ou `User`. Todos os campos do usuário também aceitam PascalCase (`Id`, `Nome`, `Email`, `Role`, `Ativo`, `CriadoEm`).

**Resposta de erro (401):**

```json
{
  "detail": "Credenciais inválidas."
}
```

### Health Check

```http
GET /api/healthz
Authorization: Bearer {token}
```

**Resposta (200):** qualquer body — o app só verifica `res.ok`.

### Pacientes

```http
GET /api/patients
Authorization: Bearer {token}
```

**Resposta (200):** array de `ServerPatient[]`

```json
[
  {
    "id": 1,
    "nome": "Ana Clara Oliveira",
    "cpf": "12345678909",
    "carteira_sus": "123456789012345",
    "data_nascimento": "15/03/2018",
    "sexo": "feminino",
    "nome_responsavel": "Maria Oliveira",
    "telefone": "(11) 98765-4321",
    "email": null,
    "cep": null,
    "estado": "SP",
    "cidade": "São Paulo",
    "bairro": "Centro",
    "rua": "Rua das Flores",
    "numero": "42",
    "complemento": null,
    "observacoes": null,
    "group_id": 1,
    "criado_em": "2025-04-15T10:00:00Z"
  }
]
```

```http
POST /api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Ana Clara Oliveira",
  "cpf": "12345678909",
  "carteira_sus": "123456789012345",
  "data_nascimento": "15/03/2018",
  "sexo": "feminino",
  "nome_responsavel": "Maria Oliveira",
  "telefone": "(11) 98765-4321",
  "group_id": 1
}
```

**Resposta (201):** objeto com `id` numérico

```json
{ "id": 42, "nome": "Ana Clara Oliveira", ... }
```

```http
PUT /api/patients/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

Mesmo body do POST. **Resposta (200):** objeto atualizado.

### Avaliações

```http
GET /api/evaluations
Authorization: Bearer {token}
```

**Resposta (200):** array de `ServerEvaluation[]`

```json
[
  {
    "id": 1,
    "patient_id": 1,
    "patient_nome": "Ana Clara Oliveira",
    "avaliador_id": 5,
    "avaliador_nome": "Fernanda Lima",
    "respostas": { "1": 2, "2": 1, "3": 2, "4": 1, "5": 2, "6": 1, "7": 2, "8": 1, "9": 1, "10": 2, "11": 1, "12": 2, "13": 1, "14": 1 },
    "score_total": 20,
    "classificacao": "Sem indicativo de TEA",
    "data_avaliacao": "2025-04-15T10:30:00Z",
    "form_id": 1
  }
]
```

```http
POST /api/evaluations
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": 1,
  "avaliador_id": 5,
  "respostas": { "1": 2, "2": 1, "3": 2 },
  "score_total": 20,
  "classificacao": "Sem indicativo de TEA",
  "data_avaliacao": "2025-05-14T10:30:00Z",
  "form_id": 1
}
```

**Resposta (201):** objeto com `id` numérico.

> **Atenção:** as chaves de `respostas` podem ser enviadas como strings (`"1"`, `"2"`) pelo `JSON.stringify()`. O servidor deve aceitar ambos: `{ "1": 2 }` e `{ 1: 2 }`.

### Cabeçalho de autenticação

Todos os endpoints protegidos recebem:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 11. Configuração da URL do Servidor

### Sistema de resolução de URL

```typescript
// utils/apiUrl.ts

export async function resolveApiUrl(): Promise<string | null> {
  // 1ª prioridade: override salvo pelo admin no AsyncStorage
  const override = await AsyncStorage.getItem("spi_api_url");
  if (override?.trim()) return override.trim().replace(/\/+$/, "");

  // 2ª prioridade: variável de ambiente definida no build
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl?.trim()) return envUrl.trim().replace(/\/+$/, "");

  // 3ª: null → modo offline puro, login real vai falhar com mensagem
  return null;
}
```

### Variáveis de ambiente por ambiente

```bash
# .env (desenvolvimento local — Expo Go ou simulador)
EXPO_PUBLIC_API_URL=http://localhost:5000

# .env.preview (APK de homologação)
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000

# .env.production (APK de produção)
EXPO_PUBLIC_API_URL=https://spi.secretaria.gov.br
```

> **Prefixo `EXPO_PUBLIC_`:** obrigatório para que o Metro bundler inclua a variável no bundle JavaScript. Variáveis sem esse prefixo NÃO ficam disponíveis em `process.env` no app.

### Override manual (admin)

Na aba Configurações, o admin pode digitar uma URL diferente:

```typescript
// Salvar override
await AsyncStorage.setItem("spi_api_url", url);

// Remover override (volta a usar .env)
await AsyncStorage.removeItem("spi_api_url");
```

O campo só é editável para o role `admin`. Outros roles veem o campo bloqueado com a mensagem "Apenas administradores podem alterar o servidor."

---

## 12. Geração de PDF

```typescript
// utils/generatePdf.ts

export async function exportEvaluationPdf(evaluation: LocalEvaluation): Promise<void> {
  const form = FORMS.find((f) => f.id === (evaluation.formId ?? 1)) ?? FORMS[0];
  const clsData = form.classify(evaluation.scoreTotal);

  // 1. Monta HTML com CSS inline (compatível com WebKit — motor do expo-print)
  const html = `<!DOCTYPE html><html>...<table>${questionRows}</table>...</html>`;

  // 2. Converte HTML em PDF no dispositivo (sem servidor)
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  // uri = "file:///data/user/0/.../cache/ExponentExperienceData/spi-mobile.pdf"

  // 3. Abre compartilhamento nativo
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Avaliação — ${evaluation.patientNome}`,
      UTI: "com.adobe.pdf",  // Universal Type Identifier (iOS)
    });
  } else {
    await Print.printAsync({ uri }); // fallback: abre visualizador de impressão
  }
}
```

O PDF é gerado **100% no dispositivo** — não há chamada a servidor para isso. O HTML usa CSS com `border-radius`, `flex`, e uma barra de progresso via `width: ${pct}%` inline.

---

## 13. Sistema de Design e Temas

### Design tokens

```typescript
// constants/colors.ts
const colors = {
  light: {
    background:       "#f8fafc",   // Slate 50
    foreground:       "#0f172a",   // Slate 900
    card:             "#ffffff",
    primary:          "#2563eb",   // Blue 600
    primaryForeground:"#ffffff",
    muted:            "#f1f5f9",   // Slate 100
    mutedForeground:  "#64748b",   // Slate 500
    accent:           "#dbeafe",   // Blue 100
    border:           "#e2e8f0",   // Slate 200
    destructive:      "#ef4444",   // Red 500
    success:          "#16a34a",   // Green 600
    warning:          "#ca8a04",   // Yellow 600 (Amber)
    error:            "#dc2626",   // Red 600
    successBg:        "#dcfce7",
    warningBg:        "#fef9c3",
    errorBg:          "#fee2e2",
  },
  radius: 12,
};
```

Os tokens seguem a paleta **Tailwind CSS** (Slate/Blue/Green/Red). Isso facilita a transição para web se necessário.

### Hook de tema

```typescript
// hooks/useColors.ts
export function useColors() {
  const scheme = useColorScheme();  // "light" | "dark" | null
  const palette =
    scheme === "dark" && "dark" in colors
      ? (colors as any).dark        // usa dark se estiver definido
      : colors.light;               // fallback para light
  return { ...palette, radius: colors.radius };
}
```

Atualmente só o tema claro está definido. Para adicionar dark mode, basta adicionar a chave `dark: { ... }` em `constants/colors.ts` com os mesmos tokens.

### StyleSheet local

Todas as telas criam seus estilos com `StyleSheet.create()` dentro do componente, mas usando os tokens do `useColors()`. Isso garante que:
1. Os estilos são processados nativamente (performance)
2. Os valores de cor são reativados ao trocar de tema

---

## 14. Build e Deploy — EAS

### Profiles no eas.json

```json
{
  "build": {
    "development": {
      "developmentClient": true,     // inclui menu de desenvolvimento
      "distribution": "internal",    // APK para instalar via link
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },  // APK para testes
      "ios": { "simulator": true }         // .app para simulador iOS
    },
    "production": {
      "android": { "buildType": "app-bundle" }  // .aab para Google Play
    }
  }
}
```

### Identificadores do app

```json
// app.json
{
  "ios":     { "bundleIdentifier": "br.gov.saude.spi.mobile" },
  "android": { "package":          "br.gov.saude.spi.mobile" }
}
```

### Como buildar o APK (contorna monorepo)

O EAS CLI usa `git ls-files` para empacotar o projeto, o que falha em monorepos porque o `.git` está na raiz do workspace. O `build-apk.sh` resolve isso:

```bash
#!/usr/bin/env bash
# Copia spi-mobile para /tmp, inicializa git próprio, faz o build
BUILD_DIR="/tmp/spi-build-$(date +%s)"
cp -r "$(dirname "$0")" "$BUILD_DIR"
cd "$BUILD_DIR"
git init && git add . && git commit -m "build"
npx eas-cli build --platform android --profile preview --non-interactive
```

### Variáveis de ambiente no build

Para incluir a URL de produção no APK sem hardcodar no código:

```bash
# Definir no EAS antes do build
eas env:create --name EXPO_PUBLIC_API_URL --value "https://spi.secretaria.gov.br" --scope project
```

Ou configurar no dashboard em `expo.dev → seu projeto → Environment Variables`.

---

## 15. TypeScript e Ferramental

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",  // strict: true, target: ES2020, etc.
  "compilerOptions": {
    "baseUrl": ".",
    "strict": true,
    "paths": {
      "@/*": ["./*"]  // @/context/AuthContext → ./context/AuthContext.tsx
    }
  }
}
```

O path alias `@/` é resolvido tanto pelo TypeScript quanto pelo Metro bundler (via `babel-preset-expo`).

### babel.config.js

```javascript
module.exports = (api) => {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
  };
};
```

`unstable_transformImportMeta: true` é necessário para transformar `import.meta.env` em `process.env` — compatibilidade com algumas bibliotecas que usam ESM moderno.

### React Compiler

```json
// app.json
"experiments": {
  "reactCompiler": true
}
```

O React Compiler (beta) analisa o código e adiciona memoização automática. Equivalente a `useMemo` e `useCallback` inseridos pelo compilador onde necessário. Requer React 19.

### New Architecture

```json
// app.json
"newArchEnabled": true
```

Habilita a Nova Arquitetura do React Native (Fabric + JSI). Remove a bridge assíncrona entre JS e código nativo — chamadas síncronas, menor latência. Disponível desde RN 0.76 como padrão; habilitado explicitamente aqui para garantir.

---

## Checklist de Configuração do Servidor

Para integrar o app com um servidor .NET existente:

- [ ] Servidor expõe `GET /api/healthz` (qualquer resposta 2xx)
- [ ] Servidor expõe `POST /api/auth/login` → retorna `access_token` + `user`
- [ ] `user` contém: `id`, `nome`, `email`, `role` (um dos 4 valores), `ativo`, `criado_em`
- [ ] Servidor aceita `Authorization: Bearer <token>` em todos os endpoints
- [ ] `GET /api/patients` → array de pacientes com `snake_case` nos campos
- [ ] `POST /api/patients` → cria e retorna objeto com `id` numérico
- [ ] `PUT /api/patients/:id` → atualiza paciente
- [ ] `GET /api/evaluations` → array de avaliações com `respostas` como objeto
- [ ] `POST /api/evaluations` → cria e retorna objeto com `id` numérico
- [ ] CORS configurado para aceitar requests do app (ou não aplicável se LAN-only)
- [ ] URL configurada em `.env.production` ou via `eas env:create`
- [ ] URL do servidor sem barra final (o app remove automaticamente, mas bom garantir)
