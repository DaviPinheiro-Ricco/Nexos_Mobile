export interface FormOption {
  score: number;
  text: string;
}

export interface FormQuestion {
  id: number;
  name: string;
  options: FormOption[];
}

export interface FormClassification {
  label: string;
  color: string;
  bgColor: string;
  level: "low" | "medium" | "high";
}

export interface FormDefinition {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  targetAge: string;
  questionCount: number;
  scaleInfo: string;
  maxScore: number;
  isDemo: boolean;
  accentColor: string;
  questions: FormQuestion[];
  classify: (score: number) => FormClassification;
}

// ─── SPI ─────────────────────────────────────────────────────────────────────
const SPI_QUESTIONS: FormQuestion[] = [
  {
    id: 1,
    name: "Relacionamento interpessoal",
    options: [
      { score: 1, text: "Adequado para a idade. Comportamento social típico" },
      { score: 2, text: "Levemente anormal. Pode evitar contato visual ou ter timidez excessiva" },
      { score: 3, text: "Moderadamente anormal. Respostas escassas e raramente espontâneas" },
      { score: 4, text: "Extremamente anormal. Não responde ou não percebe a chegada de outras pessoas" },
    ],
  },
  {
    id: 2,
    name: "Imitação e criação",
    options: [
      { score: 1, text: "Adequado para a idade. Imita sons e gestos normalmente" },
      { score: 2, text: "Levemente anormal. Imita tarefas simples como palmas" },
      { score: 3, text: "Moderadamente anormal. Imita apenas parte do tempo com apoio" },
      { score: 4, text: "Extremamente anormal. Não imita nada, nem sons simples" },
    ],
  },
  {
    id: 3,
    name: "Resposta emocional",
    options: [
      { score: 1, text: "Adequado para a idade. Reage emocionalmente com coerência" },
      { score: 2, text: "Levemente anormal. Reações levemente reduzidas ou inadequadas" },
      { score: 3, text: "Moderadamente anormal. Respostas limitadas, sem demonstração de emoções" },
      { score: 4, text: "Extremamente anormal. Reações extremas sem motivo aparente" },
    ],
  },
  {
    id: 4,
    name: "Uso do corpo",
    options: [
      { score: 1, text: "Adequado para a idade. Movimentos coordenados e normais" },
      { score: 2, text: "Levemente anormal. Postura ou movimentos corporais levemente incomuns" },
      { score: 3, text: "Moderadamente anormal. Comportamentos como balançar, estalar dedos" },
      { score: 4, text: "Extremamente anormal. Movimentos bizarros graves ou autoagressão" },
    ],
  },
  {
    id: 5,
    name: "Uso de objetos",
    options: [
      { score: 1, text: "Adequado para a idade. Usa brinquedos como esperado" },
      { score: 2, text: "Levemente anormal. Interesses limitados ou uso estereotipado" },
      { score: 3, text: "Moderadamente anormal. Prejuízo significativo com objetos" },
      { score: 4, text: "Extremamente anormal. Uso de partes do corpo no lugar de objetos" },
    ],
  },
  {
    id: 6,
    name: "Adaptação a mudanças",
    options: [
      { score: 1, text: "Adequado para a idade. Lida bem com transições" },
      { score: 2, text: "Levemente anormal. Dificuldade mínima, ajusta-se com apoio" },
      { score: 3, text: "Moderadamente anormal. Apego a rotina, resistência a mudanças" },
      { score: 4, text: "Extremamente anormal. Reação extrema a qualquer modificação" },
    ],
  },
  {
    id: 7,
    name: "Resposta visual",
    options: [
      { score: 1, text: "Adequado para a idade. Uso visual normal dos sentidos" },
      { score: 2, text: "Levemente anormal. Necessidade de verificar objetos visualmente" },
      { score: 3, text: "Moderadamente anormal. Fascínio por detalhes ou reflexos" },
      { score: 4, text: "Extremamente anormal. Olhar fixo prolongado ou evitar olhar" },
    ],
  },
  {
    id: 8,
    name: "Resposta auditiva",
    options: [
      { score: 1, text: "Adequado para a idade. Resposta normal a sons" },
      { score: 2, text: "Levemente anormal. Reação levemente reduzida aos sons" },
      { score: 3, text: "Moderadamente anormal. Reações extremas ou ausência de resposta" },
      { score: 4, text: "Extremamente anormal. Não responde a qualquer som forte" },
    ],
  },
  {
    id: 9,
    name: "Impressões e temores",
    options: [
      { score: 1, text: "Adequado para a idade. Sem medos incomuns" },
      { score: 2, text: "Levemente anormal. Medos ou ansiedades discretas" },
      { score: 3, text: "Moderadamente anormal. Medos excessivos com dificuldade de consolo" },
      { score: 4, text: "Extremamente anormal. Terror ou euforia sem causa aparente" },
    ],
  },
  {
    id: 10,
    name: "Comunicação verbal",
    options: [
      { score: 1, text: "Adequado para a idade. Fala compreensível e contextualizada" },
      { score: 2, text: "Levemente anormal. Sem conteúdo concreto ou ecolalia ocasional" },
      { score: 3, text: "Moderadamente anormal. Jargão, sons guturais ou ecolalia frequente" },
      { score: 4, text: "Extremamente anormal. Gritos estranhos ou sons bizarros persistentes" },
    ],
  },
  {
    id: 11,
    name: "Comunicação não verbal",
    options: [
      { score: 1, text: "Adequado para a idade. Gestos e expressões normais" },
      { score: 2, text: "Levemente anormal. Uso reduzido de gestos" },
      { score: 3, text: "Moderadamente anormal. Comunicação não verbal limitada" },
      { score: 4, text: "Extremamente anormal. Sem comunicação não verbal funcional" },
    ],
  },
  {
    id: 12,
    name: "Nível de atividade",
    options: [
      { score: 1, text: "Adequado para a idade. Nível de atividade normal" },
      { score: 2, text: "Levemente anormal. Ligeiramente inquieto ou excessivamente calmo" },
      { score: 3, text: "Moderadamente anormal. Agitação ou passividade significativas" },
      { score: 4, text: "Extremamente anormal. Hiperatividade extrema ou imobilidade" },
    ],
  },
  {
    id: 13,
    name: "Nível e consistência intelectual",
    options: [
      { score: 1, text: "Adequado para a idade. Função intelectual normal" },
      { score: 2, text: "Levemente anormal. Desempenho levemente abaixo do esperado" },
      { score: 3, text: "Moderadamente anormal. Desempenho significativamente abaixo" },
      { score: 4, text: "Extremamente anormal. Nenhuma resposta funcional em áreas normais" },
    ],
  },
  {
    id: 14,
    name: "Impressões gerais",
    options: [
      { score: 1, text: "Dentro da normalidade para a idade" },
      { score: 2, text: "Levemente fora da normalidade para a idade" },
      { score: 3, text: "Moderadamente fora da normalidade para a idade" },
      { score: 4, text: "Extremamente fora da normalidade para a idade" },
    ],
  },
];

