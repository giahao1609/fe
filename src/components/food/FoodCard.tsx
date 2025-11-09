"use client";

type Food = {
  name: string;
  address: string; // quận/huyện hoặc địa chỉ ngắn
  discount?: string;
  img: string;
  price: number;
  rating?: number; // optional nếu dữ liệu có
};

export default function FoodCard({ data }: { data: Food }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative">
        <div
          className="aspect-[4/3] w-full bg-gray-100"
          style={{
            backgroundImage: `url(${data.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {data.discount && data.discount !== "0%" && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2 py-1 text-xs font-bold text-white shadow">
            -{data.discount}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-gray-900">
            {data.name}
          </h3>
          {typeof data.rating === "number" && (
            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
              ★ {data.rating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="mt-1 line-clamp-1 text-sm text-gray-500">
          {data.address}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold text-rose-700">
              {data.price.toLocaleString()}đ
            </span>
            <span className="text-gray-400"> / suất</span>
          </div>
          <button className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 transition hover:border-rose-300 hover:text-rose-700">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
