"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DealFilters, { FiltersState } from "@/components/deals/DealFilters";
import DealCard, { Deal } from "@/components/deals/DealCard";

/** Luôn dùng dữ liệu giả để demo */
const PAGE_SIZE = 12;

export default function DealsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FiltersState>({
    q: "",
    district: "",
    category: "",
    minOff: 20,
    price: "",
    sort: "best",
  });

  const [deals, setDeals] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstLoadRef = useRef(true);

  // Khởi tạo data fake 1 lần (stable)
  const sample = useMemo(() => getSampleDeals(), []);

  // Reset trang về 1 khi đổi filter
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    setPage(1);
  }, [filters]);

  // Load dữ liệu từ sample + filter + phân trang
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setError(null);
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        // Fallback dữ liệu mẫu (luôn dùng)
        const filtered = applyLocalFilters(sample, filters);
        const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

        if (!cancelled) {
          setTotal(filtered.length);
          setDeals((prev) => (page === 1 ? paged : [...prev, ...paged]));
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("[Deals] fake fetch error:", e);
          setError("Không tải được danh sách ưu đãi (fake).");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [sample, filters, page]);

  const canLoadMore = deals.length < total;

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ưu đãi hot</h1>
          <p className="text-gray-600">
            Danh sách quán ăn đang giảm giá mạnh, cập nhật liên tục — lọc theo
            khu vực, danh mục, mức giảm.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {loading ? "Đang tải…" : total ? `${total} ưu đãi` : "Không có ưu đãi phù hợp"}
        </div>
      </header>

      <DealFilters value={filters} onChange={setFilters} />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
          {error}
        </div>
      )}

      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 animate-pulse" />
              <div className="mt-3 h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : deals.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {deals.map((d) => (
              <DealCard key={d._id} deal={d} />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              disabled={!canLoadMore || loadingMore}
              onClick={() => setPage((p) => p + 1)}
              className={`rounded-xl px-4 py-2 text-sm font-medium border shadow-sm ${
                canLoadMore
                  ? "border-gray-200 bg-white text-gray-800 hover:border-rose-300 hover:text-rose-700"
                  : "pointer-events-none opacity-50 border-gray-200 bg-white text-gray-400"
              }`}
            >
              {loadingMore ? "Đang tải thêm…" : canLoadMore ? "Tải thêm" : "Đã hết"}
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Không tìm thấy ưu đãi phù hợp. Hãy thử điều chỉnh bộ lọc nhé!
        </div>
      )}
    </main>
  );
}

 function getSampleDeals(): Deal[] {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  return [
    {
      _id: "d1",
      name: "Bò nướng XYZ",
      address: "12 Nguyễn Thị Minh Khai, Q1",
      district: "Q1",
      category: "Lẩu/Nướng",
      banner:
        "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_6_88ca431418.jpg",
      price: 89000,
      priceBefore: 139000,
      percentOff: 36,
      endsAt: new Date(now + 3 * day).toISOString(),
      rating: 4.5,
      ratingCount: 210,
      distanceKm: 1.2,
    },
    {
      _id: "d2",
      name: "Phở tái Bà Tám",
      address: "45 Lê Lợi, Q1",
      district: "Q1",
      category: "Bún/Phở",
      banner:
        "https://images.unsplash.com/photo-1604908553928-51b9cdbcdaad?auto=format&fit=crop&w=1600&q=80",
      price: 39000,
      priceBefore: 55000,
      percentOff: 29,
      endsAt: new Date(now + 1 * day).toISOString(),
      rating: 4.2,
      ratingCount: 98,
      distanceKm: 2.0,
    },
    {
      _id: "d3",
      name: "Sushi Sora",
      address: "88 Nguyễn Gia Trí, Bình Thạnh",
      district: "Bình Thạnh",
      category: "Món Nhật",
      banner:
        "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_2_02db0ace83.jpg",
      price: 129000,
      priceBefore: 199000,
      percentOff: 35,
      endsAt: new Date(now + 5 * day).toISOString(),
      rating: 4.7,
      ratingCount: 320,
      distanceKm: 3.8,
    },
    {
      _id: "d4",
      name: "Bánh mì Ông Bảy",
      address: "23 Trần Hưng Đạo, Q1",
      district: "Q1",
      category: "Bánh mì",
      banner:
        "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1600&q=80",
      price: 20000,
      priceBefore: 28000,
      percentOff: 29,
      endsAt: new Date(now + 2 * day).toISOString(),
      rating: 4.3,
      ratingCount: 150,
      distanceKm: 1.0,
    },
    {
      _id: "d5",
      name: "Lẩu Thái Chilli",
      address: "102 Cách Mạng Tháng 8, Q3",
      district: "Q3",
      category: "Lẩu/Nướng",
      banner:
        "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1600&q=80",
      price: 120000,
      priceBefore: 169000,
      percentOff: 29,
      endsAt: new Date(now + 6 * day).toISOString(),
      rating: 4.4,
      ratingCount: 265,
      distanceKm: 2.4,
    },
    {
      _id: "d6",
      name: "Cơm tấm Hoa Sứ",
      address: "77 Phan Xích Long, Phú Nhuận",
      district: "Phú Nhuận",
      category: "Cơm",
      banner:
        "https://images.unsplash.com/photo-1604908554049-4d472b1e6a4a?auto=format&fit=crop&w=1600&q=80",
      price: 35000,
      priceBefore: 49000,
      percentOff: 29,
      endsAt: new Date(now + 4 * day).toISOString(),
      rating: 4.1,
      ratingCount: 89,
      distanceKm: 3.2,
    },
    {
      _id: "d7",
      name: "Mì Quảng Quê Tôi",
      address: "15 Lê Văn Sỹ, Tân Bình",
      district: "Tân Bình",
      category: "Món Trung",
      banner:
        "https://images.unsplash.com/photo-1617191518000-3a6c3a9d8a87?auto=format&fit=crop&w=1600&q=80",
      price: 45000,
      priceBefore: 65000,
      percentOff: 31,
      endsAt: new Date(now + 2 * day).toISOString(),
      rating: 4.2,
      ratingCount: 60,
      distanceKm: 4.5,
    },
    {
      _id: "d8",
      name: "Cafe Rooftop Sunset",
      address: "120 Nguyễn Trãi, Q5",
      district: "Q5",
      category: "Cà phê",
      banner:
        "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1600&q=80",
      price: 39000,
      priceBefore: 59000,
      percentOff: 34,
      endsAt: new Date(now + 1.5 * day).toISOString(),
      rating: 4.6,
      ratingCount: 410,
      distanceKm: 2.9,
    },
    {
      _id: "d9",
      name: "Bánh cuốn Cô Ba",
      address: "45 Hoàng Hoa Thám, Tân Bình",
      district: "Tân Bình",
      category: "Ăn vặt",
      banner:
        "https://images.unsplash.com/photo-1604908554049-4d472b1e6a4a?auto=format&fit=crop&w=1600&q=80",
      price: 30000,
      priceBefore: 42000,
      percentOff: 29,
      endsAt: new Date(now + 3 * day).toISOString(),
      rating: 4.0,
      ratingCount: 70,
      distanceKm: 5.1,
    },
    {
      _id: "d10",
      name: "Cháo lòng 68",
      address: "68 Nguyễn Văn Luông, Q6",
      district: "Q6",
      category: "Món Việt",
      banner:
        "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1600&q=80",
      price: 28000,
      priceBefore: 38000,
      percentOff: 26,
      endsAt: new Date(now + 2 * day).toISOString(),
      rating: 4.1,
      ratingCount: 54,
      distanceKm: 6.0,
    },
    {
      _id: "d11",
      name: "Gỏi cuốn Mẹ Quê",
      address: "21 Trần Não, TP Thủ Đức",
      district: "Thủ Đức",
      category: "Ăn vặt",
      banner:
        "https://images.unsplash.com/photo-1544025162-519b0c8e3c31?auto=format&fit=crop&w=1600&q=80",
      price: 25000,
      priceBefore: 35000,
      percentOff: 29,
      endsAt: new Date(now + 3 * day).toISOString(),
      rating: 4.4,
      ratingCount: 112,
      distanceKm: 7.3,
    },
    {
      _id: "d12",
      name: "Bánh xèo 33",
      address: "33 Âu Cơ, Q11",
      district: "Q11",
      category: "Món Việt",
      banner:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
      price: 50000,
      priceBefore: 70000,
      percentOff: 29,
      endsAt: new Date(now + 4 * day).toISOString(),
      rating: 4.5,
      ratingCount: 230,
      distanceKm: 4.0,
    },
    {
      _id: "d13",
      name: "Cá kho tộ Sáu Lý",
      address: "5 Vĩnh Khánh, Q4",
      district: "Q4",
      category: "Món Việt",
      banner:
        "https://images.unsplash.com/photo-1605478263903-1d3a1c2f2c0d?auto=format&fit=crop&w=1600&q=80",
      price: 70000,
      priceBefore: 95000,
      percentOff: 26,
      endsAt: new Date(now + 2 * day).toISOString(),
      rating: 4.6,
      ratingCount: 178,
      distanceKm: 2.1,
    },
    {
      _id: "d14",
      name: "Canh chua cá lóc",
      address: "72 Kha Vạn Cân, Thủ Đức",
      district: "Thủ Đức",
      category: "Món Việt",
      banner:
        "https://images.unsplash.com/photo-1544025162-8a4f7f8f41d0?auto=format&fit=crop&w=1600&q=80",
      price: 65000,
      priceBefore: 89000,
      percentOff: 27,
      endsAt: new Date(now + 6 * day).toISOString(),
      rating: 4.2,
      ratingCount: 96,
      distanceKm: 9.5,
    },
    {
      _id: "d15",
      name: "Bún bò Huế O Như",
      address: "19 Đinh Bộ Lĩnh, Bình Thạnh",
      district: "Bình Thạnh",
      category: "Bún/Phở",
      banner:
        "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1600&q=80",
      price: 55000,
      priceBefore: 78000,
      percentOff: 29,
      endsAt: new Date(now + 3 * day).toISOString(),
      rating: 4.3,
      ratingCount: 144,
      distanceKm: 3.6,
    },
    {
      _id: "d16",
      name: "Ốc luộc Hẻm 88",
      address: "88 Điện Biên Phủ, Bình Thạnh",
      district: "Bình Thạnh",
      category: "Hải sản",
      banner:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80",
      price: 60000,
      priceBefore: 90000,
      percentOff: 33,
      endsAt: new Date(now + 2 * day).toISOString(),
      rating: 4.5,
      ratingCount: 201,
      distanceKm: 2.7,
    },
    {
      _id: "d17",
      name: "Gà rán CrispyBox",
      address: "56 Nguyễn Thiện Thuật, Q3",
      district: "Q3",
      category: "Ăn nhanh",
      banner:
        "https://images.pexels.com/photos/4109134/pexels-photo-4109134.jpeg?auto=compress&cs=tinysrgb&w=1600",
      price: 49000,
      priceBefore: 79000,
      percentOff: 38,
      endsAt: new Date(now + 1 * day).toISOString(),
      rating: 4.1,
      ratingCount: 320,
      distanceKm: 1.9,
    },
    {
      _id: "d18",
      name: "Pizza Napoli",
      address: "101 D2, Bình Thạnh",
      district: "Bình Thạnh",
      category: "Món Ý",
      banner:
        "https://images.pexels.com/photos/4109084/pexels-photo-4109084.jpeg?auto=compress&cs=tinysrgb&w=1600",
      price: 129000,
      priceBefore: 199000,
      percentOff: 35,
      endsAt: new Date(now + 4 * day).toISOString(),
      rating: 4.6,
      ratingCount: 500,
      distanceKm: 4.2,
    },
    {
      _id: "d19",
      name: "Trà sữa Black Sugar",
      address: "200 Võ Văn Tần, Q3",
      district: "Q3",
      category: "Trà sữa",
      banner:
        "https://images.pexels.com/photos/3026803/pexels-photo-3026803.jpeg?auto=compress&cs=tinysrgb&w=1600",
      price: 29000,
      priceBefore: 45000,
      percentOff: 36,
      endsAt: new Date(now + 2 * day).toISOString(),
      rating: 4.0,
      ratingCount: 260,
      distanceKm: 1.3,
    },
    {
      _id: "d20",
      name: "Steak House Prime",
      address: "12 Nguyễn Huệ, Q1",
      district: "Q1",
      category: "Món Âu",
      banner:
        "https://cdn.pixabay.com/photo/2017/03/10/13/57/cooking-2132874_1280.jpg",
      price: 219000,
      priceBefore: 329000,
      percentOff: 33,
      endsAt: new Date(now + 7 * day).toISOString(),
      rating: 4.7,
      ratingCount: 180,
      distanceKm: 0.9,
    },
  ];
}


