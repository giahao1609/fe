"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/categories/nearby", label: "Gần bạn" },
  { href: "/categories/restaurants", label: "Quán ăn" },
  { href: "/categories/blog", label: "Blog" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const [navH, setNavH] = useState(76);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const avatarSrc =
    (user as any)?.avatarUrl ||
    (user as any)?.picture ||
    "/image/default-avatar.jpg";

  const displayName =
    (user as any)?.displayName ||
    (user as any)?.username ||
    (user as any)?.name ||
    (user as any)?.email?.split("@")[0] ||
    "";

  const roles: string[] = ((user as any)?.roles || []) as string[];

  const handleAccountClick = () => {
    router.push(user ? "/account" : "/auth");
    setOpen(false);
    setAccountMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    if (roles.includes("admin")) {
      router.push("/dashboard/admin");
    } else if (roles.includes("owner") || roles.includes("customer")) {
      router.push("/dashboard/owner");
    } else {
      router.push("/account");
    }
    setAccountMenuOpen(false);
  };

  const handleCreateRestaurantClick = () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    router.push("/owner/restaurants/new");
    setAccountMenuOpen(false);
    setOpen(false);
  };

  // đo chiều cao header để spacer cho mobile
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeight = () => setNavH(el.offsetHeight || 64);
    updateHeight();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateHeight)
        : null;

    if (ro && el) ro.observe(el);
    window.addEventListener("resize", updateHeight);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // shadow khi scroll
  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // click outside để đóng dropdown account
  useEffect(() => {
    if (!accountMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`group relative inline-flex items-center gap-1 px-1 py-1 text-[15px] font-medium transition-colors ${active ? "text-rose-700" : "text-gray-700 hover:text-rose-700"
          }`}
      >
        <span>{label}</span>
        <span
          className={`pointer-events-none absolute -bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-rose-600 transition-all duration-300 ${active ? "w-6" : "group-hover:w-6"
            }`}
        />
      </Link>
    );
  };

  return (
    <>
      <header
        ref={headerRef}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          // @ts-ignore
          "--nav-h": `${navH}px`,
        }}
        className={`fixed top-0 left-0 z-50 w-full bg-white/80 backdrop-blur-md transition-shadow ${elevated ? "shadow-md" : "shadow-sm"
          } lg:sticky`}
        role="banner"
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand */}
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

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search pill (desktop) */}
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

            {user ? (
              <div className="relative flex items-center gap-2" ref={accountRef}>
                {/* Greeting text */}
                <button
                  onClick={handleAccountClick}
                  className="hidden max-w-[160px] truncate text-sm font-medium text-gray-700 transition hover:text-rose-700 md:inline"
                  title={displayName || (user as any)?.email}
                >
                  Xin chào,{" "}
                  {displayName ||
                    (user as any)?.email?.split("@")[0] ||
                    "bạn"}
                </button>

                {/* Avatar + dropdown trigger */}
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-300 bg-white shadow-sm transition hover:scale-105"
                  title="Tài khoản"
                >
                  <Image
                    src={avatarSrc}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>

                {/* Dropdown menu (desktop) */}
                {accountMenuOpen && (
                  <div className="absolute right-0 top-[120%] w-56 rounded-xl border border-gray-200 bg-white/95 py-2 text-sm shadow-lg backdrop-blur-sm">
                    <div className="px-3 pb-2 pt-1">
                      <p className="truncate text-xs font-semibold text-gray-900">
                        {displayName ||
                          (user as any)?.email?.split("@")[0] ||
                          "Tài khoản"}
                      </p>
                      <p className="truncate text-[11px] text-gray-500">
                        {(user as any)?.email}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-gray-100" />
                    <button
                      onClick={handleAccountClick}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-800 hover:bg-gray-50"
                    >
                      <span className="text-[16px]">👤</span>
                      <span>Thông tin tài khoản</span>
                    </button>
                    <button
                      onClick={handleCreateRestaurantClick}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-rose-700 hover:bg-rose-50"
                    >
                      <span className="text-[16px]">➕</span>
                      <span>Đăng quán</span>
                    </button>
                    {
                      (roles.includes("owner") ||  roles.includes("admin")) && <button
                        onClick={handleDashboardClick}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-800 hover:bg-gray-50"
                      >
                        <span className="text-[16px]">📊</span>
                        <span>Dashboard</span>
                      </button>
                    }

                    <div className="my-1 h-px bg-gray-100" />
                    <button
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50"
                    >
                      <span className="text-[16px]">🚪</span>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleAccountClick}
                className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                Đăng nhập
              </button>
            )}

            {/* Mobile menu button */}
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

        {/* Mobile drawer */}
        <div
          className={`lg:hidden fixed left-0 right-0 z-40 transition-[max-height,opacity] duration-250 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
          style={{
            top: `calc(var(--nav-h) + env(safe-area-inset-top))`,
          }}
        >
          <div
            className={`mx-4 mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm ${open ? "max-h-[70vh]" : "max-h-0"
              }`}
          >
            <div className="grid gap-2">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-gray-800 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {user ? (
              <>
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
                        {displayName ||
                          (user as any)?.email?.split("@")[0] ||
                          "Tài khoản"}
                      </div>
                      <div className="text-xs text-gray-600">
                        Tài khoản của tôi
                      </div>
                    </div>
                  </button>
                </div>

                {/* Quản lý quán trong "dropdown" mobile */}
                <div className="mt-3 grid gap-2 px-1">
                  <button
                    onClick={handleCreateRestaurantClick}
                    className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <span className="text-[16px]">➕</span>
                    <span>Đăng quán mới</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDashboardClick();
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    <span className="text-[16px]">📊</span>
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span className="text-[16px]">🚪</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
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

      <div
        aria-hidden
        className="lg:hidden"
        style={{ height: `calc(${navH}px + env(safe-area-inset-top))` }}
      />
    </>
  );
}
