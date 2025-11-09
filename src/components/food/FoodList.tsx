"use client";

import FoodCard from "./FoodCard";

type Food = {
  name: string;
  address: string;
  discount?: string;
  img: string;
  price: number;
  rating?: number;
};

export default function FoodList({ foods }: { foods: Food[] }) {
  if (!foods?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
        Không có kết quả phù hợp. Hãy thử đổi bộ lọc khác nhé!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
      {foods.map((f, idx) => (
        <FoodCard key={`${f.name}-${f.address}-${idx}`} data={f} />
      ))}
    </div>
  );
}
