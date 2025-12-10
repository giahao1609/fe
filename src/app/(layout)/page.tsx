// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import axios from "axios";

// import FoodSection from "@/components/food/FoodSection";
// import FoodNearbyList from "@/components/food/FoodNearbyList";
// import { foods } from "@/data/foods";
// import BannerSlider from "@/components/common/BannerSlider";
// import { slides } from "@/data/slides";
// import { resolveCDN as cdn } from "@/utils/cdn";
// import { useAuth } from "@/context/AuthContext";

// type BlogItem = {
//   _id: string;
//   authorId: string;
//   title: string;
//   slug: string;
//   excerpt?: string;
//   contentHtml?: string;
//   tags?: string[];
//   categories?: string[];
//   heroImageUrl?: string;
//   heroImageUrlSigned?: string;
//   gallery?: string[];
//   gallerySigned?: { path: string; url: string }[];
//   readingMinutes?: number;
//   status: string;
//   metaTitle?: string;
//   metaDescription?: string;
//   keywords?: string[];
//   searchTerms?: string[];
//   viewCount?: number;
//   likeCount?: number;
//   isFeatured?: boolean;
//   createdAt: string;
//   updatedAt: string;
// };

// const API_BASE =
//   process.env.API_BASE_URL || "https://api.food-map.online/api/v1";

// const BLOG_LIMIT = 6;

// const formatDate = (iso: string) =>
//   new Date(iso).toLocaleDateString("vi-VN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });

// const calcReadingTimeFromHtml = (html?: string) => {
//   if (!html) return 1;
//   const text = html.replace(/<[^>]+>/g, " ");
//   const words = text.trim().split(/\s+/).filter(Boolean).length;
//   return Math.max(1, Math.round(words / 200));
// };

// export default function Home() {
//   const { token } = useAuth();

//   const [blogs, setBlogs] = useState<BlogItem[]>([]);
//   const [blogsLoading, setBlogsLoading] = useState(false);
//   const [blogPage, setBlogPage] = useState(1);
//   const [blogTotalPages, setBlogTotalPages] = useState(1);

//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         setBlogsLoading(true);

//         const res = await axios.get<{
//           items: BlogItem[];
//           total: number;
//           page: number;
//           limit: number;
//           totalPages: number;
//         }>(
//           `${API_BASE}/blogs/full?page=${blogPage}&limit=${BLOG_LIMIT}`,
//           {
//             headers: token
//               ? {
//                   Authorization: `Bearer ${token}`,
//                 }
//               : {},
//           }
//         );

//         setBlogs(res.data.items || []);
//         setBlogTotalPages(res.data.totalPages || 1);
//       } catch (err) {
//         console.error("Fetch /blogs/full error:", err);
//       } finally {
//         setBlogsLoading(false);
//       }
//     };

//     fetchBlogs();
//   }, [token, blogPage]);

//   return (
//     <div className="relative">
//       {/* HERO */}
//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-b from-rose-50 to-white" />
//         <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
//           <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
//             <div className="lg:col-span-7">
//               <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
//                 Khám phá <span className="text-rose-600">quán ngon</span> quanh bạn
//               </h1>
//               <p className="mt-4 text-gray-600 text-base lg:text-lg">
//                 Gợi ý chuẩn vị, có chỉ đường, giảm giá mỗi ngày. Bắt đầu hành trình
//                 FoodTour ngay!
//               </p>

//               <div className="mt-6 flex flex-wrap gap-2">
//                 {["Bún/Phở", "Lẩu/Nướng", "Cà phê", "Ăn vặt", "Món Nhật", "Món Hàn"].map(
//                   (x) => (
//                     <Link
//                       key={x}
//                       href={`/search?q=${encodeURIComponent(x)}`}
//                       className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:border-rose-300 hover:text-rose-700"
//                     >
//                       {x}
//                     </Link>
//                   )
//                 )}
//               </div>
//             </div>

