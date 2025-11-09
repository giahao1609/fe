"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string) => Promise<void>;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // ✅ Giải mã token JWT để lấy thông tin user sơ bộ (Google, Local)
  const decodeUserFromToken = (t: string) => {
    try {
      const decoded: any = jwtDecode(t);
      setUser({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture || null, // hỗ trợ Google avatar
      });
    } catch (err) {
      console.warn("⚠️ Token decode lỗi, vẫn giữ nguyên token");
    }
  };

  // ✅ Gọi API backend để lấy thông tin chính xác nhất (nếu token hợp lệ)
  const loadUser = async (jwt?: string) => {
    const t = jwt || localStorage.getItem("token");
    if (!t) return;

    setToken(t);
    decodeUserFromToken(t);

    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (res.data?.email || res.data?.name) {
        setUser({
          ...res.data,
          picture: res.data.picture || user?.picture || null,
        });
      } else {
        console.warn("⚠️ /auth/me không trả user hợp lệ");
      }
    } catch (err) {
      console.error("❌ Lỗi tải user:", err);
    }
  };

  // ✅ Khi app load lại → kiểm tra token trong localStorage
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      decodeUserFromToken(t);
      loadUser(t);
      api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    }
  }, []);

  // ✅ Khi login xong
  const login = async (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
    decodeUserFromToken(t);

    // Gắn token vào axios instance để các request sau có Bearer tự động
    api.defaults.headers.common["Authorization"] = `Bearer ${t}`;

    await loadUser(t);
  };

  // ✅ Khi logout
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
    window.location.href = "/auth";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        reloadUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
