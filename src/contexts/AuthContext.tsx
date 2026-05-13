// AuthContext.tsx
import api from "@/service/api";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const apiClient = api;

// Dados do utilizador retornados por GET auth/me
export interface AuthUser {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  roleCode: string;
  isActive: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar usuário atual no mount (se houver cookie/sessão ativa)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get<AuthUser>("auth/me");
        setUser(response.data);
      } catch (error) {
        // Sessão não existe ou expirou
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    // Login - backend salva o cookie automaticamente
    await api.post("auth/login", { email, password });
    
    // Após login, buscar dados do usuário
    const response = await api.get<AuthUser>("auth/me");
    setUser(response.data);
  };

  const signOut = async () => {
    try {
      await api.post("auth/logout");
    } catch {
      // Ignorar erros de rede
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get<AuthUser>("auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signOut,
        refreshUser,
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