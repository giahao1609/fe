"use client";

import { useEffect, useState } from "react";

export type CollectionsFilterState = {
  q: string;
  district: string;
  category: string;
  tag: string;
  sort: "featured" | "newest" | "updated" | "size";
};

export default function CollectionFilters({
  value,
  onChange,
}: {
  value: CollectionsFilterState;
  onChange: (v: CollectionsFilterState) => void;
}) {
  const [st, setSt] = useState<CollectionsFilterState>(value);

  useEffect(() => setSt(value), [value]);

  const apply = () => onChange(st);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              value={st.q}
              onChange={(e) => setSt((s) => ({ ...s, q: e.target.value }))}
              placeholder="Tìm theo chủ đề/tên bộ sưu tập…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <select
            value={st.district}
            onChange={(e) => setSt((s) => ({ ...s, district: e.target.value }))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Tất cả quận/huyện</option>
            <option>Q1</option>
            <option>Q3</option>
            <option>Bình Thạnh</option>
            <option>Phú Nhuận</option>
            {/* ... */}
          </select>

          <select
            value={st.category}
            onChange={(e) => setSt((s) => ({ ...s, category: e.target.value }))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Tất cả danh mục</option>
            <option value="Bún/Phở">Bún/Phở</option>
            <option value="Lẩu/Nướng">Lẩu/Nướng</option>
            <option value="Cà phê">Cà phê</option>
            <option value="Món Nhật">Món Nhật</option>
            <option value="Món Hàn">Món Hàn</option>
          </select>

          <input
            value={st.tag}
            onChange={(e) => setSt((s) => ({ ...s, tag: e.target.value }))}
            placeholder="Tag (ví dụ: lẩu, rooftop, healthy)"
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={st.sort}
            onChange={(e) =>
              setSt((s) => ({
                ...s,
                sort: e.target.value as CollectionsFilterState["sort"],
              }))
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="featured">Nổi bật</option>
            <option value="newest">Mới nhất</option>
            <option value="updated">Cập nhật gần đây</option>
            <option value="size">Nhiều quán nhất</option>
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