//             <div className="lg:col-span-5">
//               <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow">
//                 <Image
//                   src="https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg"
//                   alt="Hero Food"
//                   fill
//                   priority
//                   className="object-cover"
//                   sizes="(max-width: 1024px) 100vw, 520px"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* BANNER SLIDER */}
//       <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
//         <BannerSlider
//           slides={slides.map((s) => ({
//             ...s,
//             image: cdn(s.image),
//           }))}
//         />
//       </section>

//       {/* NEARBY */}
//       <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
//         <div className="mb-4 flex items-end justify-between">
//           <div>
//             <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Quanh đây</h2>
//             <p className="text-sm text-gray-500">Dựa trên vị trí hiện tại của bạn</p>
//           </div>
//           <Link href="/categories/nearby" className="text-sm text-rose-700 hover:underline">
//             Xem tất cả
//           </Link>
//         </div>

//         <FoodNearbyList
//           foods={foods.slice(0, 12).map((f) => ({
//             ...f,
//             img: cdn(f.img),
//           }))}
//         />
//       </section>

//       {/* FEATURED + FILTER */}
//       <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-a10">
//         <div className="mb-4 flex items-end justify-between">
//           <div>
//             <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Quán ăn nổi bật</h2>
//             <p className="text-sm text-gray-500">Bộ sưu tập hot & deal mới</p>
//           </div>
//           <Link
//             href="/categories/restaurants"
//             className="text-sm text-rose-700 hover:underline"
//           >
//             Xem thêm
//           </Link>
//         </div>
//         <FoodSection />
//       </section>

//       {/* DEALS */}
//       <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
//         <div className="mb-4 flex items-end justify-between">
//           <div>
//             <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
//               Ưu đãi đang diễn ra
//             </h2>
//             <p className="text-sm text-gray-500">
//               Săn giảm giá, voucher, combo siêu hời
//             </p>
//           </div>
//           <Link
//             href="/categories/deals"
//             className="text-sm text-rose-700 hover:underline"
//           >
//             Xem tất cả ưu đãi
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
//           {foods
//             .filter((f) => f.discount && f.discount !== "0%")
//             .slice(0, 8)
//             .map((f) => (
//               <div
//                 key={`${f.name}-${f.address}-${f.img}`}
//                 className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
//               >
//                 <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
//                   <Image
//                     src={cdn(f.img)}
//                     alt={f.name}
//                     fill
//                     className="object-cover"
//                     sizes="(max-width: 1024px) 100vw, 320px"
//                   />
//                 </div>
//                 <div className="mt-3 flex items-center justify-between">
//                   <div className="min-w-0">
//                     <div className="truncate font-semibold text-gray-900">
//                       {f.name}
//                     </div>
//                     <div className="truncate text-sm text-gray-500">
//                       {f.address}
//                     </div>
//                   </div>
//                   <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
//                     -{f.discount}
//                   </span>
//                 </div>
//               </div>
//             ))}
//         </div>
//       </section>

//       {/* BLOG COLLECTION - GỌI API /blogs/full + PHÂN TRANG */}
//       <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
//               Bộ sưu tập & Blog
//             </h2>
//             <p className="text-sm text-gray-500">
//               Review, mẹo ăn ngon, lịch FoodTour
//             </p>
//           </div>

//           {blogTotalPages > 1 && (
//             <div className="hidden items-center gap-2 text-xs text-gray-500 sm:flex">
//               <span>
//                 Trang <span className="font-semibold">{blogPage}</span> /{" "}
//                 <span>{blogTotalPages}</span>
//               </span>
//             </div>
//           )}
//         </div>

//         {blogsLoading && (
//           <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
//             {Array.from({ length: 3 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"
//               />
//             ))}
//           </div>
//         )}

//         {!blogsLoading && blogs.length === 0 && (
//           <p className="text-sm text-gray-500">
//             Chưa có bài viết nào. Quay lại sau nhé!
//           </p>
//         )}

//         {!blogsLoading && blogs.length > 0 && (
//           <>
//             <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
//               {blogs.map((p) => {
//                 const rtime =
//                   p.readingMinutes ?? calcReadingTimeFromHtml(p.contentHtml);

//                 const cover =
//                   p.heroImageUrlSigned ??
//                   (p.heroImageUrl
//                     ? cdn(p.heroImageUrl)
//                     : "/image/default-blog.jpg");