function applyLocalFilters(data: Deal[], f: FiltersState): Deal[] {
  let list = data.slice();
  if (f.q) {
    const q = f.q.toLowerCase();
    list = list.filter(
      (x) =>
        x.name.toLowerCase().includes(q) ||
        x.address.toLowerCase().includes(q) ||
        x.category?.toLowerCase().includes(q)
    );
  }
  if (f.district) list = list.filter((x) => x.district === f.district);
  if (f.category) list = list.filter((x) => x.category === f.category);
  if (f.minOff) list = list.filter((x) => (x.percentOff ?? 0) >= f.minOff);

  if (f.price === "low") list = list.filter((x) => (x.price ?? 0) < 50000);
  if (f.price === "mid")
    list = list.filter(
      (x) => (x.price ?? 0) >= 50000 && (x.price ?? 0) <= 100000
    );
  if (f.price === "high") list = list.filter((x) => (x.price ?? 0) > 100000);

  switch (f.sort) {
    case "discount":
      list.sort((a, b) => (b.percentOff ?? 0) - (a.percentOff ?? 0));
      break;
    case "priceAsc":
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case "priceDesc":
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "near":
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      break;
    case "new":
      list.sort((a, b) => +new Date(b.endsAt ?? 0) - +new Date(a.endsAt ?? 0));
      break;
    case "best":
    default:
      list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }
  return list;
}