// ─── CARS ────────────────────────────────────────────────────────────────────
const CARS_QUESTIONS: FormQuestion[] = [
  {
    id: 1,
    name: "Relacionamento com pessoas",
    options: [
      { score: 1, text: "Sem dificuldades. Comportamento social adequado à idade" },
      { score: 2, text: "Leve. Timidez ou evitação leve em algumas situações" },
      { score: 3, text: "Moderado. Evita contato, relação distante mesmo com familiares" },
      { score: 4, text: "Grave. Raramente interagem; ignoram os outros completamente" },
    ],
  },
  {
    id: 2,
    name: "Imitação",
    options: [
      { score: 1, text: "Imita sons, palavras e ações adequadamente" },
      { score: 2, text: "Imita a maior parte do tempo, com algum estímulo" },
      { score: 3, text: "Imita somente às vezes, com insistência" },
      { score: 4, text: "Raramente ou nunca imita sons, palavras ou ações" },
    ],
  },
  {
    id: 3,
    name: "Resposta emocional",
    options: [
      { score: 1, text: "Reações emocionais adequadas ao contexto e à idade" },
      { score: 2, text: "Leve inadequação em algumas situações" },
      { score: 3, text: "Reações emocionais claramente inadequadas ou ausentes" },
      { score: 4, text: "Raramente demonstra emoções; risos ou choros sem causa" },
    ],
  },
  {
    id: 4,
    name: "Uso do corpo",
    options: [
      { score: 1, text: "Uso funcional e adequado do corpo" },
      { score: 2, text: "Postura ou movimentos levemente incomuns" },
      { score: 3, text: "Comportamentos repetitivos: balançar, girar, agitar as mãos" },
      { score: 4, text: "Movimentos estranhos graves, automutilação ou rigidez extrema" },
    ],
  },
  {
    id: 5,
    name: "Uso de objetos",
    options: [
      { score: 1, text: "Usa e explora objetos de forma adequada" },
      { score: 2, text: "Levemente inadequado; interesses restritos" },
      { score: 3, text: "Pré-ocupado com partes de objetos; uso ritualístico" },
      { score: 4, text: "Comportamento compulsivo com objetos; difícil interromper" },
    ],
  },
  {
    id: 6,
    name: "Adaptação a mudanças",
    options: [
      { score: 1, text: "Aceita rotinas e mudanças sem dificuldade" },
      { score: 2, text: "Leve resistência a mudanças; recupera-se rapidamente" },
      { score: 3, text: "Resistência ativa; difícil transicionar de atividades" },
      { score: 4, text: "Reação intensa a qualquer mudança; comportamento descontrolado" },
    ],
  },
  {
    id: 7,
    name: "Resposta visual",
    options: [
      { score: 1, text: "Visão normal; acompanha objetos e rostos adequadamente" },
      { score: 2, text: "Olhar fixo ocasional ou evita olhar nos olhos levemente" },
      { score: 3, text: "Usa periférica excessivamente; olha através das pessoas" },
      { score: 4, text: "Evita intensamente o contato visual; olhar extremamente desviado" },
    ],
  },
  {
    id: 8,
    name: "Resposta auditiva",
    options: [
      { score: 1, text: "Responde normalmente aos sons" },
      { score: 2, text: "Resposta levemente inconsistente a sons" },
      { score: 3, text: "Hipersensível a certos sons; ignora vozes familiares" },
      { score: 4, text: "Não responde a sons; parece surdo, mas reage a outros" },
    ],
  },
  {
    id: 9,
    name: "Uso e resposta ao paladar, olfato e tato",
    options: [
      { score: 1, text: "Explora adequadamente pelo tato e paladar" },
      { score: 2, text: "Levemente incomum em cheirar ou tocar objetos/pessoas" },
      { score: 3, text: "Cheira ou prova objetos frequentemente; hipersensível ao toque" },
      { score: 4, text: "Preocupação excessiva com sensações; reação intensa ao toque" },
    ],
  },
  {
    id: 10,
    name: "Medo e nervosismo",
    options: [
      { score: 1, text: "Medos e ansiedades normais para a idade" },
      { score: 2, text: "Medos levemente atípicos; ansiedade ocasional" },
      { score: 3, text: "Medos excessivos a estímulos seguros; pouco medo de perigos reais" },
      { score: 4, text: "Padrão de medo ou ausência de medo extremamente anormal" },
    ],
  },
  {
    id: 11,
    name: "Comunicação verbal",
    options: [
      { score: 1, text: "Linguagem normal para a idade" },
      { score: 2, text: "Leve atraso; ecolalia ocasional" },
      { score: 3, text: "Ausência de fala funcional; ecolalia frequente; jargão" },
      { score: 4, text: "Sem fala significativa; sons estereotipados sem comunicação" },
    ],
  },
  {
    id: 12,
    name: "Comunicação não verbal",
    options: [
      { score: 1, text: "Usa gestos, expressões e apontar normalmente" },
      { score: 2, text: "Uso reduzido de comunicação não verbal" },
      { score: 3, text: "Comunicação não verbal limitada; difícil interpretar necessidades" },
      { score: 4, text: "Sem gestos funcionais; impossível comunicar sem fala" },
    ],
  },
  {
    id: 13,
    name: "Nível de atividade",
    options: [
      { score: 1, text: "Nível de atividade normal e adequado" },
      { score: 2, text: "Levemente hiperativo ou hipoativo" },
      { score: 3, text: "Moderadamente agitado ou apático; difícil de controlar" },
      { score: 4, text: "Extremamente hiperativo ou completamente passivo" },
    ],
  },
  {
    id: 14,
    name: "Nível e consistência intelectual",
    options: [
      { score: 1, text: "Habilidades intelectuais adequadas para a idade" },
      { score: 2, text: "Leve inconsistência; algumas áreas abaixo do esperado" },
      { score: 3, text: "Déficits moderados em múltiplas áreas cognitivas" },
      { score: 4, text: "Funcionamento intelectual gravemente comprometido" },
    ],
  },
  {
    id: 15,
    name: "Impressão geral",
    options: [
      { score: 1, text: "Não apresenta sinais de TEA" },
      { score: 2, text: "Apresenta sinais leves e atípicos" },
      { score: 3, text: "Apresenta sinais moderados; TEA provável" },
      { score: 4, text: "Apresenta sinais graves; fortemente indicativo de TEA" },
    ],
  },
];

