import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export interface LocalPatient {
  id: string;
  serverId: number | null;
  nome: string;
  cpf: string | null;
  carteiraSus: string | null;
  dataNascimento: string | null;
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
  groupId: number | null;
  criadoEm: string;
  syncStatus: "synced" | "pending" | "error";
}

export interface LocalEvaluation {
  id: string;
  serverId: number | null;
  patientId: string;
  patientNome: string;
  avaliadorId: number;
  avaliadorNome: string;
  respostas: Record<number, number>;
  scoreTotal: number;
  classificacao: string;
  dataAvaliacao: string;
  formId: number | null;
  syncStatus: "synced" | "pending" | "error";
}

interface DbState {
  patients: LocalPatient[];
  evaluations: LocalEvaluation[];
  isLoaded: boolean;
  addPatient: (p: Omit<LocalPatient, "id" | "serverId" | "criadoEm" | "syncStatus">) => Promise<LocalPatient>;
  updatePatient: (id: string, p: Partial<LocalPatient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addEvaluation: (e: Omit<LocalEvaluation, "id" | "serverId" | "syncStatus">) => Promise<LocalEvaluation>;
  getPendingPatients: () => LocalPatient[];
  getPendingEvaluations: () => LocalEvaluation[];
  markPatientSynced: (localId: string, serverId: number) => Promise<void>;
  markEvaluationSynced: (localId: string, serverId: number) => Promise<void>;
  markPatientError: (localId: string) => Promise<void>;
  markEvaluationError: (localId: string) => Promise<void>;
  refreshFromServer: (serverPatients: ServerPatient[], serverEvals: ServerEvaluation[]) => Promise<void>;
  seedDemoPatients: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

export interface ServerPatient {
  id: number;
  nome: string;
  cpf?: string | null;
  carteira_sus?: string | null;
  data_nascimento?: string | null;
  sexo?: "masculino" | "feminino" | "outro" | null;
  nome_responsavel?: string | null;
  telefone?: string | null;
  email?: string | null;
  cep?: string | null;
  estado?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  observacoes?: string | null;
  group_id?: number | null;
  criado_em: string;
}

export interface ServerEvaluation {
  id: number;
  patient_id: number;
  patient_nome?: string;
  avaliador_id?: number;
  avaliador_nome?: string;
  respostas: Record<number, number>;
  score_total: number;
  classificacao: string;
  data_avaliacao: string;
  form_id?: number | null;
}

const DbContext = createContext<DbState | null>(null);

const PATIENTS_KEY = "spi_db_patients";
const EVALS_KEY = "spi_db_evaluations";

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function calcScore(respostas: Record<number, number>): number {
  return Object.values(respostas).reduce((s, v) => s + v, 0);
}

function getClassificacao(score: number): string {
  if (score <= 29.5) return "Sem indicativo de TEA";
  if (score < 37) return "TEA Leve a Moderado";
  return "TEA Grave";
}

export { calcScore, getClassificacao };

export const DEMO_GROUPS: { id: number; nome: string; unidade: string }[] = [
  { id: 1, nome: "UBS Centro",  unidade: "Unidade Básica de Saúde Centro" },
  { id: 2, nome: "UBS Jardins", unidade: "Unidade Básica de Saúde Jardins" },
];

export const DEMO_AGENTS: { id: number; nome: string; role: string }[] = [
  { id: 1,  nome: "Fernanda Lima",        role: "Agente de Saúde" },
  { id: 2,  nome: "Carlos Mendes",        role: "Agente de Saúde" },
  { id: 3,  nome: "Ana Beatriz Carvalho", role: "Agente de Saúde" },
  { id: 4,  nome: "Ricardo Alves",        role: "Agente de Saúde" },
  { id: 5,  nome: "Juliana Costa",        role: "Agente de Saúde" },
  { id: 6,  nome: "Marcos Vieira",        role: "Agente de Saúde" },
  { id: 7,  nome: "Patrícia Sousa",       role: "Agente de Saúde" },
  { id: 8,  nome: "Thiago Santos",        role: "Agente de Saúde" },
  { id: 9,  nome: "Camila Rodrigues",     role: "Agente de Saúde" },
  { id: 10, nome: "Leonardo Ferreira",    role: "Agente de Saúde" },
];

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<LocalPatient[]>([]);
  const [evaluations, setEvaluations] = useState<LocalEvaluation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const patientsRef = useRef<LocalPatient[]>([]);
  const evalsRef = useRef<LocalEvaluation[]>([]);

  useEffect(() => {
    patientsRef.current = patients;
  }, [patients]);
  useEffect(() => {
    evalsRef.current = evaluations;
  }, [evaluations]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pStr, eStr] = await Promise.all([
          AsyncStorage.getItem(PATIENTS_KEY),
          AsyncStorage.getItem(EVALS_KEY),
        ]);
        const p: LocalPatient[] = pStr ? JSON.parse(pStr) : [];
        const e: LocalEvaluation[] = eStr ? JSON.parse(eStr) : [];
        setPatients(p);
        setEvaluations(e);
      } catch {
        // ignore
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const savePatients = useCallback(async (list: LocalPatient[]) => {
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(list));
    setPatients(list);
  }, []);

