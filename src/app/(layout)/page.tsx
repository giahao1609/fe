"use client";

import Link from "next/link";
import Image from "next/image";
import FoodSection from "@/components/food/FoodSection";
import FoodNearbyList from "@/components/food/FoodNearbyList";
import { foods } from "@/data/foods";
import BannerSlider from "@/components/common/BannerSlider";
import { slides } from "@/data/slides";
import { resolveCDN as cdn } from "@/utils/cdn";
import { posts } from "@/data/posts";

export default function Home() {
  const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const calcReadingTime = (content: string[]) => {
  const words = content.join(" ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)); // 200 wpm
};
  return (
    <div className="relative">
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
                {["Bún/Phở", "Lẩu/Nướng", "Cà phê", "Ăn vặt", "Món Nhật", "Món Hàn"].map((x) => (
                  <Link
                    key={x}
                    href={`/search?q=${encodeURIComponent(x)}`}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:border-rose-300 hover:text-rose-700"
                  >
                    {x}
                  </Link>
                ))}
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
        {/* Nếu BannerSlider nhận prop `slides`, đảm bảo mỗi slide.image đã là tuyệt đối/CDN.
            Nếu vẫn còn đường dẫn nội bộ, có thể map trước: */}
        <BannerSlider slides={slides.map(s => ({ ...s, image: cdn(s.image) }))} />
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
        {/* Nếu FoodNearbyList render <img> hoặc background-image, chuyển sang <Image> bên trong component đó.
           Tạm thời, đảm bảo dữ liệu đã là CDN */}
        <FoodNearbyList foods={foods.slice(0, 12).map(f => ({ ...f, img: cdn(f.img) }))} />
      </section>

      {/* FEATURED + FILTER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Quán ăn nổi bật</h2>
            <p className="text-sm text-gray-500">Bộ sưu tập hot & deal mới</p>
          </div>
          <Link href="/categories/restaurants" className="text-sm text-rose-700 hover:underline">
            Xem thêm
          </Link>
        </div>
        <FoodSection />
      </section>

      {/* DEALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Ưu đãi đang diễn ra</h2>
            <p className="text-sm text-gray-500">Săn giảm giá, voucher, combo siêu hời</p>
          </div>
          <Link href="/categories/deals" className="text-sm text-rose-700 hover:underline">
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
                    <div className="truncate font-semibold text-gray-900">{f.name}</div>
                    <div className="truncate text-sm text-gray-500">{f.address}</div>
                  </div>
                  <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                    -{f.discount}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
  <div className="mb-6">
    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Bộ sưu tập & Blog</h2>
    <p className="text-sm text-gray-500">Review, mẹo ăn ngon, lịch FoodTour</p>
  </div>

  <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
    {posts.slice(0, 3).map((p) => {
      const rtime = p.readingTime ?? calcReadingTime(p.content);
      return (
        <Link
          key={p.slug}
          href={`/categories/blog/${p.slug}`}
          className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="relative aspect-video w-full bg-gray-100">
            <Image
              src={p.cover}
              alt={p.title}
              fill
              className="object-cover transition-opacity group-hover:opacity-95"
              sizes="(max-width: 1024px) 100vw, 380px"
              priority={false}
            />
          </div>
          <div className="p-4">
            <div className="line-clamp-2 font-semibold text-gray-900 group-hover:text-rose-700">
              {p.title}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.excerpt}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>{rtime} phút đọc</span>
              <span>{formatDate(p.publishedAt)}</span>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
</section>
    </div>
  );
}