//                 const excerpt =
//                   p.excerpt ||
//                   p.metaDescription ||
//                   "Khám phá thêm trong bài viết…";

//                 return (
//                   <Link
//                     key={p._id}
//                     href={`/categories/blog/${p.slug}`}
//                     className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
//                   >
//                     <div className="relative aspect-video w-full bg-gray-100">
//                       <Image
//                         src={cover}
//                         alt={p.title}
//                         fill
//                         className="object-cover transition-opacity group-hover:opacity-95"
//                         sizes="(max-width: 1024px) 100vw, 380px"
//                       />
//                     </div>
//                     <div className="p-4">
//                       <div className="line-clamp-2 font-semibold text-gray-900 group-hover:text-rose-700">
//                         {p.title}
//                       </div>
//                       <p className="mt-1 line-clamp-2 text-sm text-gray-600">
//                         {excerpt}
//                       </p>
//                       <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
//                         <span>{rtime} phút đọc</span>
//                         <span>{formatDate(p.createdAt)}</span>
//                       </div>
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>

//             {blogTotalPages > 1 && (
//               <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
//                 <div className="text-xs text-gray-500">
//                   Trang <span className="font-semibold">{blogPage}</span> /{" "}
//                   <span>{blogTotalPages}</span>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     type="button"
//                     disabled={blogPage <= 1 || blogsLoading}
//                     onClick={() => setBlogPage((p) => Math.max(1, p - 1))}
//                     className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:border-rose-300 hover:text-rose-700"
//                   >
//                     ← Trang trước
//                   </button>
//                   <button
//                     type="button"
//                     disabled={blogPage >= blogTotalPages || blogsLoading}
//                     onClick={() =>
//                       setBlogPage((p) =>
//                         blogTotalPages ? Math.min(blogTotalPages, p + 1) : p + 1
//                       )
//                     }
//                     className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:border-rose-300 hover:text-rose-700"
//                   >
//                     Trang sau →
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </section>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

import FoodNearbyList from "@/components/food/FoodNearbyList";
import BannerSlider from "@/components/common/BannerSlider";
import { slides } from "@/data/slides";
import { resolveCDN as cdn } from "@/utils/cdn";
import { useAuth } from "@/context/AuthContext";
import { useLocationStore } from "@/stores/locationStore";

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

type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ====== API TYPES ======
type RestaurantHome = {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  logoUrl?: string;
  logoUrlSigned?: string;
  coverImageUrl?: string;
  coverImageUrlSigned?: string;
  rating?: number;
  district?: string;
  city?: string;
  cuisine?: string[];
  priceRange?: string;
};

type NearbyRestaurant = RestaurantHome & {
  distanceKm?: number;
};