// ─── M-CHAT-R ─────────────────────────────────────────────────────────────────
const MCHAT_QUESTIONS: FormQuestion[] = [
  {
    id: 1,
    name: "Seu filho aponta para mostrar interesse por algo distante?",
    options: [
      { score: 0, text: "Sim — aponta para compartilhar interesse" },
      { score: 1, text: "Não — nunca ou raramente aponta" },
    ],
  },
  {
    id: 2,
    name: "Seu filho já se interessou por outras crianças?",
    options: [
      { score: 0, text: "Sim — demonstra interesse em brincar com outras crianças" },
      { score: 1, text: "Não — parece indiferente a outras crianças" },
    ],
  },
  {
    id: 3,
    name: "Seu filho imita ações que você faz?",
    options: [
      { score: 0, text: "Sim — imita gestos e ações com frequência" },
      { score: 1, text: "Não — raramente ou nunca imita" },
    ],
  },
  {
    id: 4,
    name: "Seu filho finge estar fazendo algo (faz de conta)?",
    options: [
      { score: 0, text: "Sim — brinca de faz de conta regularmente" },
      { score: 1, text: "Não — não demonstra jogo simbólico" },
    ],
  },
  {
    id: 5,
    name: "Seu filho traz objetos para mostrar a você?",
    options: [
      { score: 0, text: "Sim — traz coisas para mostrar e compartilhar" },
      { score: 1, text: "Não — não busca compartilhar objetos com os pais" },
    ],
  },
  {
    id: 6,
    name: "Seu filho responde quando chamado pelo nome?",
    options: [
      { score: 0, text: "Sim — responde na maioria das vezes" },
      { score: 1, text: "Não — geralmente ignora quando chamado" },
    ],
  },
  {
    id: 7,
    name: "Quando você aponta para algo, seu filho olha?",
    options: [
      { score: 0, text: "Sim — segue o dedo e olha o objeto" },
      { score: 1, text: "Não — olha para sua mão, mas não para o objeto" },
    ],
  },
  {
    id: 8,
    name: "Seu filho olha para seu rosto para verificar sua reação?",
    options: [
      { score: 0, text: "Sim — checa sua expressão antes de agir" },
      { score: 1, text: "Não — parece não buscar referência emocional" },
    ],
  },
  {
    id: 9,
    name: "Seu filho gosta de subir em móveis ou escadas?",
    options: [
      { score: 0, text: "Sim — explora o ambiente com entusiasmo" },
      { score: 1, text: "Não — comportamento motor muito restrito" },
    ],
  },
  {
    id: 10,
    name: "Seu filho faz movimentos repetitivos com os dedos ou mãos?",
    options: [
      { score: 0, text: "Não — sem movimentos estereotipados" },
      { score: 1, text: "Sim — agita as mãos, estala dedos com frequência" },
    ],
  },
  {
    id: 11,
    name: "Seu filho usa palavras simples (mamã, papá, água)?",
    options: [
      { score: 0, text: "Sim — fala pelo menos 2-3 palavras" },
      { score: 1, text: "Não — ainda sem linguagem verbal funcional" },
    ],
  },
  {
    id: 12,
    name: "Seu filho sorri quando você sorri para ele?",
    options: [
      { score: 0, text: "Sim — responde ao sorriso com frequência" },
      { score: 1, text: "Não — raramente responde socialmente ao sorriso" },
    ],
  },
  {
    id: 13,
    name: "Seu filho fica angustiado com barulhos comuns?",
    options: [
      { score: 0, text: "Não — tolera sons ambientes normalmente" },
      { score: 1, text: "Sim — reação extrema a sons cotidianos" },
    ],
  },
  {
    id: 14,
    name: "Seu filho anda?",
    options: [
      { score: 0, text: "Sim — caminha sem apoio" },
      { score: 1, text: "Não — ainda não anda de forma independente" },
    ],
  },
  {
    id: 15,
    name: "Seu filho olha nos seus olhos durante a interação?",
    options: [
      { score: 0, text: "Sim — faz contato visual ao interagir" },
      { score: 1, text: "Não — evita ou não sustenta o contato visual" },
    ],
  },
  {
    id: 16,
    name: "Seu filho tenta copiar palavras que você diz?",
    options: [
      { score: 0, text: "Sim — repete sílabas ou palavras" },
      { score: 1, text: "Não — sem tentativa de repetição verbal" },
    ],
  },
  {
    id: 17,
    name: "Você preocupa-se com a audição do seu filho?",
    options: [
      { score: 0, text: "Não — a audição parece normal" },
      { score: 1, text: "Sim — às vezes parece não ouvir" },
    ],
  },
  {
    id: 18,
    name: "Seu filho entende o que você diz?",
    options: [
      { score: 0, text: "Sim — segue instruções simples" },
      { score: 1, text: "Não — parece não compreender pedidos básicos" },
    ],
  },
  {
    id: 19,
    name: "Seu filho olha para objetos que você está olhando?",
    options: [
      { score: 0, text: "Sim — segue o direcionamento do olhar" },
      { score: 1, text: "Não — não acompanha o foco de atenção" },
    ],
  },
  {
    id: 20,
    name: "Seu filho faz gestos incomuns com as mãos perto dos olhos?",
    options: [
      { score: 0, text: "Não — sem comportamentos visuais incomuns" },
      { score: 1, text: "Sim — passa as mãos em frente aos olhos com frequência" },
    ],
  },
];

