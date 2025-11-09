"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface RegisterFormProps {
  onSwitchTab?: () => void;
}

export default function RegisterForm({ onSwitchTab }: RegisterFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    accept: true,
  });
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");

    if (form.username.trim().length < 2) {
      setMsg("Tên hiển thị tối thiểu 2 ký tự.");
      return;
    }
    if (!form.accept) {
      setMsg("Vui lòng đồng ý Điều khoản & Chính sách.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setMsg("✅ Tạo tài khoản thành công! Mời bạn đăng nhập.");
      setTimeout(
        () => (onSwitchTab ? onSwitchTab() : router.push("/auth")),
        700
      );
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "❌ Không thể đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[360px] text-left">
      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
        Tạo tài khoản
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Lưu quán yêu thích, nhận gợi ý chuẩn vị & ưu đãi ☕️
      </p>

      <form onSubmit={handleRegister} className="mt-4 flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-800">
          Tên hiển thị
        </label>
        <input
          placeholder="vd: anhtuan, minhthu…"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          required
        />

        <label className="text-sm font-medium text-gray-800">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          required
        />

        <label className="text-sm font-medium text-gray-800">Mật khẩu</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-11 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
            minLength={6}
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

        <label className="mt-1 flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={form.accept}
            onChange={(e) => setForm({ ...form, accept: e.target.checked })}
          />
          Tôi đồng ý{" "}
          <a href="/policy" className="text-rose-700 hover:underline">
            Điều khoản & Chính sách
          </a>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? "Đang xử lý…" : "TẠO TÀI KHOẢN"}
        </button>
      </form>

      {msg && <p className="mt-3 text-sm text-gray-700">{msg}</p>}

      <p className="mt-5 text-xs text-gray-500">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={onSwitchTab}
          className="font-medium text-rose-700 hover:underline"
        >
          Đăng nhập
        </button>
      </p>
    </div>
  );
}