type TopDealItem = {
  _id: string;
  name: string;
  slug: string;
  images?: string[];
  imagesSigned?: { path: string; url: string }[];
  basePrice?: { currency?: string; amount: number };
  compareAtPrice?: { currency?: string; amount: number };
  discountPercent?: number;
  restaurantId: string;
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

// price helper
const formatPrice = (amount?: number, currency = "VND") => {
  if (amount == null) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Home() {
  const { token } = useAuth();
  const { lat, lng, mode, autoDetect } = useLocationStore();
  // ==== BLOG ====
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogPage, setBlogPage] = useState(1);
  const [blogTotalPages, setBlogTotalPages] = useState(1);

  // ==== NEARBY ====
  const [nearby, setNearby] = useState<NearbyRestaurant[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // ==== FEATURED RESTAURANTS ====
  const [featured, setFeatured] = useState<RestaurantHome[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredPage] = useState(1); // hiện tại chỉ lấy page 1 cho home
  const FEATURED_LIMIT = 8;

  const [priceRange, setPriceRange] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");

  // ==== TOP DEALS ====
  const [deals, setDeals] = useState<TopDealItem[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const DEALS_LIMIT = 8;

  // ========== FETCH BLOG ==========
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);

        const res = await axios.get<Paginated<BlogItem>>(
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

  // ========== FETCH NEARBY ==========
  useEffect(() => {
    let cancelled = false;

    // Nếu chưa có lat/lng thì không gọi API (có thể chờ user chọn vị trí)
    if (typeof lat !== "number" || typeof lng !== "number") {
      setNearby([]);
      setNearbyLoading(false);
      return;
    }

    const fetchNearby = async () => {
      try {
        setNearbyLoading(true);

        const res = await axios.get<Paginated<NearbyRestaurant>>(
          `${API_BASE}/owner/restaurants/nearby-far`,
          {
            params: {
              page: 1,
              limit: 12,
              lat,
              lng,
            },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!cancelled) {
          setNearby(res.data.items || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Fetch /owner/restaurants/nearby-far error:", err);
          setNearby([]);
        }
      } finally {
        if (!cancelled) {
          setNearbyLoading(false);
        }
      }
    };

    fetchNearby();

    return () => {
      cancelled = true;
    };
  }, [token, lat, lng]);

  // ========== FETCH FEATURED ==========
  const fetchFeatured = async () => {
    try {
      setFeaturedLoading(true);

      const res = await axios.get<{
        success: boolean;
        data: Paginated<RestaurantHome>;
      }>(`${API_BASE}/owner/restaurants/featured`, {
        params: {
          page: featuredPage,
          limit: FEATURED_LIMIT,
          priceRange: priceRange || undefined,
          district: districtFilter || undefined,
          q: keyword || undefined,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setFeatured(res.data.data.items || []);
    } catch (err) {
      console.error("Fetch /owner/restaurants/featured error:", err);
    } finally {
      setFeaturedLoading(false);
    }
  };

  useEffect(() => {
    // load lần đầu (page 1, không filter)
    fetchFeatured();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFeaturedFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFeatured();
  };

  // ========== FETCH TOP DEALS ==========
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setDealsLoading(true);
        const res = await axios.get<{
          success: boolean;
          data: Paginated<TopDealItem>;
        }>(`${API_BASE}/menu-items/top-discounted`, {
          params: {
            page: 1,
            limit: DEALS_LIMIT,
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setDeals(res.data.data.items || []);
      } catch (err) {
        console.error("Fetch /menu-items/top-discounted error:", err);
      } finally {
        setDealsLoading(false);
      }
    };

    fetchDeals();
  }, [token]);

  return (
    <div className="relative">
      {/* HERO giữ nguyên */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50 to-white" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
                Khám phá <span className="text-rose-600">quán ngon</span> quanh
                bạn
              </h1>
              <p className="mt-4 text-gray-600 text-base lg:text-lg">
                Gợi ý chuẩn vị, có chỉ đường, giảm giá mỗi ngày. Bắt đầu hành
                trình FoodTour ngay!
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Bún/Phở",
                  "Lẩu/Nướng",
                  "Cà phê",
                  "Ăn vặt",
                  "Món Nhật",
                  "Món Hàn",
                ].map((x) => (
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

      {/* BANNER SLIDER giữ nguyên */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <BannerSlider
          slides={slides.map((s) => ({
            ...s,
            image: cdn(s.image),
          }))}
        />
      </section>

      {/* =========== NEARBY (API: /owner/restaurants/nearby-far) =========== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Quanh đây
            </h2>
            <p className="text-sm text-gray-500">
              Dựa trên vị trí hiện tại của bạn
            </p>
          </div>
          <Link
            href="/categories/nearby"
            className="text-sm text-rose-700 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>

        {nearbyLoading && (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse"
              />
            ))}
          </div>
        )}

        {!nearbyLoading && nearby.length === 0 && (
          <p className="text-sm text-gray-500">
            Chưa tìm được quán nào quanh bạn. Hãy thử cho phép truy cập vị trí
            hoặc đổi khu vực.
          </p>
        )}

        {!nearbyLoading && nearby.length > 0 && (
          <FoodNearbyList
            foods={nearby.map((r) => ({
              name: r.name,
              img:
                r.coverImageUrlSigned ??
                (r.coverImageUrl
                  ? cdn(r.coverImageUrl)
                  : "/image/default-restaurant.jpg"),
              address: [r.district, r.city].filter(Boolean).join(", "),
              distanceKm: r.distanceKm,
              slug: r.slug,
            }))}
          />
        )}
      </section>

      {/* =========== FEATURED + FILTER (API: /owner/restaurants/featured) =========== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              Quán ăn nổi bật
            </h2>
            <p className="text-sm text-gray-500">Bộ sưu tập hot & deal mới</p>
          </div>
          <Link
            href="/categories/restaurants"
            className="text-sm text-rose-700 hover:underline"
          >
            Xem thêm
          </Link>
        </div>

        {/* Thanh filter giống UI hình bạn chụp */}
        <form
          onSubmit={handleFeaturedFilterSubmit}
          className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
        >
          {/* Khoảng giá */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          >
            <option value="">Khoảng giá</option>
            <option value="cheap">Dưới 50K</option>
            <option value="medium">50K - 150K</option>
            <option value="expensive">Trên 150K</option>
          </select>

          {/* Quận/Huyện */}
          <input
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            placeholder="Quận/Huyện..."
            className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />

          {/* Món ăn */}
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Món ăn (ví dụ: phở, sushi)..."
            className="h-11 flex-1 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />

          <button
            type="submit"
            disabled={featuredLoading}
            className="h-11 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white shadow hover:bg-rose-700 disabled:opacity-60"
          >
            Lọc
          </button>
        </form>

        {featuredLoading && (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-gray-100 bg-gray-50 animate-pulse"
              />
            ))}
          </div>
        )}

        {!featuredLoading && featured.length === 0 && (
          <p className="text-sm text-gray-500">
            Không tìm thấy quán phù hợp với bộ lọc hiện tại.
          </p>
        )}

        {!featuredLoading && featured.length > 0 && (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((r:any) => {
              const cover =
                r.coverImageUrlSigned ??
                (r.coverImageUrl
                  ? cdn(r.coverImageUrl)
                  : "/image/default-restaurant.jpg");
              const addr = [r.district, r.city].filter(Boolean).join(", ");

              return (
                <Link
                  key={r.id}
                  href={`/categories/restaurants/${r._id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={cover}
                      alt={r.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-gray-900 group-hover:text-rose-700">
                          {r.name}
                        </div>
                        {addr && (
                          <div className="truncate text-sm text-gray-500">
                            {addr}
                          </div>
                        )}
                      </div>
                      {r.rating != null && (
                        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          ⭐ {r.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    {r.cuisine && r.cuisine.length > 0 && (
                      <div className="mt-2 line-clamp-1 text-xs text-gray-500">
                        {r.cuisine.join(" • ")}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* =========== DEALS (API: /menu-items/top-discounted) =========== */}
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

        {dealsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-gray-100 bg-gray-50"
              />
            ))}
          </div>
        )}

        {!dealsLoading && deals.length === 0 && (
          <p className="text-sm text-gray-500">
            Hiện chưa có ưu đãi nào. Thử lại sau nhé!
          </p>
        )}

        {!dealsLoading && deals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {deals.map((d) => {
              const firstSigned = d.imagesSigned?.[0]?.url;
              const firstImg = d.images?.[0];
              const imgSrc =
                firstSigned ??
                (firstImg ? cdn(firstImg) : "/image/default-food.jpg");

              const base = d.basePrice?.amount;
              const cmp = d.compareAtPrice?.amount;

              let discountLabel = "";
              if (d.discountPercent && d.discountPercent > 0) {
                discountLabel = `-${d.discountPercent}%`;
              } else if (base != null && cmp != null && cmp > base) {
                const p = Math.round(((cmp - base) / cmp) * 100);
                if (p > 0) discountLabel = `-${p}%`;
              }

              return (
                <Link
                  key={d._id}
                  href={`/deals/${d.slug}`}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={imgSrc}
                      alt={d.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                    {discountLabel && (
                      <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white shadow">
                        {discountLabel}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="truncate font-semibold text-gray-900">
                      {d.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {base != null && (
                        <span className="font-semibold text-rose-700">
                          {formatPrice(base)}
                        </span>
                      )}
                      {cmp != null && cmp > (base ?? 0) && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(cmp)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* BLOG COLLECTION giữ nguyên */}
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
