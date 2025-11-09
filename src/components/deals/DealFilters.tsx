"use client";

import { useEffect, useState } from "react";

export type FiltersState = {
  q: string;
  district: string;
  category: string;
  minOff: number; // %
  price: "" | "low" | "mid" | "high";
  sort: "best" | "discount" | "near" | "priceAsc" | "priceDesc" | "new";
};

export default function DealFilters({
  value,
  onChange,
}: {
  value: FiltersState;
  onChange: (v: FiltersState) => void;
}) {
  const [state, setState] = useState<FiltersState>(value);

  useEffect(() => setState(value), [value]);

  const apply = () => onChange(state);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        {/* Left: search + selects */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* search */}
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
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
            <input
              value={state.q}
              onChange={(e) => setState((s) => ({ ...s, q: e.target.value }))}
              placeholder="Tìm món/quán…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          {/* district */}
          <select
            value={state.district}
            onChange={(e) =>
              setState((s) => ({ ...s, district: e.target.value }))
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Tất cả quận/huyện</option>
            <option>Q1</option>
            <option>Q3</option>
            <option>Bình Thạnh</option>
            <option>Phú Nhuận</option>
            {/* … bổ sung */}
          </select>

          {/* category */}
          <select
            value={state.category}
            onChange={(e) =>
              setState((s) => ({ ...s, category: e.target.value }))
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Tất cả danh mục</option>
            <option value="Bún/Phở">Bún/Phở</option>
            <option value="Lẩu/Nướng">Lẩu/Nướng</option>
            <option value="Cà phê">Cà phê</option>
            <option value="Món Nhật">Món Nhật</option>
            <option value="Món Hàn">Món Hàn</option>
          </select>

          {/* price range quick */}
          <select
            value={state.price}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                price: e.target.value as FiltersState["price"],
              }))
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Mức giá</option>
            <option value="low">&lt; 50k</option>
            <option value="mid">50k – 100k</option>
            <option value="high">&gt; 100k</option>
          </select>
        </div>

        {/* Right: sliders + sort + apply */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Giảm tối thiểu</span>
            <input
              type="range"
              min={0}
              max={70}
              step={5}
              value={state.minOff}
              onChange={(e) =>
                setState((s) => ({ ...s, minOff: Number(e.target.value) }))
              }
            />
            <span className="font-medium text-gray-800">{state.minOff}%</span>
          </div>

          <select
            value={state.sort}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                sort: e.target.value as FiltersState["sort"],
              }))
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="best">Nổi bật</option>
            <option value="discount">Giảm nhiều</option>
            <option value="near">Gần tôi</option>
            <option value="priceAsc">Giá ↑</option>
            <option value="priceDesc">Giá ↓</option>
            <option value="new">Sắp hết hạn</option>
          </select>

          <button
            onClick={apply}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
