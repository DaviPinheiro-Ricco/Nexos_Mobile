# SPI Mobile — Guia de Uso para a Equipe
## Passo a passo com telas (para apresentação no Figma)

---

## TELA 1 — Login
**Caminho:** Abrir o app

A tela inicial tem:
- Logo do SPI no topo
- Campos de **E-mail** e **Senha** (para quando tiver servidor configurado)
- Botão **"Entrar"**
- Link **"⚡ Acesso de demonstração (offline)"** embaixo

> **Para a equipe testar:** toque em "Acesso de demonstração (offline)"

---

## TELA 2 — Escolher perfil de demonstração
**Caminho:** Toque em "Acesso de demonstração (offline)"

Aparece um modal pedindo:
- **Nome** (pode colocar o seu nome)
- **Perfil:** escolha um dos 4 botões:
  - Administrador
  - Gestor
  - Agente de Saúde
  - Analista

> **Para ver tudo:** escolha **Administrador**

Toque em **"Entrar como Demo"**

---

## TELA 3 — Dashboard (Início)
**Caminho:** Após login → aba "Início"

Mostra:
- Saudação com nome do usuário e perfil
- Cards de resumo: total de pacientes, avaliações, pendentes de sync
- Gráfico de distribuição (Sem TEA / Leve / Grave)
- Lista das avaliações mais recentes
- Indicador Online/Offline no canto superior

> **Obs:** Na primeira vez, os cards mostram zeros — o seed ainda não foi feito

---

## TELA 4 — Fazer o Seed (popular dados de demo)
**Caminho:** Aba "Configurações" → seção "Dados de Demonstração"

Para popular o app com dados de exemplo:
1. Toque na aba **Configurações** (ícone de engrenagem)
2. Role até a seção **"Dados de Demonstração"**
3. Toque em **"Carregar dados de demonstração"**
4. Aguarde a mensagem de confirmação

Após o seed:
- 10 pacientes criados (5 na UBS Centro, 5 na UBS Jardins)
- 10 avaliações com scores variados
- 10 agentes de saúde

> Volte à aba **Início** — agora os cards mostram os dados reais

---

## TELA 5 — Lista de Pacientes
**Caminho:** Aba "Pacientes"

Mostra:
- Campo de busca no topo
- Lista com nome, grupo (UBS), data de nascimento
- Badge colorido se houver avaliação pendente de sync
- Botão **"+"** no canto inferior direito para novo paciente

---

## FLUXO A — Paciente JÁ cadastrado

### Tela 5A — Detalhe do Paciente
**Caminho:** Aba "Pacientes" → toque em qualquer paciente da lista

Mostra:
- Card azul com nome, grupo, sexo, data de nascimento
- Dados pessoais: CPF, Carteira SUS, responsável, telefone
- Endereço completo
- Lista de avaliações anteriores com score e classificação
- Botão de editar (lápis) e excluir (lixeira) para Admin/Gestor

### Tela 5B — Iniciar nova avaliação do paciente cadastrado
**Caminho:** Tela de detalhe → toque em uma avaliação existente OU botão "Nova Avaliação"

- Se tiver avaliações: toque em qualquer uma para ver o detalhe
- Para nova: toque em **"+ Nova Avaliação"** (aparece se não tiver avaliação ainda)
- Ou vá pela aba **Avaliações** → botão **"+"** → selecione o paciente na lista

---

## FLUXO B — Paciente NÃO cadastrado

### Tela 6A — Cadastrar novo paciente
**Caminho:** Aba "Pacientes" → botão "+" (canto inferior direito)

Preencha:
- **Nome completo** (obrigatório)
- Data de nascimento
- Sexo
- Nome do responsável
- Telefone
- Grupo (UBS Centro ou UBS Jardins)
- CPF, Carteira SUS
- Endereço

Toque em **"Salvar"**

> O paciente aparece na lista com badge "PENDENTE" (será sincronizado quando online)

### Tela 6B — Iniciar avaliação do novo paciente
**Caminho:** Aba "Avaliações" → botão "+" → selecione o paciente recém-cadastrado

---

## TELA 7 — Formulário de Avaliação SPI (14 questões)
**Caminho:** Aba "Avaliações" → botão "+" → selecione o paciente

O formulário tem:
- Nome do paciente no topo
- **14 questões** — cada uma com escala de 1 a 4:
  - 1 = Comportamento normal
  - 2 = Levemente anormal
  - 3 = Moderadamente anormal
  - 4 = Gravemente anormal
- Progresso visual (barra ou contador de questões)
- Botão **"Próxima"** / **"Finalizar"**

---

## TELA 8 — Resultado da Avaliação
**Caminho:** Após responder todas as 14 questões → toque "Finalizar"

Mostra:
- **Score total** (soma das 14 respostas, de 14 a 56)
- **Classificação** com cor:
  - 🟢 **Sem indicativo de TEA** (score ≤ 29,5)
  - 🟡 **TEA Leve a Moderado** (score 30–36,9)
  - 🔴 **TEA Grave** (score ≥ 37)
- Respostas por questão
- Botão **"Compartilhar / Exportar PDF"**

---

## TELA 9 — Exportar e Compartilhar PDF
**Caminho:** Tela de resultado → botão "Compartilhar"

Abre o compartilhamento nativo do Android com opções de:
- WhatsApp
- E-mail
- Salvar no celular
- Google Drive
- Imprimir

O PDF gerado contém:
- Dados do paciente
- Data e avaliador
- Score e classificação
- Respostas de cada questão

---

## TELA 10 — Sincronização
**Caminho:** Aba "Configurações" → seção "Servidor"

Mostra:
- Status: **Online** (verde) ou **Offline** (vermelho)
- Quantidade de registros pendentes de envio
- Botão **"Sincronizar agora"**
- Campo para URL do servidor (só Admin pode editar)
- Última sincronização realizada

> Quando offline, todos os dados ficam salvos localmente.
> Ao voltar online, o sync acontece automaticamente a cada 30 segundos.

---

## RESUMO DO FLUXO PARA O FIGMA

```
[Tela 1 - Login]
       ↓ toca em "Acesso de demonstração"
[Tela 2 - Escolher perfil]
       ↓ escolhe Administrador
[Tela 3 - Dashboard]
       ↓ vai em Configurações → Carregar dados demo
[Tela 4 - Seed feito]
       ↓ volta para Dashboard (agora com dados)
       ↓
   ┌────────────────────────────────┐
   │                                │
   ▼                                ▼
[Paciente JÁ cadastrado]    [Paciente NÃO cadastrado]
[Tela 5 → 5A → Avaliação]   [Tela 6A → Cadastro → Avaliação]
   │                                │
   └──────────────┬─────────────────┘
                  ▼
     [Tela 7 - Formulário 14 questões]
                  ↓
     [Tela 8 - Resultado + Score]
                  ↓
     [Tela 9 - Exportar PDF]
```

---

## DICAS PARA O FIGMA

- Use o celular com o APK instalado para tirar os prints reais de cada tela
- Resolução recomendada: 1170×2532 px (iPhone 14) ou 1080×2400 px (Android)
- Organize as telas em frames de 390×844 px no Figma
- Use setas de conexão entre os frames para mostrar o fluxo
- Destaque os elementos clicáveis com círculos ou setas vermelhas