  const saveEvals = useCallback(async (list: LocalEvaluation[]) => {
    await AsyncStorage.setItem(EVALS_KEY, JSON.stringify(list));
    setEvaluations(list);
  }, []);

  const addPatient = useCallback(async (
    p: Omit<LocalPatient, "id" | "serverId" | "criadoEm" | "syncStatus">
  ): Promise<LocalPatient> => {
    const newP: LocalPatient = {
      ...p,
      id: genId(),
      serverId: null,
      criadoEm: new Date().toISOString(),
      syncStatus: "pending",
    };
    const updated = [...patientsRef.current, newP];
    await savePatients(updated);
    return newP;
  }, [savePatients]);

  const updatePatient = useCallback(async (id: string, patch: Partial<LocalPatient>) => {
    const updated = patientsRef.current.map((p) =>
      p.id === id ? { ...p, ...patch, syncStatus: "pending" as const } : p
    );
    await savePatients(updated);
  }, [savePatients]);

  const deletePatient = useCallback(async (id: string) => {
    const updated = patientsRef.current.filter((p) => p.id !== id);
    await savePatients(updated);
  }, [savePatients]);

  const addEvaluation = useCallback(async (
    e: Omit<LocalEvaluation, "id" | "serverId" | "syncStatus">
  ): Promise<LocalEvaluation> => {
    const newE: LocalEvaluation = {
      ...e,
      id: genId(),
      serverId: null,
      syncStatus: "pending",
    };
    const updated = [...evalsRef.current, newE];
    await saveEvals(updated);
    return newE;
  }, [saveEvals]);

  const getPendingPatients = useCallback(() =>
    patientsRef.current.filter((p) => p.syncStatus === "pending"), []);

  const getPendingEvaluations = useCallback(() =>
    evalsRef.current.filter((e) => e.syncStatus === "pending"), []);

  const markPatientSynced = useCallback(async (localId: string, serverId: number) => {
    const updated = patientsRef.current.map((p) =>
      p.id === localId ? { ...p, serverId, syncStatus: "synced" as const } : p
    );
    await savePatients(updated);
  }, [savePatients]);

  const markEvaluationSynced = useCallback(async (localId: string, serverId: number) => {
    const updated = evalsRef.current.map((e) =>
      e.id === localId ? { ...e, serverId, syncStatus: "synced" as const } : e
    );
    await saveEvals(updated);
  }, [saveEvals]);

  const markPatientError = useCallback(async (localId: string) => {
    const updated = patientsRef.current.map((p) =>
      p.id === localId ? { ...p, syncStatus: "error" as const } : p
    );
    await savePatients(updated);
  }, [savePatients]);

