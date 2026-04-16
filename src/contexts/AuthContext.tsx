import api from "@/service/api";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── API client ───────────────────────────────────────────────────────────────

export const apiClient = api;

// Inject access token automatically on every request
apiClient.interceptors.request.use((config) => {
  const tokens = loadTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────

/** Dados mínimos extraídos do JWT */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

/** Dados completos do utilizador retornados por GET /users/{id} */
export interface UserAllData {
  id: string;
  fullName: string;
  email: string;
  position: string | null;
  phoneNumber: string | null;
  organizationalUnitId: string | null;
  roles: string[];
  status: number | string;
  createdAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface AuthContextType {
  /** Dados básicos do JWT (sempre disponíveis quando autenticado) */
  user: AuthUser | null;
  /** Dados completos do utilizador vindos da API (pode ser null enquanto carrega) */
  userAllData: UserAllData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
  /** Força um novo fetch dos dados completos do utilizador */
  refreshUserAllData: () => Promise<void>;
}

let refreshTokenMemory: string | null = null;

// ─── JWT helpers ──────────────────────────────────────────────────────────────

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    // TextDecoder lida corretamente com caracteres UTF-8 multi-byte (é, ã, ç…)
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder("utf-8").decode(bytes));
  } catch {
    return null;
  }
}

function extractUser(token: string): AuthUser | null {
  const payload = parseJwt(token);
  if (!payload) return null;

  const id =
    (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] as string) ?? "";
  const email =
    (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string) ??
    (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string) ??
    "";
  const fullName = (payload["full_name"] as string) ?? email;
  const role =
    (payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string) ?? "";

  return { id, email, fullName, role };
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "auth_tokens";

function saveTokens(tokens: AuthTokens) {
  // guardar apenas accessToken no localStorage
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: tokens.accessToken,
      expiresAt: tokens.expiresAt,
    })
  );

  // refreshToken só em memória
  refreshTokenMemory = tokens.refreshToken;
}

function loadTokens(): { accessToken: string; expiresAt: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
  refreshTokenMemory = null;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && refreshTokenMemory) {
      try {
        const { data } = await apiClient.post<AuthTokens>("/auth/refresh", {
          refreshToken: refreshTokenMemory,
        });

        saveTokens(data);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        clearTokens();
      }
    }

    return Promise.reject(error);
  }
);

// ─── Fetch full user data ────────────────────────────────────────────────────

async function fetchUserAllData(userId: string): Promise<UserAllData | null> {
  try {
    const { data } = await apiClient.get<{ user: UserAllData }>(`/users/${userId}`);
    return data.user;
  } catch {
    return null;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userAllData, setUserAllData] = useState<UserAllData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sessão a partir do localStorage no mount
  useEffect(() => {
    const tokens = loadTokens();
    if (tokens) {
      const isExpired = new Date(tokens.expiresAt) <= new Date();
      if (!isExpired) {
        const authUser = extractUser(tokens.accessToken);
        setUser(authUser);
        // Buscar dados completos em segundo plano — não bloqueia o render
        if (authUser) {
          fetchUserAllData(authUser.id).then(setUserAllData);
        }
      } else {
        clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthTokens>("/auth/login", { email, password });
    saveTokens(data);
    const authUser = extractUser(data.accessToken);
    setUser(authUser);
    // Buscar dados completos logo após login
    if (authUser) {
      const allData = await fetchUserAllData(authUser.id);
      setUserAllData(allData);
    }
  };

  const signOut = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignorar erros de rede — limpar estado local de qualquer forma
    } finally {
      clearTokens();
      setUser(null);
      setUserAllData(null);
    }
  };

  const refreshUserAllData = async () => {
    if (!user) return;
    const allData = await fetchUserAllData(user.id);
    setUserAllData(allData);
  };

  const getAccessToken = (): string | null => loadTokens()?.accessToken ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        userAllData,
        isLoading,
        isAuthenticated: !!user,
        login,
        signOut,
        getAccessToken,
        refreshUserAllData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}