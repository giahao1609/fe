"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/categories/nearby", label: "Gần bạn" },
  { href: "/categories/restaurants", label: "Quán ăn" },
  { href: "/categories/deals", label: "Món ăn" },
  { href: "/categories/blog", label: "Blog" },
];

// dùng chung với chỗ khác nếu muốn
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.food-map.online";

// gợi ý từ khóa
const HOT_KEYWORDS = [
  "Phở",
  "Bún bò",
  "Cơm tấm",
  "Trà sữa",
  "Pizza",
  "Bánh mì",
];

type SearchMenuItem = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;

  // ảnh
  images?: string[];
  imagesSigned?: { url: string; path: string }[];

  basePrice?: {
    currency: string;
    amount: number;
  };

  // tùy backend có hay không
  restaurantId?: string;
  restaurantName?: string;
  restaurantSlug?: string;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const [navH, setNavH] = useState(76);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // SEARCH overlay state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchMenuItem[]>([]);

  const headerRef = useRef<HTMLElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleMyOrdersClick = () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    router.push("/me/pre-orders");
    setAccountMenuOpen(false);
    setOpen(false);
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

  const handleMyBlogClick = () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    router.push("/me/blogs");
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

  // khóa scroll khi mở search overlay
  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  // ESC để đóng search
  useEffect(() => {
    if (!searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  // debounce gọi API search
  useEffect(() => {
    if (!searchOpen) return;

    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError(null);

        const url = `${API_BASE}/api/v1/menu-items/search?q=${encodeURIComponent(
          q,
        )}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }

        const json = await res.json();

        // cố gắng bắt nhiều format trả về khác nhau
        let items: any[] = [];
        if (Array.isArray(json.items)) items = json.items;
        else if (Array.isArray(json.data?.items)) items = json.data.items;
        else if (Array.isArray(json.data)) items = json.data;
        else if (Array.isArray(json)) items = json;

        setSearchResults(items as SearchMenuItem[]);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Search menu-items error:", err);
        setSearchError("Không tìm được kết quả, vui lòng thử lại.");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchQuery, searchOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`group relative inline-flex items-center gap-1 px-1 py-1 text-[15px] font-medium transition-colors ${
          active ? "text-rose-700" : "text-gray-700 hover:text-rose-700"
        }`}
      >
        <span>{label}</span>
        <span
          className={`pointer-events-none absolute -bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-rose-600 transition-all duration-300 ${
            active ? "w-6" : "group-hover:w-6"
          }`}
        />
      </Link>
    );
  };

  const openSearchOverlay = () => {
    setSearchOpen(true);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setSearchLoading(false);
  };

  const getItemImageSrc = (item: SearchMenuItem): string => {
    const signed = item.imagesSigned?.[0]?.url;
    if (signed) return signed;

    const rawPath = item.images?.[0];
    if (rawPath) {
      return `https://storage.googleapis.com/khoaluaniuh/${rawPath}`;
    }
    return "/image/placeholder-food.jpg"; // thêm ảnh placeholder nếu có
  };

  const handleResultClick = (item: SearchMenuItem) => {
    // tuỳ backend: ưu tiên đi tới trang quán
    if (item.restaurantSlug) {
      router.push(`/categories/restaurants/${item.restaurantSlug}`);
    } else if (item.restaurantId) {
      router.push(`/categories/restaurants/${item.restaurantId}`);
    } else if (item.slug) {
      router.push(`/menu-items/${item.slug}`);
    }
    closeSearch();
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
        className={`fixed top-0 left-0 z-50 w-full bg-white/80 backdrop-blur-md transition-shadow ${
          elevated ? "shadow-md" : "shadow-sm"
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
            <button
              onClick={openSearchOverlay}
              className="hidden items-center gap-2 rounded-full border border-gray-300/80 bg-white/70 px-3 py-3 text-sm text-gray-600 shadow-sm transition hover:bg-gray-100 hover:text-gray-800 sm:flex"
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
            </button>

            {user ? (
              <div
                className="relative flex items-center gap-2"
                ref={accountRef}
              >
                {/* Greeting text */}
                <button
                  onClick={handleAccountClick}
                  className="hidden max-w-[160px] truncate text-sm font-medium text-gray-700 transition hover:text-rose-700 md:inline"
                  title={displayName || (user as any)?.email}
                >
                  Xin chào,{" "}
                  {displayName || (user as any)?.email?.split("@")[0] || "bạn"}
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
                      onClick={handleMyOrdersClick}
                      className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                    >
                      <span className="text-[16px]">🧾</span>
                      <span>Đơn hàng</span>
                    </button>

                    <button
                      onClick={handleMyBlogClick}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-800 hover:bg-gray-50"
                    >
                      <span className="text-[16px]">✍️</span>
                      <span>Blog của tôi</span>
                    </button>

                    {(roles.includes("owner") || roles.includes("admin")) && (
                      <button
                        onClick={handleDashboardClick}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-800 hover:bg-gray-50"
                      >
                        <span className="text-[16px]">📊</span>
                        <span>Dashboard</span>
                      </button>
                    )}

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
          className={`lg:hidden fixed left-0 right-0 z-40 transition-[max-height,opacity] duration-250 ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          style={{
            top: `calc(var(--nav-h) + env(safe-area-inset-top))`,
          }}
        >
          <div
            className={`mx-4 mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm ${
              open ? "max-h-[70vh]" : "max-h-0"
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

                {/* Quản lý trong mobile */}
                <div className="mt-3 grid gap-2 px-1">
                  <button
                    onClick={() => {
                      handleMyOrdersClick();
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    <span className="text-[16px]">🧾</span>
                    <span>Đơn hàng</span>
                  </button>

                  <button
                    onClick={handleMyBlogClick}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    <span className="text-[16px]">✍️</span>
                    <span>Blog của tôi</span>
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

      {/* Search overlay fixed kiểu Coolmate */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[10vh]"
          onClick={closeSearch}
        >
           <div
              className="flex max-h-[80vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b px-6 py-4">
              <div className="flex flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" />
                </svg>
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm món, quán gần bạn…"
                  className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={closeSearch}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

             <div className="flex-1 overflow-y-auto px-6 py-4">
              {!searchQuery.trim() && (
                <>
                  <div className="mb-3 text-sm font-semibold text-gray-800">
                    Từ khóa nổi bật hôm nay
                  </div>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {HOT_KEYWORDS.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setSearchQuery(kw)}
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:border-rose-500 hover:bg-rose-50 hover:text-rose-700"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>

                  
                </>
              )}

              {searchQuery.trim() && searchLoading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col overflow-hidden rounded-2xl bg-gray-50"
                    >
                      <div className="h-32 animate-pulse bg-gray-100" />
                      <div className="space-y-2 p-3">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* lỗi */}
              {searchQuery.trim() && searchError && !searchLoading && (
                <p className="text-xs text-red-600">{searchError}</p>
              )}

              {/* kết quả */}
              {searchQuery.trim() &&
                !searchLoading &&
                !searchError &&
                (searchResults.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => handleResultClick(item)}
                        className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="relative h-32 w-full bg-gray-50">
                          <Image
                            src={getItemImageSrc(item)}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1 p-3">
                          <div className="line-clamp-2 text-sm font-semibold text-gray-900">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="line-clamp-2 text-xs text-gray-500">
                              {item.description}
                            </div>
                          )}
                          <div className="mt-1 flex items-baseline justify-between gap-2">
                            {item.basePrice && (
                              <div className="text-sm font-semibold text-emerald-700">
                                {item.basePrice.amount.toLocaleString("vi-VN")}{" "}
                                {item.basePrice.currency}
                              </div>
                            )}
                            {item.restaurantName && (
                              <div className="truncate text-[11px] text-gray-500">
                                {item.restaurantName}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  !searchLoading && (
                    <p className="text-xs text-gray-500">
                      Không tìm thấy món phù hợp. Thử từ khóa khác nhé.
                    </p>
                  )
                ))}
            </div>
          </div>
        </div>
      )}

      {/* spacer cho mobile */}
      <div
        aria-hidden
        className="lg:hidden"
        style={{ height: `calc(${navH}px + env(safe-area-inset-top))` }}
      />
    </>
  );
}