  const markEvaluationError = useCallback(async (localId: string) => {
    const updated = evalsRef.current.map((e) =>
      e.id === localId ? { ...e, syncStatus: "error" as const } : e
    );
    await saveEvals(updated);
  }, [saveEvals]);

  const refreshFromServer = useCallback(async (
    serverPatients: ServerPatient[],
    serverEvals: ServerEvaluation[]
  ) => {
    const currentPatients = patientsRef.current;
    const currentEvals = evalsRef.current;

    const serverPatientMap = new Map(serverPatients.map((p) => [p.id, p]));
    const serverEvalMap = new Map(serverEvals.map((e) => [e.id, e]));

    const pendingPatients = currentPatients.filter((p) => p.syncStatus === "pending");
    const pendingEvals = currentEvals.filter((e) => e.syncStatus === "pending");

    const syncedPatients: LocalPatient[] = serverPatients.map((sp) => ({
      id: currentPatients.find((p) => p.serverId === sp.id)?.id ?? genId(),
      serverId: sp.id,
      nome: sp.nome,
      cpf: sp.cpf ?? null,
      carteiraSus: sp.carteira_sus ?? null,
      dataNascimento: sp.data_nascimento ?? null,
      sexo: sp.sexo ?? null,
      nomeResponsavel: sp.nome_responsavel ?? null,
      telefone: sp.telefone ?? null,
      email: sp.email ?? null,
      cep: sp.cep ?? null,
      estado: sp.estado ?? null,
      cidade: sp.cidade ?? null,
      bairro: sp.bairro ?? null,
      rua: sp.rua ?? null,
      numero: sp.numero ?? null,
      complemento: sp.complemento ?? null,
      observacoes: sp.observacoes ?? null,
      groupId: sp.group_id ?? null,
      criadoEm: sp.criado_em,
      syncStatus: "synced",
    }));

    const mergedPatients = [
      ...syncedPatients,
      ...pendingPatients.filter((p) => !serverPatientMap.has(p.serverId ?? -1)),
    ];

    const syncedEvals: LocalEvaluation[] = serverEvals.map((se) => ({
      id: currentEvals.find((e) => e.serverId === se.id)?.id ?? genId(),
      serverId: se.id,
      patientId: currentPatients.find((p) => p.serverId === se.patient_id)?.id ?? String(se.patient_id),
      patientNome: se.patient_nome ?? "",
      avaliadorId: se.avaliador_id ?? 0,
      avaliadorNome: se.avaliador_nome ?? "",
      respostas: se.respostas ?? {},
      scoreTotal: se.score_total,
      classificacao: se.classificacao,
      dataAvaliacao: se.data_avaliacao,
      formId: se.form_id ?? null,
      syncStatus: "synced",
    }));

    const mergedEvals = [
      ...syncedEvals,
      ...pendingEvals.filter((e) => !serverEvalMap.has(e.serverId ?? -1)),
    ];

    await Promise.all([
      savePatients(mergedPatients),
      saveEvals(mergedEvals),
    ]);
  }, [savePatients, saveEvals]);

  // ── Seed data ──────────────────────────────────────────────────────────────
  type SeedPatient = Omit<LocalPatient, "id" | "serverId" | "criadoEm" | "syncStatus">;

