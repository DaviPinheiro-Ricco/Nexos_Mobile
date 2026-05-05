# SPI Mobile — Guia para a Equipe
## Como distribuir o APK, fazer o seed e testar

---

## 1. COMO O SEED FUNCIONA

**Seed** = dados de demonstração que o app cria automaticamente no celular para teste.

### O que é criado automaticamente
Ao entrar pelo modo **"Acesso de demonstração (offline)"**, o app cria sozinho:

| O que | Quantidade |
|---|---|
| Pacientes | 10 (com nome, CPF, SUS, endereço completo) |
| Grupos | 2 (UBS Centro e UBS Jardins) |
| Agentes de saúde | 10 agentes nomeados |
| Avaliações SPI | 10 (com scores variados: Sem TEA, Leve/Mod, Grave) |

### Quando o seed acontece
```
Usuário toca "Acesso de demonstração (offline)"
           ↓
Escolhe um perfil (Admin, Gestor, Agente ou Analista)
           ↓
App verifica: já tem dados? Se SIM → não faz nada. Se NÃO → cria tudo.
           ↓
Dados ficam salvos no celular mesmo fechando o app
```

> **Importante:** o seed só roda **uma vez por instalação**. Na segunda vez que entrar, os dados já existem e ele não duplica nada.

### Como limpar e refazer o seed
Vá em **Configurações → "Apagar todos os dados"** → confirme.  
Na próxima vez que entrar pelo modo demo, o seed recria tudo do zero.

---

## 2. OS 4 PERFIS DE DEMONSTRAÇÃO

Cada perfil tem permissões diferentes. Perfeito para mostrar a cada membro da equipe o que **ele vai ver no dia a dia**.

| Perfil | O que pode fazer |
|---|---|
| **Administrador** | Tudo: pacientes, avaliações, grupos, URL do servidor |
| **Gestor** | Pacientes, avaliações, grupos. Sem configurações de servidor |
| **Agente de Saúde** | Cria pacientes e faz avaliações. Sem painel analítico |
| **Analista** | Só leitura: vê dashboards, pacientes e avaliações. Não edita nada |

---

## 3. COMO GERAR O APK

Na pasta do projeto (`artifacts/spi-mobile`), com o EAS CLI instalado:

```bash
# 1. Instalar EAS CLI (só uma vez)
npm install -g eas-cli

# 2. Fazer login na conta Expo (criar em expo.dev se não tiver)
eas login

# 3. Gerar o APK
pnpm install
eas build --profile preview --platform android
```

Após 5–15 minutos, o EAS envia um **link para baixar o `.apk`**.

---

## 4. COMO DISTRIBUIR PARA A EQUIPE

### Opção A — WhatsApp / Telegram (mais rápido)
1. Baixe o `.apk` no seu computador
2. Envie direto no grupo da equipe pelo WhatsApp
3. Cada pessoa toca no arquivo no celular para instalar

### Opção B — Google Drive / OneDrive
1. Suba o `.apk` para uma pasta compartilhada
2. Envie o link pelo grupo
3. Cada pessoa abre o link no celular e baixa

### Opção C — Cabo USB (para quem está presencialmente)
1. Conecte o celular ao computador
2. Copie o `.apk` para o celular
3. Abra o gerenciador de arquivos e toque no `.apk`

---

## 5. COMO INSTALAR NO CELULAR ANDROID

> ⚠️ O Android bloqueia apps fora da Play Store por padrão. Siga estes passos:

**Passo 1 — Liberar fontes desconhecidas**
- Abra as **Configurações** do celular
- Vá em **Segurança** (ou **Apps** → **Instalar apps desconhecidos**)
- Ative para o **WhatsApp** (ou Chrome, ou gerenciador de arquivos — o que usou para baixar)

**Passo 2 — Instalar**
- Toque no arquivo `.apk` baixado
- Toque em **Instalar**
- Aguarde e toque em **Abrir**

