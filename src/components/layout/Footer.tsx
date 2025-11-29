import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-16 text-gray-100">
      <div className="h-[3px] w-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />

      <div className="relative overflow-hidden bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_50%_-10%,rgba(244,63,94,0.15)_0%,transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-600 text-white shadow">
                <span className="text-xl">🍜</span>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight">
                  Food<span className="text-rose-500">Tour</span>
                </div>
                <div className="text-xs text-gray-400">
                  Tìm quán ngon gần bạn
                </div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
              Khám phá món ăn quanh bạn, lưu lại hành trình ẩm thực và nhận ưu
              đãi từ những quán yêu thích.
            </p>

            <div className="mt-5 flex gap-3">
              {[
                {
                  title: "Facebook",
                  path: "M18 2h-3a4 4 0 00-4 4v3H8v4h3v9h4v-9h3l1-4h-4V6a1 1 0 011-1h3z",
                },
                {
                  title: "Instagram",
                  path: "M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6.5-1.5a1.5 1.5 0 11-3.001.001A1.5 1.5 0 0118.5 5.5z",
                },
                {
                  title: "X",
                  path: "M3 3l7.5 9L3 21h4l5-6.2L17.9 21H21l-7.5-9L21 3h-4l-4.9 6L7.1 3H3z",
                },
              ].map((s, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={s.title}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 text-sm lg:col-span-8 lg:grid-cols-4">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Khám phá
              </div>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    className="hover:text-rose-400"
                    href="/categories/nearby"
                  >
                    Gần bạn
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-rose-400"
                    href="/categories/restaurants"
                  >
                    Quán ăn
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-rose-400"
                    href="/categories/collections"
                  >
                    Bộ sưu tập
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-rose-400"
                    href="/categories/deals"
                  >
                    Ưu đãi hot
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Hỗ trợ
              </div>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link className="hover:text-rose-400" href="/help">
                    Trung tâm trợ giúp
                  </Link>
                </li>
               
             
              </ul>
            </div>

            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Pháp lý
              </div>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link className="hover:text-rose-400" href="/terms">
                    Điều khoản
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-rose-400" href="/privacy">
                    Chính sách riêng tư
                  </Link>
                </li>
               
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-gray-400 sm:flex-row sm:px-6 lg:px-8">
            <p>© {year} All rights reserved.</p>
            
          </div>
        </div>
      </div>

      <div
        className="h-[env(safe-area-inset-bottom)] bg-zinc-950"
        aria-hidden
      />
    </footer>
  );
}
