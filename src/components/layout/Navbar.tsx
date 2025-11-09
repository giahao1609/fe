"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const [navH, setNavH] = useState(56); // mobile fallback
  const headerRef = useRef<HTMLElement | null>(null);

  const avatarSrc =
    user?.picture || user?.avatarUrl || "/image/default-avatar.jpg";

  const handleAccountClick = () => {
    router.push(user ? "/account" : "/auth");
  };

  // Measure header height for mobile spacer / overlay drawer
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setH = () => setNavH(el.offsetHeight);
    setH();

    // ResizeObserver for dynamic changes (drawer open, safe-area, etc.)
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => setH());
      ro.observe(el);
    } else {
      window.addEventListener("resize", setH);
    }
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", setH);
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const active = pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`relative inline-flex items-center gap-1 px-1 py-1 text-[15px] font-medium transition-colors ${
          active ? "text-rose-700" : "text-gray-700 hover:text-rose-700"
        }`}
      >
        <span>{children}</span>
        <span
          className={`pointer-events-none absolute -bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-rose-600 transition-all duration-300 ${
            active ? "w-6" : "group-hover:w-6"
          }`}
        />
      </Link>
    );
  };

  return (
    <>
      {/* Fixed on mobile to avoid layout jump; sticky on desktop */}
      <header
        ref={headerRef}
        style={{
          // account for iOS/Android safe areas
          paddingTop: "env(safe-area-inset-top)",
          // expose height var for the drawer
          // @ts-ignore
          "--nav-h": `${navH}px`,
        }}
        className={`z-50 w-full supports-[backdrop-filter]:bg-white/70 backdrop-blur ${
          elevated ? "shadow-md" : "shadow-sm"
        } fixed top-0 left-0 lg:sticky lg:top-0`}
        role="banner"
      >
        {/* Subtle gradient accent */}
        <div className="h-[3px] w-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-rose-600 text-white shadow-md transition group-hover:scale-105">
                <span className="text-xl">🍜</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Food<span className="text-rose-600">Tour</span>
              </span>
            </Link>
          </div>

          {/* Center: nav (desktop) */}
          <nav className="hidden items-center gap-6 lg:flex">
            <NavLink href="/categories/nearby">Gần bạn</NavLink>
            {/* <NavLink href="/categories/directions">Chỉ đường</NavLink> */}
            <NavLink href="/categories/collections">Bộ sưu tập</NavLink>
            <NavLink href="/categories/restaurants">Quán ăn</NavLink>
            <NavLink href="/categories/deals">Ưu đãi hot</NavLink>
            <NavLink href="/categories/blog">Blog</NavLink>
          </nav>

          {/* Right: search + user */}
          <div className="flex items-center gap-3">
            {/* quick search pill */}
            <button
              onClick={() => router.push("/search")}
              className="hidden items-center gap-2 rounded-full border border-gray-300/80 bg-white/70 px-3 py-1.5 text-sm text-gray-600 shadow-sm transition hover:bg-white hover:text-gray-800 sm:flex"
              title="Tìm món, quán gần bạn"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
              <span className="hidden md:inline">Tìm món, quán gần bạn…</span>
              <kbd className="ml-1 hidden rounded border border-gray-300 bg-gray-100 px-1.5 text-[10px] text-gray-600 md:inline">
                /
              </kbd>
            </button>

            {/* location chip */}
            <button
              onClick={() => router.push("/categories/nearby")}
              className="hidden items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 transition hover:bg-emerald-100 sm:flex"
              title="Quán gần tôi"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11z" />
                <circle cx="12" cy="11" r="3" />
              </svg>
              Gần tôi
            </button>

            {/* user */}
            {user ? (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAccountClick}
                    className="hidden text-sm font-medium text-gray-700 transition hover:text-rose-700 md:inline"
                  >
                    Xin chào,{" "}
                    {user.username || user.name || user.email?.split("@")[0]}
                  </button>

                  <button
                    onClick={handleAccountClick}
                    className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-300 bg-white shadow-sm transition hover:scale-105"
                    title="Trang cá nhân"
                  >
                    <Image
                      src={avatarSrc}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>

                  <button
                    onClick={logout}
                    className="hidden text-sm text-gray-500 transition hover:text-rose-600 md:inline"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAccountClick}
                className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                Đăng nhập
              </button>
            )}

            {/* mobile menu toggle */}
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Mở menu"
              aria-expanded={open}
            >
              {open ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer (overlay, does NOT push layout) */}
        <div
          className={`lg:hidden pointer-events-none fixed left-0 right-0 z-40 transition-[max-height,opacity] duration-300 ${
            open ? "pointer-events-auto opacity-100" : "opacity-0"
          }`}
          style={{ top: `calc(var(--nav-h) + env(safe-area-inset-top))` }}
        >
          <div
            className={`mx-4 mb-4 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm ${
              open ? "max-h-[70vh]" : "max-h-0"
            } overflow-hidden`}
          >
            <div className="grid gap-2">
              <Link
                href="/categories/nearby"
                className="rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50"
              >
                Gần bạn
              </Link>
              {/* <Link
                href="/categories/directions"
                className="rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50"
              >
                Chỉ đường
              </Link> */}
              <Link
                href="/categories/collections"
                className="rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50"
              >
                Bộ sưu tập
              </Link>
              <Link
                href="/categories/restaurants"
                className="rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50"
              >
                Quán ăn
              </Link>
              <Link
                href="/categories/deals"
                className="rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50"
              >
                Ưu đãi hot
              </Link>
              <Link
                href="/categories/blog"
                className="rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50"
              >
                Blog
              </Link>
            </div>

            <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* account area */}
            {user ? (
              <div className="flex items-center justify-between gap-3 px-1">
                <button
                  onClick={handleAccountClick}
                  className="flex items-center gap-3"
                >
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-300">
                    <Image
                      src={avatarSrc}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {user.username || user.name || user.email?.split("@")[0]}
                    </div>
                    <div className="text-xs text-gray-600">
                      Tài khoản của tôi
                    </div>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={handleAccountClick}
                className="mt-2 w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under fixed mobile header */}
      <div
        aria-hidden
        className="lg:hidden"
        style={{ height: `calc(${navH}px + env(safe-area-inset-top))` }}
      />
    </>
  );
}
