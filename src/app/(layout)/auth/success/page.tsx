"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthSuccessPage() {
  const { login } = useAuth();

  useEffect(() => {
    (async () => {
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) return window.location.replace("/auth");
      try {
        await login(token);
        window.location.replace("/");
      } catch (e) {
        console.error("login error:", e);
        window.location.replace("/auth");
      }
    })();
  }, [login]);

  return null;
}
