"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthService } from "@/services/auth.service";

interface LoginFormProps {
  onSwitchTab?: () => void;
}

export default function LoginForm({ onSwitchTab }: LoginFormProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    if (!form.email || !form.password) {
      setMsg("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const res = await AuthService.login({
        email: form.email.trim(),
        password: form.password,
      });

      if (res?.accessToken) {
        await login(res.accessToken, res.user);
        setMsg("✅ Đăng nhập thành công!");
        router.push("/");
      }
    } catch (err: any) {
      const rawMsg = err?.message || "";

      if (rawMsg === "INVALID_CREDENTIALS") {
        setMsg("Email hoặc mật khẩu không đúng, vui lòng kiểm tra lại.");
      } else if (!rawMsg) {
        setMsg("❌ Đăng nhập thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="w-full max-w-[360px] text-left">
      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
        Đăng nhập
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Tiếp tục FoodTour, tìm quán ngon gần bạn 🍜
      </p>

    

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-800">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          required
        />

        <label className="mt-1 text-sm font-medium text-gray-800">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-11 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-rose-600"
          >
            {showPw ? "Ẩn" : "Hiện"}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" className="rounded border-gray-300" />
            Ghi nhớ tôi
          </label>
          <button
            type="button"
            onClick={() => router.push("/auth/forgot")}
            className="text-xs text-rose-700 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? "Đang xử lý…" : "ĐĂNG NHẬP"}
        </button>
      </form>

      {msg && <p className="mt-3 text-sm text-red-700 ">{msg}</p>}

      <p className="mt-5 text-xs text-gray-500">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={onSwitchTab}
          className="font-medium text-rose-700 hover:underline"
        >
          Tạo tài khoản
        </button>
      </p>
    </div>
  );
}
