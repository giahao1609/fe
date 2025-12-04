"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

import FoodSection from "@/components/food/FoodSection";
import FoodNearbyList from "@/components/food/FoodNearbyList";
import { foods } from "@/data/foods";
import BannerSlider from "@/components/common/BannerSlider";
import { slides } from "@/data/slides";
import { resolveCDN as cdn } from "@/utils/cdn";
import { useAuth } from "@/context/AuthContext";

type BlogItem = {
  _id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentHtml?: string;
  tags?: string[];
  categories?: string[];
  heroImageUrl?: string;
  heroImageUrlSigned?: string;
  gallery?: string[];
  gallerySigned?: { path: string; url: string }[];
  readingMinutes?: number;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  searchTerms?: string[];
  viewCount?: number;
  likeCount?: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
};

const API_BASE =
  process.env.API_BASE_URL || "https://api.food-map.online/api/v1";

const BLOG_LIMIT = 6;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const calcReadingTimeFromHtml = (html?: string) => {
  if (!html) return 1;
  const text = html.replace(/<[^>]+>/g, " "); 
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export default function Home() {
  const { token } = useAuth();

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogPage, setBlogPage] = useState(1);
  const [blogTotalPages, setBlogTotalPages] = useState(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);

        const res = await axios.get<{
          items: BlogItem[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        }>(
          `${API_BASE}/blogs/full?page=${blogPage}&limit=${BLOG_LIMIT}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        setBlogs(res.data.items || []);
        setBlogTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Fetch /blogs/full error:", err);
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchBlogs();
  }, [token, blogPage]);

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50 to-white" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
                Khám phá <span className="text-rose-600">quán ngon</span> quanh bạn
              </h1>
              <p className="mt-4 text-gray-600 text-base lg:text-lg">
                Gợi ý chuẩn vị, có chỉ đường, giảm giá mỗi ngày. Bắt đầu hành trình
                FoodTour ngay!
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Bún/Phở", "Lẩu/Nướng", "Cà phê", "Ăn vặt", "Món Nhật", "Món Hàn"].map(
                  (x) => (
                    <Link
                      key={x}
                      href={`/search?q=${encodeURIComponent(x)}`}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:border-rose-300 hover:text-rose-700"
                    >
                      {x}
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow">
                <Image
                  src="https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg"
                  alt="Hero Food"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER SLIDER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <BannerSlider
          slides={slides.map((s) => ({
            ...s,
            image: cdn(s.image),
          }))}
        />
      </section>

      {/* NEARBY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Quanh đây</h2>
            <p className="text-sm text-gray-500">Dựa trên vị trí hiện tại của bạn</p>
          </div>
          <Link href="/categories/nearby" className="text-sm text-rose-700 hover:underline">
            Xem tất cả
          </Link>
        </div>

        <FoodNearbyList
          foods={foods.slice(0, 12).map((f) => ({
            ...f,
            img: cdn(f.img),
          }))}
        />
      </section>

      {/* FEATURED + FILTER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Quán ăn nổi bật</h2>
            <p className="text-sm text-gray-500">Bộ sưu tập hot & deal mới</p>
          </div>
          <Link
            href="/categories/restaurants"
            className="text-sm text-rose-700 hover:underline"
          >
            Xem thêm
          </Link>
        </div>
        <FoodSection />
      </section>

      {/* DEALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Ưu đãi đang diễn ra
            </h2>
            <p className="text-sm text-gray-500">
              Săn giảm giá, voucher, combo siêu hời
            </p>
          </div>
          <Link
            href="/categories/deals"
            className="text-sm text-rose-700 hover:underline"
          >
            Xem tất cả ưu đãi
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {foods
            .filter((f) => f.discount && f.discount !== "0%")
            .slice(0, 8)
            .map((f) => (
              <div
                key={`${f.name}-${f.address}-${f.img}`}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={cdn(f.img)}
                    alt={f.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-gray-900">
                      {f.name}
                    </div>
                    <div className="truncate text-sm text-gray-500">
                      {f.address}
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                    -{f.discount}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* BLOG COLLECTION - GỌI API /blogs/full + PHÂN TRANG */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Bộ sưu tập & Blog
            </h2>
            <p className="text-sm text-gray-500">
              Review, mẹo ăn ngon, lịch FoodTour
            </p>
          </div>

          {blogTotalPages > 1 && (
            <div className="hidden items-center gap-2 text-xs text-gray-500 sm:flex">
              <span>
                Trang <span className="font-semibold">{blogPage}</span> /{" "}
                <span>{blogTotalPages}</span>
              </span>
            </div>
          )}
        </div>

        {blogsLoading && (
          <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"
              />
            ))}
          </div>
        )}

        {!blogsLoading && blogs.length === 0 && (
          <p className="text-sm text-gray-500">
            Chưa có bài viết nào. Quay lại sau nhé!
          </p>
        )}

        {!blogsLoading && blogs.length > 0 && (
          <>
            <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
              {blogs.map((p) => {
                const rtime =
                  p.readingMinutes ?? calcReadingTimeFromHtml(p.contentHtml);

                const cover =
                  p.heroImageUrlSigned ??
                  (p.heroImageUrl
                    ? cdn(p.heroImageUrl)
                    : "/image/default-blog.jpg");

                const excerpt =
                  p.excerpt ||
                  p.metaDescription ||
                  "Khám phá thêm trong bài viết…";

                return (
                  <Link
                    key={p._id}
                    href={`/categories/blog/${p.slug}`}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                  >
                    <div className="relative aspect-video w-full bg-gray-100">
                      <Image
                        src={cover}
                        alt={p.title}
                        fill
                        className="object-cover transition-opacity group-hover:opacity-95"
                        sizes="(max-width: 1024px) 100vw, 380px"
                      />
                    </div>
                    <div className="p-4">
                      <div className="line-clamp-2 font-semibold text-gray-900 group-hover:text-rose-700">
                        {p.title}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {excerpt}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{rtime} phút đọc</span>
                        <span>{formatDate(p.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {blogTotalPages > 1 && (
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <div className="text-xs text-gray-500">
                  Trang <span className="font-semibold">{blogPage}</span> /{" "}
                  <span>{blogTotalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={blogPage <= 1 || blogsLoading}
                    onClick={() => setBlogPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:border-rose-300 hover:text-rose-700"
                  >
                    ← Trang trước
                  </button>
                  <button
                    type="button"
                    disabled={blogPage >= blogTotalPages || blogsLoading}
                    onClick={() =>
                      setBlogPage((p) =>
                        blogTotalPages ? Math.min(blogTotalPages, p + 1) : p + 1
                      )
                    }
                    className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:border-rose-300 hover:text-rose-700"
                  >
                    Trang sau →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
