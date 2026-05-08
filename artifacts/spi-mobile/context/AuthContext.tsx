import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveApiUrl } from "@/utils/apiUrl";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "admin" | "analista" | "agente_saude" | "gestor";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  groupIds: number[];
  groupNames: string[];
  criado_em: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  canViewDashboard: () => boolean;
  canViewPatients: () => boolean;
  canManagePatients: () => boolean;
  canViewEvaluations: () => boolean;
  canCreateEvaluations: () => boolean;
  canManageGroups: () => boolean;
  canManageUsers: () => boolean;
  canManageSpecialists: () => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem("spi_token"),
          AsyncStorage.getItem("spi_user"),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const baseUrl = await resolveApiUrl();

    if (!baseUrl) {
      throw new Error(
        "URL da API não configurada. Acesse Configurações e informe o endereço do servidor."
      );
    }

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const detail = (body as { detail?: string }).detail?.trim();
      if (detail) throw new Error(detail);
      if (res.status === 401) throw new Error("Credenciais inválidas.");
      throw new Error("Erro ao fazer login.");
    }

    const data = await res.json();

    const rawUser = (data.user ?? data.User ?? {}) as Record<string, unknown>;
    const normalizedUser: AuthUser = {
      id: Number(rawUser.id ?? rawUser.Id ?? 0),
      nome: String(rawUser.nome ?? rawUser.Nome ?? ""),
      email: String(rawUser.email ?? rawUser.Email ?? ""),
      role: String(rawUser.role ?? rawUser.Role ?? "agente_saude") as UserRole,
      ativo: Boolean(rawUser.ativo ?? rawUser.Ativo ?? false),
      groupIds: Array.isArray(rawUser.groupIds) ? (rawUser.groupIds as number[]) : [],
      groupNames: Array.isArray(rawUser.groupNames) ? (rawUser.groupNames as string[]) : [],
      criado_em: String(rawUser.criado_em ?? rawUser.CriadoEm ?? new Date().toISOString()),
    };
    const accessToken = String(data.access_token ?? data.AccessToken ?? "");

    await Promise.all([
      AsyncStorage.setItem("spi_token", accessToken),
      AsyncStorage.setItem("spi_user", JSON.stringify(normalizedUser)),
    ]);
    setToken(accessToken);
    setUser(normalizedUser);
  };

  const loginDemo = async (name: string, role: UserRole = "admin") => {
    const emailMap: Record<UserRole, string> = {
      admin: "admin@spi.local",
      gestor: "gestor@spi.local",
      agente_saude: "agente@spi.local",
      analista: "analista@spi.local",
    };
    const demoUser: AuthUser = {
      id: 0,
      nome: name || "Demo",
      email: emailMap[role],
      role,
      ativo: true,
      groupIds: [],
      groupNames: [],
      criado_em: new Date().toISOString(),
    };
    const demoToken = `demo_token_${role}`;
    await Promise.all([
      AsyncStorage.setItem("spi_token", demoToken),
      AsyncStorage.setItem("spi_user", JSON.stringify(demoUser)),
    ]);
    setToken(demoToken);
    setUser(demoUser);
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem("spi_token"),
      AsyncStorage.removeItem("spi_user"),
    ]);
    setToken(null);
    setUser(null);
  };

  const role = user?.role;

  const isAdmin = () => role === "admin";

  // Analista: leitura total, sem criação/edição
  // Agente de Saúde: cria pacientes e avaliações, sem painel analítico
  // Gestor: gerencia tudo exceto configurações do servidor
  // Admin: acesso irrestrito
  const canViewDashboard   = () => role === "admin" || role === "analista" || role === "gestor";
  const canViewPatients    = () => role === "admin" || role === "gestor" || role === "agente_saude" || role === "analista";
  const canManagePatients  = () => role === "admin" || role === "gestor" || role === "agente_saude";
  const canViewEvaluations = () => role === "admin" || role === "gestor" || role === "agente_saude" || role === "analista";
  const canCreateEvaluations = () => role === "admin" || role === "gestor" || role === "agente_saude";
  const canManageGroups    = () => role === "admin" || role === "gestor";
  const canManageUsers     = () => role === "admin" || role === "gestor";
  const canManageSpecialists = () => role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginDemo,
        logout,
        isAdmin,
        canViewDashboard,
        canViewPatients,
        canManagePatients,
        canViewEvaluations,
        canCreateEvaluations,
        canManageGroups,
        canManageUsers,
        canManageSpecialists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
