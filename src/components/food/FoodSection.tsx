"use client";

import { useState, useMemo } from "react";
import { foods } from "@/data/foods";
import FoodList from "./FoodList";
// Nếu bạn đang có FilterBar riêng, import như dưới.
// import FilterBar from "../filters/FilterBar";

type Food = {
  name: string;
  address: string; // district
  discount: string;
  img: string;
  price: number;
  rating?: number;
};

type Filter = {
  price: "" | "low" | "mid" | "high";
  district: string;
  dish: string;
};

// 👉 Ví dụ FilterBar nội bộ (nếu bạn chưa có component sẵn). Nếu đã có, xoá block này.
function InlineFilterBar({ onFilter }: { onFilter: (f: Filter) => void }) {
  const [price, setPrice] = useState<Filter["price"]>("");
  const [district, setDistrict] = useState("");
  const [dish, setDish] = useState("");

  const apply = () => onFilter({ price, district, dish });

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
      <select
        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        value={price}
        onChange={(e) => setPrice(e.target.value as Filter["price"])}
      >
        <option value="">Khoảng giá</option>
        <option value="low">Dưới 50K</option>
        <option value="mid">50K - 100K</option>
        <option value="high">Trên 100K</option>
      </select>

      <input
        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        placeholder="Quận/Huyện…"
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
      />

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
          placeholder="Món ăn (ví dụ: phở, sushi)…"
          value={dish}
          onChange={(e) => setDish(e.target.value)}
        />
        <button
          onClick={apply}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Lọc
        </button>
      </div>
    </div>
  );
}

export default function FoodSection() {
  const [filter, setFilter] = useState<Filter>({
    price: "",
    district: "",
    dish: "",
  });

  const filteredFoods = useMemo(() => {
    return foods.filter((f: Food) => {
      let ok = true;

      if (filter.price === "low") ok = ok && f.price < 50_000;
      if (filter.price === "mid")
        ok = ok && f.price >= 50_000 && f.price <= 100_000;
      if (filter.price === "high") ok = ok && f.price > 100_000;

      if (filter.district)
        ok =
          ok && f.address.toLowerCase().includes(filter.district.toLowerCase());
      if (filter.dish)
        ok = ok && f.name.toLowerCase().includes(filter.dish.toLowerCase());

      return ok;
    });
  }, [filter]);

  return (
    <div>
      {/* Nếu bạn đã có <FilterBar onFilter={setFilter} />, thay bằng component đó */}
      <InlineFilterBar onFilter={setFilter} />
      <FoodList foods={filteredFoods} />
    </div>
  );
}