// ─── Form registry ────────────────────────────────────────────────────────────
export const FORMS: FormDefinition[] = [
  {
    id: 1,
    slug: "spi",
    name: "Sistema de Prevalência e Indicadores",
    shortName: "SPI",
    description: "Formulário oficial de triagem TEA do sistema. 14 domínios avaliados em escala Likert de 4 pontos.",
    targetAge: "2 a 18 anos",
    questionCount: 14,
    scaleInfo: "Escala 1–4 · Máx. 56 pontos",
    maxScore: 56,
    isDemo: false,
    accentColor: "#2563eb",
    questions: SPI_QUESTIONS,
    classify: (score) => {
      if (score <= 29.5) return { label: "Sem indicativo de TEA", color: "#16a34a", bgColor: "#dcfce7", level: "low" };
      if (score < 37)   return { label: "TEA Leve a Moderado",   color: "#ca8a04", bgColor: "#fef9c3", level: "medium" };
      return                  { label: "TEA Grave",               color: "#dc2626", bgColor: "#fee2e2", level: "high" };
    },
  },
  {
    id: 2,
    slug: "cars",
    name: "Childhood Autism Rating Scale",
    shortName: "CARS",
    description: "Escala de avaliação para autismo infantil. 15 áreas de desenvolvimento observadas pelo profissional de saúde.",
    targetAge: "2 anos ou mais",
    questionCount: 15,
    scaleInfo: "Escala 1–4 · Máx. 60 pontos",
    maxScore: 60,
    isDemo: true,
    accentColor: "#7c3aed",
    questions: CARS_QUESTIONS,
    classify: (score) => {
      if (score < 30) return { label: "Sem indicativo de TEA", color: "#16a34a", bgColor: "#dcfce7", level: "low" };
      if (score < 37) return { label: "TEA Leve a Moderado",   color: "#ca8a04", bgColor: "#fef9c3", level: "medium" };
      return               { label: "TEA Grave",               color: "#dc2626", bgColor: "#fee2e2", level: "high" };
    },
  },
  {
    id: 3,
    slug: "mchat",
    name: "Modified Checklist for Autism in Toddlers",
    shortName: "M-CHAT-R",
    description: "Instrumento de rastreio precoce respondido pelos pais/responsáveis. 20 perguntas sobre comportamento e comunicação.",
    targetAge: "16 a 30 meses",
    questionCount: 20,
    scaleInfo: "Sim/Não · Máx. 20 pontos de risco",
    maxScore: 20,
    isDemo: true,
    accentColor: "#0891b2",
    questions: MCHAT_QUESTIONS,
    classify: (score) => {
      if (score <= 2) return { label: "Baixo Risco de TEA",  color: "#16a34a", bgColor: "#dcfce7", level: "low" };
      if (score <= 7) return { label: "Risco Médio — Acompanhar", color: "#ca8a04", bgColor: "#fef9c3", level: "medium" };
      return               { label: "Alto Risco — Encaminhar",   color: "#dc2626", bgColor: "#fee2e2", level: "high" };
    },
  },
];

export function getFormById(id: number): FormDefinition | undefined {
  return FORMS.find((f) => f.id === id);
}

export function calcFormScore(respostas: Record<number, number>): number {
  return Object.values(respostas).reduce((s, v) => s + v, 0);
}
