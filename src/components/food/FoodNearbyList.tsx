"use client";

type Food = {
  name: string;
  address: string;
  discount?: string;
  img: string;
  price: number;
  rating?: number;
};

export default function FoodNearbyList({ foods }: { foods: any[] }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="flex gap-4">
        {foods.map((f, i) => (
          <div
            key={`${f.name}-${i}`}
            className="min-w-[240px] max-w-[260px] shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="relative">
              <div
                className="aspect-[4/3] w-full bg-gray-100"
                style={{
                  backgroundImage: `url(${f.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {f.discount && f.discount !== "0%" && (
                <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2 py-1 text-xs font-bold text-white shadow">
                  -{f.discount}
                </span>
              )}
            </div>
            <div className="p-3">
              <div className="line-clamp-1 font-semibold text-gray-900">
                {f.name}
              </div>
              <div className="line-clamp-1 text-sm text-gray-500">
                {f.address}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold text-rose-700">
                    {f?.price?.toLocaleString()}đ
                  </span>
                </div>
                <button className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-rose-300 hover:text-rose-700">
                  Chỉ đường
                </button>
              </div>
            </div>
          </div>
        ))}
        {/* spacer để scroll dễ thở */}
        <div className="w-1" />
      </div>
    </div>
  );
}