  const SEED_PATIENTS: SeedPatient[] = [
    // Group 1 — UBS Centro (5 patients)
    { nome: "Ana Clara Oliveira",     cpf: "12345678909", carteiraSus: "123456789012345", dataNascimento: "15/03/2018", sexo: "feminino",  nomeResponsavel: "Maria Oliveira",    telefone: "(11) 98765-4321", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Centro",     rua: "Rua das Flores",     numero: "42",  complemento: null, observacoes: null, groupId: 1 },
    { nome: "Juliana Ferreira Lima",  cpf: "45678912345", carteiraSus: "456789123456789", dataNascimento: "08/11/2017", sexo: "feminino",  nomeResponsavel: "Carlos Lima",       telefone: "(11) 97654-3210", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Bela Vista", rua: "Av. Paulista",       numero: "800", complemento: "Ap 3", observacoes: null, groupId: 1 },
    { nome: "Rafaela Torres Gomes",   cpf: "11122233344", carteiraSus: "111222333445566", dataNascimento: "25/12/2017", sexo: "feminino",  nomeResponsavel: "Roberto Gomes",     telefone: "(11) 93210-9876", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Sé",         rua: "Rua Xavier de Toledo", numero: "15", complemento: null, observacoes: "Acompanhamento mensal necessário", groupId: 1 },
    { nome: "Larissa Campos Melo",    cpf: "99988877766", carteiraSus: "999888777665544", dataNascimento: "07/08/2019", sexo: "feminino",  nomeResponsavel: "André Melo",        telefone: "(11) 91098-7654", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Consolação", rua: "Rua da Consolação",  numero: "230", complemento: null, observacoes: null, groupId: 1 },
    { nome: "Lucas Martins Souza",    cpf: "65432178912", carteiraSus: "654321789123456", dataNascimento: "04/09/2018", sexo: "masculino", nomeResponsavel: "Carla Souza",       telefone: "(11) 94321-0987", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Liberdade",  rua: "Rua Galvão Bueno",   numero: "77",  complemento: null, observacoes: null, groupId: 1 },
    // Group 2 — UBS Jardins (5 patients)
    { nome: "Pedro Henrique Santos",  cpf: "98765432100", carteiraSus: "987654321098765", dataNascimento: "22/07/2016", sexo: "masculino", nomeResponsavel: "João Santos",       telefone: "(11) 91234-5678", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Jardins",    rua: "Rua Oscar Freire",   numero: "100", complemento: null, observacoes: null, groupId: 2 },
    { nome: "Gustavo Almeida Costa",  cpf: "78912345678", carteiraSus: "789123456789012", dataNascimento: "30/01/2019", sexo: "masculino", nomeResponsavel: "Fernanda Costa",    telefone: "(11) 96543-2109", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Jardim Paulista", rua: "Rua Haddock Lobo", numero: "360", complemento: "Casa", observacoes: "Histórico familiar de TEA", groupId: 2 },
    { nome: "Isabela Rocha Nunes",    cpf: "32165498700", carteiraSus: "321654987001234", dataNascimento: "17/06/2015", sexo: "feminino",  nomeResponsavel: "Paulo Nunes",       telefone: "(11) 95432-1098", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Itaim Bibi", rua: "Rua Iguatemi",       numero: "9",   complemento: null, observacoes: null, groupId: 2 },
    { nome: "Matheus Barbosa Cruz",   cpf: "55566677788", carteiraSus: "555666777889900", dataNascimento: "11/04/2016", sexo: "masculino", nomeResponsavel: "Sônia Cruz",        telefone: "(11) 92109-8765", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Pinheiros",  rua: "Rua dos Pinheiros",  numero: "55",  complemento: null, observacoes: null, groupId: 2 },
    { nome: "Vinícius Pereira Dias",  cpf: "44455566677", carteiraSus: "444555666778899", dataNascimento: "13/02/2020", sexo: "masculino", nomeResponsavel: "Lúcia Dias",        telefone: "(11) 90987-6543", email: null, cep: null, estado: "SP", cidade: "São Paulo",      bairro: "Moema",      rua: "Av. Ibirapuera",     numero: "2927", complemento: null, observacoes: null, groupId: 2 },
  ];

  // Evaluation data per patient: [agentIdx, score, daysAgo, formId, syncStatus]
  const SEED_EVAL_CONFIGS: [number, number, number, number, "synced" | "pending"][] = [
    [0, 18, 2,  1, "synced"],   // Ana Clara    → Sem TEA
    [2, 33, 7,  1, "synced"],   // Juliana      → Leve/Mod
    [6, 48, 5,  1, "synced"],   // Rafaela      → Grave
    [8, 31, 12, 1, "pending"],  // Larissa       → Leve/Mod
    [5, 35, 18, 1, "synced"],  // Lucas         → Leve/Mod
    [1, 38, 3,  1, "synced"],   // Pedro         → Grave
    [3, 42, 10, 1, "synced"],   // Gustavo       → Grave
    [4, 25, 21, 1, "synced"],   // Isabela       → Sem TEA
    [7, 22, 15, 1, "pending"],  // Matheus       → Sem TEA
    [9, 15, 28, 1, "synced"],   // Vinícius      → Sem TEA
  ];

  // Build respostas (answer map) from a target score using a stable deterministic spread
  function makeRespostas(target: number, seed: number = 0): Record<number, number> {
    const r: Record<number, number> = {};
    for (let i = 1; i <= 14; i++) r[i] = 1;
    let remaining = target - 14;
    let i = (seed % 14) + 1;
    while (remaining > 0) {
      if (r[i] < 4) { r[i]++; remaining--; }
      i = (i % 14) + 1;
    }
    return r;
  }

  const seedDemoPatients = useCallback(async () => {
    const existing = patientsRef.current;
    const existingEvals = evalsRef.current;
    const existingCpfs = new Set(existing.map((p) => p.cpf).filter(Boolean));
    const toAdd = SEED_PATIENTS.filter((s) => !existingCpfs.has(s.cpf));

    if (toAdd.length === 0) return; // Already seeded

    const now = new Date();
    const newPatients: LocalPatient[] = toAdd.map((p) => ({
      ...p,
      id: genId(),
      serverId: null,
      criadoEm: now.toISOString(),
      syncStatus: "pending" as const,
    }));

    const allPatients = [...existing, ...newPatients];

    // Build evaluations paired with the new patients in order
    const existingEvalNames = new Set(existingEvals.map((e) => e.patientNome));
    const newEvals: LocalEvaluation[] = newPatients
      .map((patient, idx) => {
        if (existingEvalNames.has(patient.nome)) return null;
        const cfg = SEED_EVAL_CONFIGS[SEED_PATIENTS.findIndex((s) => s.cpf === patient.cpf)];
        if (!cfg) return null;
        const [agentIdx, score, daysAgo, formId, syncStatus] = cfg;
        const agent = DEMO_AGENTS[agentIdx];
        const date = new Date(now.getTime() - daysAgo * 86_400_000);
        date.setHours(8 + (idx % 8), (idx * 7) % 60, 0, 0);
        const respostas = makeRespostas(score, idx);
        const ev: LocalEvaluation = {
          id: genId(),
          serverId: syncStatus === "synced" ? 1000 + idx : null,
          patientId: patient.id,
          patientNome: patient.nome,
          avaliadorId: agent.id,
          avaliadorNome: agent.nome,
          respostas,
          scoreTotal: score,
          classificacao: getClassificacao(score),
          dataAvaliacao: date.toISOString(),
          formId,
          syncStatus,
        };
        return ev;
      })
      .filter((e): e is NonNullable<typeof e> => e !== null) as LocalEvaluation[];

    await Promise.all([
      savePatients(allPatients),
      saveEvals([...existingEvals, ...newEvals]),
    ]);
  }, [savePatients, saveEvals]);

  const clearAllData = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(PATIENTS_KEY),
      AsyncStorage.removeItem(EVALS_KEY),
    ]);
    setPatients([]);
    setEvaluations([]);
  }, []);

  return (
    <DbContext.Provider
      value={{
        patients,
        evaluations,
        isLoaded,
        addPatient,
        updatePatient,
        deletePatient,
        addEvaluation,
        getPendingPatients,
        getPendingEvaluations,
        markPatientSynced,
        markEvaluationSynced,
        markPatientError,
        markEvaluationError,
        refreshFromServer,
        seedDemoPatients,
        clearAllData,
      }}
    >
      {children}
    </DbContext.Provider>
  );
}

export function useDb() {
  const ctx = useContext(DbContext);
  if (!ctx) throw new Error("useDb must be used within DbProvider");
  return ctx;
}
