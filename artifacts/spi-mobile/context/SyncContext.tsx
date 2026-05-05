import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import { useAuth } from "./AuthContext";
import { useDb } from "./DbContext";
import { resolveApiUrl } from "@/utils/apiUrl";

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingCount: number;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncState | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const db = useDb();
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const syncInProgress = useRef(false);

  const pendingCount =
    db.getPendingPatients().length + db.getPendingEvaluations().length;

  const checkOnline = useCallback(async (): Promise<boolean> => {
    try {
      const apiUrl = await resolveApiUrl();
      if (!apiUrl) return false;
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${apiUrl}/api/healthz`, {
        signal: controller.signal,
      }).finally(() => clearTimeout(tid));
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (syncInProgress.current || !token) return;
    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const base = await resolveApiUrl();
      if (!base) return;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const online = await checkOnline();
      setIsOnline(online);
      if (!online) return;

      // 1. Push pending patients
      const pendingPatients = db.getPendingPatients();
      for (const p of pendingPatients) {
        try {
          const body = {
            nome: p.nome,
            cpf: p.cpf ?? "",
            carteira_sus: p.carteiraSus ?? "",
            data_nascimento: p.dataNascimento ?? "",
            sexo: p.sexo ?? "outro",
            nome_responsavel: p.nomeResponsavel ?? undefined,
            telefone: p.telefone ?? undefined,
            email: p.email ?? undefined,
            cep: p.cep ?? undefined,
            estado: p.estado ?? undefined,
            cidade: p.cidade ?? undefined,
            bairro: p.bairro ?? undefined,
            rua: p.rua ?? undefined,
            numero: p.numero ?? undefined,
            complemento: p.complemento ?? undefined,
            observacoes: p.observacoes ?? undefined,
            group_id: p.groupId ?? undefined,
          };
          const method = p.serverId ? "PUT" : "POST";
          const url = p.serverId ? `${base}/api/patients/${p.serverId}` : `${base}/api/patients`;
          const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
          if (res.ok) {
            const data = await res.json();
            await db.markPatientSynced(p.id, Number(data.id ?? data.Id ?? p.serverId));
          } else {
            await db.markPatientError(p.id);
          }
        } catch {
          await db.markPatientError(p.id);
        }
      }

      // 2. Push pending evaluations
      const pendingEvals = db.getPendingEvaluations();
      for (const e of pendingEvals) {
        try {
          const patient = db.patients.find((p) => p.id === e.patientId);
          const serverPatientId = patient?.serverId;
          if (!serverPatientId) continue;

          const body = {
            patient_id: serverPatientId,
            avaliador_id: e.avaliadorId,
            respostas: e.respostas,
            score_total: e.scoreTotal,
            classificacao: e.classificacao,
            data_avaliacao: e.dataAvaliacao,
            form_id: e.formId ?? undefined,
          };
          const res = await fetch(`${base}/api/evaluations`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
          });
          if (res.ok) {
            const data = await res.json();
            await db.markEvaluationSynced(e.id, Number(data.id ?? data.Id ?? e.serverId));
          } else {
            await db.markEvaluationError(e.id);
          }
        } catch {
          await db.markEvaluationError(e.id);
        }
      }

      // 3. Pull latest from server
      const [pRes, eRes] = await Promise.all([
        fetch(`${base}/api/patients`, { headers }),
        fetch(`${base}/api/evaluations`, { headers }),
      ]);

      if (pRes.ok && eRes.ok) {
        const [serverPatients, serverEvals] = await Promise.all([
          pRes.json(),
          eRes.json(),
        ]);
        await db.refreshFromServer(
          Array.isArray(serverPatients) ? serverPatients : [],
          Array.isArray(serverEvals) ? serverEvals : []
        );
      }

      setLastSync(new Date());
    } catch {
      // silent
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
    }
  }, [token, db, checkOnline]);

  // Periodic connectivity check
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const runCheck = async () => {
      const online = await checkOnline();
      setIsOnline(online);
      if (online && token && db.isLoaded) {
        syncNow();
      }
    };

    runCheck();
    intervalId = setInterval(runCheck, 30000);
    return () => clearInterval(intervalId);
  }, [checkOnline, syncNow, token, db.isLoaded]);

  // Sync when app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && token) {
        syncNow();
      }
    });
    return () => sub.remove();
  }, [syncNow, token]);

  return (
    <SyncContext.Provider value={{ isOnline, isSyncing, lastSync, pendingCount, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
}
