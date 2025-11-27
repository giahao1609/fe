"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // tiện ích wrap loading + message
  const handleAction = async (fn: () => Promise<void>) => {
    setLoading(true);
    setMessage("");
    try {
      await fn();
    } catch (err: any) {
      const raw = err?.message || "";
      if (raw) setMessage(raw);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage("Vui lòng nhập email.");
      return;
    }

    await handleAction(async () => {
      await AuthService.forgotPassword(email.trim());
      setMessage("Mã xác nhận đã được gửi tới email của bạn!");
      setStep(2);
    });
  };

  const handleNextFromCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage("Vui lòng nhập mã xác nhận.");
      return;
    }
    if (code.trim().length < 4) {
      setMessage("Mã xác nhận không hợp lệ, vui lòng kiểm tra lại.");
      return;
    }

    setMessage("Mã đã được nhập, mời bạn đặt lại mật khẩu mới!");
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirm) {
      setMessage("Vui lòng nhập đầy đủ mật khẩu mới và xác nhận.");
      return;
    }

    if (newPassword !== confirm) {
      setMessage("Mật khẩu nhập lại không khớp!");
      return;
    }

    await handleAction(async () => {
      const ok = await AuthService.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });

      if (ok) {
        setMessage("Đặt lại mật khẩu thành công! Đang quay lại đăng nhập...");
        setTimeout(() => router.push("/auth"), 1500);
      }
    });
  };

  const isSuccessMessage =
    message.includes("thành công") || message.includes("Mã xác nhận đã được gửi");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1200px_800px_at_top,#ffe4e6_0%,transparent_60%),radial-gradient(1000px_800px_at_bottom,#fef3c7_0%,transparent_60%)]">
      <div className="mx-4 flex max-w-4xl flex-col gap-6 rounded-[28px] border border-rose-100 bg-white/80 p-6 shadow-2xl backdrop-blur-md sm:p-8 lg:flex-row lg:p-10">
        {/* Cột bên trái: intro + steps */}
        <div className="flex flex-1 flex-col justify-between border-b border-rose-50 pb-6 pr-0 sm:pr-6 lg:border-b-0 lg:border-r">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Bảo mật tài khoản FoodTour
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Quên mật khẩu?
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Đừng lo, chúng mình sẽ giúp bạn lấy lại quyền truy cập. Chỉ cần vài
              bước: nhập email, kiểm tra mã xác nhận và đặt mật khẩu mới.
            </p>

            {/* Step timeline */}
            <div className="mt-6 space-y-4">
              {[
                {
                  id: 1,
                  title: "Nhập email",
                  desc: "Chúng mình sẽ gửi mã xác nhận tới email của bạn.",
                },
                {
                  id: 2,
                  title: "Nhập mã xác nhận",
                  desc: "Điền mã 6 số vừa nhận để xác minh.",
                },
                {
                  id: 3,
                  title: "Đặt mật khẩu mới",
                  desc: "Chọn mật khẩu mới an toàn và dễ nhớ.",
                },
              ].map((item, index) => {
                const active = step === item.id;
                const done = step > item.id;
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                          done
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : active
                            ? "border-rose-500 bg-rose-50 text-rose-600"
                            : "border-gray-200 bg-white text-gray-400"
                        }`}
                      >
                        {done ? "✓" : item.id}
                      </div>
                      {index < 2 && (
                        <div className="mt-1 h-10 w-px bg-gradient-to-b from-gray-200 to-gray-100" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          active
                            ? "text-gray-900"
                            : done
                            ? "text-emerald-700"
                            : "text-gray-600"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email khôi phục để
            đảm bảo an toàn cho tài khoản.
          </p>
        </div>

        {/* Cột bên phải: form động */}
        <div className="flex-1 pt-4 lg:pt-0">
          <div className="rounded-2xl bg-white/90 p-5 shadow-inner sm:p-6">
            {/* Title theo step */}
            <div className="mb-5 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose-400">
                Bước {step}/3
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                {step === 1 && "Nhập email khôi phục"}
                {step === 2 && "Nhập mã xác nhận"}
                {step === 3 && "Đặt lại mật khẩu"}
              </h2>
            </div>

            {/* Form từng bước */}
            <div className="space-y-6">
              {step === 1 && (
                <form onSubmit={handleSendEmail} className="space-y-5">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span>Địa chỉ email</span>
                      <span className="text-xs text-gray-400">(đang dùng cho FoodTour)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all ${
                      loading
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-rose-500 to-amber-400 hover:brightness-105"
                    }`}
                  >
                    {loading ? "Đang gửi mã..." : "Gửi mã xác nhận"}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleNextFromCode} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mã xác nhận (6 số)
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập mã PIN trong email"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-center text-lg tracking-[0.4em] outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    />
                    <p className="text-xs text-gray-500">
                      Không thấy email? Thử kiểm tra mục <b>Spam / Quảng cáo</b>.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all ${
                        loading
                          ? "cursor-not-allowed bg-gray-400"
                          : "bg-gradient-to-r from-rose-500 to-amber-400 hover:brightness-105"
                      }`}
                    >
                      {loading ? "Đang kiểm tra..." : "Tiếp tục"}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nhập lại mật khẩu
                    </label>
                    <input
                      type="password"
                      placeholder="Gõ lại mật khẩu mới"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`mt-1 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all ${
                      loading
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-gradient-to-r from-rose-500 to-amber-400 hover:brightness-105"
                    }`}
                  >
                    {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                  </button>
                </form>
              )}
            </div>

            {/* Thông báo */}
            {message && (
              <div
                className={`mt-6 rounded-xl border px-4 py-3 text-xs sm:text-sm ${
                  isSuccessMessage
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {message}
              </div>
            )}

            <p className="mt-6 text-center text-xs text-gray-500">
              Nhớ mật khẩu rồi?{" "}
              <button
                onClick={() => router.push("/auth")}
                className="font-semibold text-rose-600 underline-offset-2 hover:underline"
              >
                Quay lại đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
