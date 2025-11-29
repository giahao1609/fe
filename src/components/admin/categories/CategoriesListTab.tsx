"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CategoryService,
  type Category,
} from "@/services/category.service";

interface CategoriesListTabProps {
  onEdit: (category: Category | null) => void;
}

type FlatCategory = Category & { depth: number; parentName?: string };

export default function CategoriesListTab({ onEdit }: CategoriesListTabProps) {
  const [loading, setLoading] = useState(false);
  const [categoriesTree, setCategoriesTree] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  const fetchTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CategoryService.listTree();
      setCategoriesTree(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Không tải được danh sách category.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const flatCategories = useMemo<FlatCategory[]>(() => {
    const arr: FlatCategory[] = [];

    const walk = (nodes: Category[], depth: number, parent?: Category) => {
      for (const node of nodes) {
        arr.push({
          ...node,
          depth,
          parentName: parent?.name,
        });
        if (Array.isArray(node.children) && node.children.length > 0) {
          walk(node.children, depth + 1, node);
        }
      }
    };

    walk(categoriesTree, 0);
    return arr;
  }, [categoriesTree]);

  const filtered = useMemo(() => {
    return flatCategories.filter((c) => {
      if (showOnlyActive && !c.isActive) return false;
      if (!search.trim()) return true;

      const keyword = search.trim().toLowerCase();
      return (
        c.name.toLowerCase().includes(keyword) ||
        c.slug.toLowerCase().includes(keyword) ||
        (c.parentName || "").toLowerCase().includes(keyword)
      );
    });
  }, [flatCategories, search, showOnlyActive]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Danh mục món ăn / Category
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý cây danh mục cho nhà hàng, món ăn. Có thể tạo danh mục cha
            – con, sắp xếp thứ tự và bật/tắt hiển thị.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEdit(null)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <span>➕</span>
          <span>Thêm Category</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên / slug / danh mục cha..."
              className="w-64 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <label className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
              checked={showOnlyActive}
              onChange={(e) => setShowOnlyActive(e.target.checked)}
            />
            Chỉ hiển thị danh mục đang bật
          </label>
        </div>

        <div className="text-xs text-gray-500">
          Tổng:{" "}
          <span className="font-semibold text-gray-800">
            {flatCategories.length}
          </span>{" "}
          · Sau lọc:{" "}
          <span className="font-semibold text-blue-700">
            {filtered.length}
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Tên category</th>
              <th className="px-4 py-3 text-left font-semibold">Slug</th>
              <th className="px-4 py-3 text-left font-semibold">
                Danh mục cha
              </th>
              <th className="px-4 py-3 text-left font-semibold text-center">
                Thứ tự
              </th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-4 py-3">
                      <div className="h-4 w-40 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-28 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="mx-auto h-4 w-10 rounded bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-20 rounded-full bg-gray-100 animate-pulse" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-block h-7 w-16 rounded-full bg-gray-100 animate-pulse" />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Không có category nào phù hợp.
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((c) => (
                <tr
                  key={c._id}
                  className="border-t border-gray-50 hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block"
                        style={{ width: `${(c as any).depth * 16 || 0}px` }}
                      />
                      {c.extra?.icon && (
                        <span className="text-base">{c.extra.icon}</span>
                      )}
                      <span className="font-medium text-gray-900">
                        {c.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {(c as any).parentName || (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">
                    {typeof c.sortIndex === "number" ? c.sortIndex : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span
                        className={`mr-1 h-1.5 w-1.5 rounded-full ${
                          c.isActive ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                      {c.isActive ? "Đang bật" : "Đang tắt"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(c)}
                      className="inline-flex items-center gap-1 rounded-full border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                    >
                      ✏️ Sửa
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
    </section>
  );
}
