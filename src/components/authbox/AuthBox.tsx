"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthBox() {
  const [right, setRight] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-120px)] bg-[radial-gradient(1200px_600px_at_80%_-10%,#ffe7e6_0%,transparent_60%),radial-gradient(900px_500px_at_0%_110%,#fff3cd_0%,transparent_60%)]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-50 via-white to-amber-50" />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        {/* logo / tagline */}
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-600 text-white shadow-md">
            <span className="text-2xl">🍜</span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">
            Food<span className="text-rose-600">Tour</span> — tài khoản của bạn
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Lưu quán yêu thích, theo dõi ưu đãi, gợi ý đúng “khẩu vị”.
          </p>
        </div>

        {/* container: 2 cột cố định trên lg; mobile stack */}
        <div className="relative grid w-full overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-xl lg:grid-cols-2">
          {/* Cột trái: Login / Register (toggle trong cùng khối) */}
          <div className="relative flex min-h-[520px] items-center justify-center px-6 py-10">
            {/* Login */}
            <div
              className={`absolute inset-0 flex items-center justify-center px-6 py-10 transition-all duration-400 ${
                right
                  ? "pointer-events-none translate-x-[-8%] opacity-0"
                  : "pointer-events-auto translate-x-0 opacity-100"
              }`}
              aria-hidden={right}
            >
              <LoginForm onSwitchTab={() => setRight(true)} />
            </div>

            {/* Register */}
            <div
              className={`absolute inset-0 flex items-center justify-center px-6 py-10 transition-all duration-400 ${
                right
                  ? "pointer-events-auto translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-[8%] opacity-0"
              }`}
              aria-hidden={!right}
            >
              <RegisterForm onSwitchTab={() => setRight(false)} />
            </div>
          </div>

          {/* Cột phải: CTA (ẩn trên mobile) */}
          <div className="relative hidden min-h-[520px] lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-rose-500 to-amber-400" />
            <div className="absolute inset-0 bg-[url('/image/hero-food.jpg')] bg-cover bg-center mix-blend-soft-light opacity-90" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center p-10 text-white">
              <h3 className="text-2xl font-extrabold drop-shadow-sm text-center">
                Khám phá quán ngon gần bạn
              </h3>
              <p className="mt-2 max-w-sm text-center text-sm text-white/90">
                Gợi ý chuẩn vị, có chỉ đường, nhiều ưu đãi. Bắt đầu hành trình
                FoodTour ngay!
              </p>

              <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-xl bg-white/15 p-3 shadow-sm backdrop-blur">
                  🧭 Chỉ đường
                </div>
                <div className="rounded-xl bg-white/15 p-3 shadow-sm backdrop-blur">
                  🎟️ Ưu đãi
                </div>
                <div className="rounded-xl bg-white/15 p-3 shadow-sm backdrop-blur">
                  ❤️ Yêu thích
                </div>
              </div>

              <button
                onClick={() => setRight((v) => !v)}
                className="mt-6 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-rose-700 shadow-sm backdrop-blur hover:bg-white"
              >
                {right
                  ? "Đã có tài khoản? Đăng nhập"
                  : "Mới dùng? Tạo tài khoản"}
              </button>
            </div>
          </div>

          {/* Mobile: nút chuyển form nằm dưới cột trái */}
          <div className="block border-t border-gray-100 px-6 py-4 lg:hidden">
            <div className="flex items-center justify-center">
              <button
                onClick={() => setRight((v) => !v)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:border-rose-300 hover:text-rose-700"
              >
                {right
                  ? "Đã có tài khoản? Đăng nhập"
                  : "Mới dùng? Tạo tài khoản mới"}
              </button>
            </div>
          </div>
        </div>

        {/* note nhỏ */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Bằng việc tiếp tục, bạn đồng ý với{" "}
          <a href="/policy" className="text-rose-700 hover:underline">
            Điều khoản & Chính sách
          </a>{" "}
          của FoodTour.
        </p>
      </div>
    </div>
  );
}
