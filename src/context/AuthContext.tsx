"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthService, type AuthUser } from "@/services/auth.service";
import { ApiService, nameCookies } from "@/services/api.service";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user?: AuthUser | null) => Promise<void>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  reloadUser: async () => {},
});

const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

const getTokenFromCookies = (): string | null => {
  if (!isBrowser) return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${nameCookies}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] || "");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const reloadUser = async () => {
    if (!isBrowser) return;

    const cookieToken = getTokenFromCookies();
    if (!cookieToken) {
      setUser(null);
      setToken(null);
      ApiService.setToken(null);
      return;
    }

    ApiService.setToken(cookieToken);
    setToken(cookieToken);

    try {
      const me = await AuthService.me();
      setUser(me || null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      await reloadUser();
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (accessToken: string, userFromApi?: AuthUser | null) => {
    if (!isBrowser) return;

    ApiService.setToken(accessToken);
    setToken(accessToken);

    if (userFromApi) {
      setUser(userFromApi);
    } else {
      try {
        const me = await AuthService.me();
        setUser(me || null);
      } catch {
        setUser(null);
      }
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
    ApiService.setToken(null);

    if (isBrowser) {
      window.location.href = "/auth";
    }
  };

  if (!hydrated && isBrowser) {
    // tránh flicker/hydration issue trên client
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