**Passo 3 — Testar**
- Toque em **"Acesso de demonstração (offline)"**
- Escolha um perfil
- O seed é criado automaticamente — já aparece tudo populado!

---

## 6. ROTEIRO DE TESTE PARA A EQUIPE

### Teste 1 — Verificar o seed (todos os perfis)
- [ ] Entrar como **Administrador** → ver 10 pacientes e 10 avaliações no dashboard
- [ ] Entrar como **Gestor** → ver mesmo conteúdo, sem opção de configurar servidor
- [ ] Entrar como **Agente de Saúde** → ver pacientes, não ver painel analítico
- [ ] Entrar como **Analista** → ver tudo mas sem botão de criar/editar

### Teste 2 — Fluxo principal
- [ ] Tocar em um paciente → ver tela de detalhes com dados completos
- [ ] Abrir uma avaliação → ver score, classificação e respostas
- [ ] Criar nova avaliação → selecionar paciente, preencher 14 questões, ver score final
- [ ] Compartilhar PDF de uma avaliação → botão de compartilhar na tela da avaliação

### Teste 3 — Funcionar offline
- [ ] Ativar **modo avião** no celular
- [ ] Abrir o app → deve carregar tudo normalmente
- [ ] Criar um paciente → aparece badge "PENDENTE"
- [ ] Desativar modo avião → badge some após a sync

### Teste 4 — Reset e reseed
- [ ] Ir em **Configurações → Apagar todos os dados**
- [ ] Confirmar → app fica vazio
- [ ] Sair e entrar pelo modo demo novamente → seed recria tudo

---

## 7. PERGUNTAS FREQUENTES DA EQUIPE

**"O app pede conta de servidor — o que colocar?"**
> Não precisa de conta de servidor para testar. Use "Acesso de demonstração (offline)" — funciona sem internet e sem servidor.

**"Os dados de um celular aparecem no outro?"**
> Não. Cada celular tem seus próprios dados salvos localmente. Quando o servidor .NET estiver configurado, aí sim tudo sincroniza entre os dispositivos.

**"Posso criar pacientes reais no APK de teste?"**
> Pode, mas cuidado: sem o servidor, os dados ficam apenas no celular. Se desinstalar o app, perde tudo. Use para teste apenas por enquanto.

**"Como saber se está sincronizando?"**
> No dashboard, o botão no canto superior direito mostra "Online" (verde) ou "Offline" (vermelho). Pacientes e avaliações pendentes mostram o badge "PENDENTE".

**"O app vai ter login real depois?"**
> Sim. Quando o servidor .NET estiver rodando, o administrador configura a URL em Configurações → e daí em diante o login é feito com e-mail e senha reais do sistema.

---

## 8. DADOS DO SEED (para referência nos testes)

### Pacientes — UBS Centro
| Nome | Nasc. | Score | Classificação |
|---|---|---|---|
| Ana Clara Oliveira | 15/03/2018 | 18 | Sem TEA |
| Juliana Ferreira Lima | 08/11/2017 | 33 | Leve/Moderado |
| Rafaela Torres Gomes | 25/12/2017 | 48 | **Grave** |
| Larissa Campos Melo | 07/08/2019 | 31 | Leve/Moderado |
| Lucas Martins Souza | 04/09/2018 | 35 | Leve/Moderado |

### Pacientes — UBS Jardins
| Nome | Nasc. | Score | Classificação |
|---|---|---|---|
| Pedro Henrique Santos | 22/07/2016 | 38 | **Grave** |
| Gustavo Almeida Costa | 30/01/2019 | 42 | **Grave** |
| Isabela Rocha Nunes | 17/06/2015 | 25 | Sem TEA |
| Matheus Barbosa Cruz | 11/04/2016 | 22 | Sem TEA |
| Vinícius Pereira Dias | 13/02/2020 | 15 | Sem TEA |

**Distribuição:** 4 Sem TEA · 3 Leve/Moderado · 3 Grave

---

*SPI Mobile — Sistema de Prevalência e Indicadores de Saúde (TEA)*
