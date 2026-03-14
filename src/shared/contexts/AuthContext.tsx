import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getToken, isJwtExpired, clearToken } from "../../auth";
import api from "../../api/client";

export interface User {
  id: number;
  name: string;
  email: string;
  isProfileCompleted: boolean;
  profileImage?: string;
  gender?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get("/users/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token && !isJwtExpired(token)) {
      fetchUser();
    } else {
      if (token) clearToken();
      setIsLoading(false);
    }
  }, []);

  const login = (token: string) => {
    // A função setToken fica no componente de Login ou podemos importar aqui.
    // Vamos apenas disparar o fetch.
    setIsLoading(true);
    fetchUser();
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
