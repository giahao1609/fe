"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api"; // ✅ import instance chung

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  //  Gửi email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAction(async () => {
      await api.post("/auth/forgot-password", { email });
      setMessage(" Mã xác nhận đã được gửi tới email của bạn!");
      setStep(2);
    });
  };

  //  Xác minh mã
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAction(async () => {
      await api.post("/auth/verify-code", { email, code });
      setMessage(" Mã hợp lệ, mời bạn đặt lại mật khẩu mới!");
      setStep(3);
    });
  };

  //  Đặt lại mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirm) {
      setMessage(" Mật khẩu nhập lại không khớp!");
      return;
    }

    await handleAction(async () => {
      await api.post("/auth/reset-password", { email, newPassword });
      setMessage(" Đặt lại mật khẩu thành công! Đang quay lại đăng nhập...");
      setTimeout(() => router.push("/auth"), 1500);
    });
  };

  //  Hàm tiện ích xử lý action + loading
  const handleAction = async (fn: () => Promise<void>) => {
    setLoading(true);
    setMessage("");
    try {
      await fn();
    } catch (err: any) {
      setMessage(err.response?.data?.message || " Đã xảy ra lỗi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#fff8f8] via-[#ffecec] to-[#fff0f0]">
      <div className="backdrop-blur-md bg-white/80 border border-gray-200 rounded-3xl shadow-2xl px-10 py-12 w-[420px] text-gray-800 transition-all duration-300">
        {/*  Thanh tiến trình */}
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-2 flex-1 mx-1 rounded-full ${
                num <= step ? "bg-red-500" : "bg-gray-200"
              }`}
            ></div>
          ))}
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-8 text-red-600 tracking-tight">
          {step === 1 && "Quên mật khẩu"}
          {step === 2 && "Nhập mã xác nhận"}
          {step === 3 && "Đặt lại mật khẩu"}
        </h2>

        {/*  Nội dung từng bước */}
        <div className="animate-fadeIn space-y-6">
          {/* 📨 Bước 1: Nhập email */}
          {step === 1 && (
            <form onSubmit={handleSendEmail} className="space-y-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email của bạn
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none transition"
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg text-white font-semibold transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
              </button>
            </form>
          )}

          {/*  Bước 2: Nhập mã xác nhận */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã xác nhận (6 số)
              </label>
              <input
                type="text"
                placeholder="Nhập mã PIN"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full bg-transparent border border-gray-300 rounded-lg px-4 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-red-400 outline-none transition"
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg text-white font-semibold transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Đang xác minh..." : "Xác nhận"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-red-500 underline block mx-auto mt-2"
              >
                Quay lại nhập email
              </button>
            </form>
          )}

          {/*  Bước 3: Đặt lại mật khẩu */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-transparent border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập lại mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full bg-transparent border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg text-white font-semibold transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Đang đổi..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}
        </div>

        {/*  Thông báo */}
        {message && (
          <p className="text-center text-sm mt-6 text-gray-700 animate-fadeIn">
            {message}
          </p>
        )}

        <p className="text-center text-sm text-gray-600 mt-8">
          Quay lại{" "}
          <button
            onClick={() => router.push("/auth")}
            className="text-red-500 font-semibold underline hover:text-red-600 transition"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}
