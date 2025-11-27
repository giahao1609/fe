// src/components/admin/categories/CategoryFormTab.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CategoryService,
  type Category,
  type UpsertCategoryPayload,
} from "@/services/category.service";

interface CategoryFormTabProps {
  editing: Category | null;
  onDone: () => void;
}

interface ParentOption {
  _id: string;
  name: string;
  depth: number;
}

const ICON_PRESETS = [
  { value: "🍔", label: "Đồ ăn nhanh" },
  { value: "🍕", label: "Pizza" },
  { value: "🍣", label: "Món Nhật" },
  { value: "🍜", label: "Mì / Phở" },
  { value: "🥗", label: "Healthy / Salad" },
  { value: "🍰", label: "Tráng miệng" },
  { value: "☕", label: "Cà phê" },
  { value: "🍺", label: "Quán nhậu" },
  { value: "🔥", label: "Spicy / Hot" },
];

export default function CategoryFormTab({
  editing,
  onDone,
}: CategoryFormTabProps) {
  const isEditMode = !!editing;

  const [loadingTree, setLoadingTree] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tree, setTree] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [parentId, setParentId] = useState<string | "">("");
  const [isActive, setIsActive] = useState(true);
  const [sortIndex, setSortIndex] = useState<string>("");

  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");

  const slugify = (input: string) =>
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  // fill form khi edit
  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setSlug(editing.slug || "");
      setDescription(editing.description || "");
      setImage(editing.image || "");
      setParentId(editing.parentId || "");
      setIsActive(editing.isActive ?? true);
      setSortIndex(
        typeof editing.sortIndex === "number"
          ? String(editing.sortIndex)
          : "",
      );
      setIcon(editing.extra?.icon || "");
      setColor(editing.extra?.color || "");
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setImage("");
      setParentId("");
      setIsActive(true);
      setSortIndex("");
      setIcon("");
      setColor("");
    }
  }, [editing]);

  // load tree cho dropdown parent
  const loadTree = async () => {
    setLoadingTree(true);
    setError(null);
    try {
      const data = await CategoryService.listTree();
      setTree(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Không tải được cây category.");
    } finally {
      setLoadingTree(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const parentOptions = useMemo<ParentOption[]>(() => {
    const arr: ParentOption[] = [];
    const walk = (nodes: Category[], depth: number) => {
      for (const node of nodes) {
        if (!editing || node._id !== editing._id) {
          arr.push({ _id: node._id, name: node.name, depth });
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
          walk(node.children, depth + 1);
        }
      }
    };
    walk(tree, 0);
    return arr;
  }, [tree, editing]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode || !slug) {
      setSlug(slugify(val));
    }
  };

  const handleIconPresetClick = (value: string) => {
    setIcon((prev) => (prev === value ? "" : value)); // click lại để bỏ chọn
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Vui lòng nhập tên category.");
      return;
    }
    if (!slug.trim()) {
      setError("Vui lòng nhập slug.");
      return;
    }

    const sortIndexNum =
      sortIndex.trim() === "" ? undefined : Number(sortIndex);

    if (sortIndexNum !== undefined && Number.isNaN(sortIndexNum)) {
      setError("Thứ tự sắp xếp phải là số.");
      return;
    }

    const payload: UpsertCategoryPayload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      parentId: parentId || null,
      isActive,
      sortIndex: sortIndexNum,
      extra:
        icon.trim() || color.trim()
          ? {
              icon: icon.trim() || undefined,
              color: color.trim() || undefined,
            }
          : undefined,
    };

    setSaving(true);
    try {
      if (isEditMode && editing?._id) {
        await CategoryService.updateCategory(editing._id, payload);
      } else {
        await CategoryService.createCategory(payload);
      }
      onDone();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "Không thể lưu category, vui lòng kiểm tra lại dữ liệu.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Sửa Category" : "Thêm Category mới"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Đặt tên, slug, chọn danh mục cha, icon, màu sắc và trạng thái cho
            category. Dùng sortIndex để điều chỉnh thứ tự hiển thị.
          </p>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50"
        >
          ← Quay lại danh sách
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm lg:grid-cols-[2fr,1.4fr]"
      >
        {/* Cột trái */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Thông tin chính
          </h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Tên category
            </label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Đồ ăn nhanh, Cà phê, Món Hàn..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Slug (URL-friendly)
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="vd: do-an-nhanh"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-gray-400">
              Slug dùng để tạo URL thân thiện, nên viết không dấu, chữ thường,
              gạch ngang.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Mô tả ngắn về nhóm món ăn, giúp SEO tốt hơn."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Image URL (tùy chọn)
            </label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://cdn.example.com/categories/fast-food.png"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-gray-400">
              Dùng ảnh minh hoạ category trên landing page / app.
            </p>
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Cấu hình hiển thị
          </h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Danh mục cha (tùy chọn)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">— Không có (category gốc)</option>
              {parentOptions.map((p) => (
                <option key={p._id} value={p._id}>
                  {Array.from({ length: p.depth })
                    .map(() => "— ")
                    .join("")}
                  {p.name}
                </option>
              ))}
            </select>
            {loadingTree && (
              <p className="text-xs text-gray-400">
                Đang tải cây category...
              </p>
            )}
          </div>

          {/* Icon presets */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Icon hiển thị
            </label>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-2">
              <div className="mb-2 flex flex-wrap gap-1">
                {ICON_PRESETS.map((it) => {
                  const active = icon === it.value;
                  return (
                    <button
                      key={it.value}
                      type="button"
                      onClick={() => handleIconPresetClick(it.value)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                        active
                          ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-base">{it.value}</span>
                      <span>{it.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Icon đang chọn:</span>
                  <span className="rounded-lg bg-white px-2 py-1 text-base">
                    {icon || "—"}
                  </span>
                </div>
                {/* Nếu cần custom thêm thì bỏ comment input dưới */}
                {/* <input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Nhập emoji khác (optional)"
                  className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100"
                /> */}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Màu chủ đạo (hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#FF9900"
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
                <div
                  className="h-8 w-8 rounded-lg border border-gray-200"
                  style={{
                    backgroundColor: color || "#ffffff",
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Thứ tự sắp xếp (sortIndex)
              </label>
              <input
                value={sortIndex}
                onChange={(e) => setSortIndex(e.target.value)}
                placeholder="Ví dụ: 10"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-xs text-gray-400">
                Số nhỏ hơn sẽ hiển thị trước. Có thể để trống.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <label className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              {isActive ? "Đang bật (hiển thị)" : "Đang tắt (ẩn khỏi người dùng)"}
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {error && (
              <p className="max-w-xs text-xs text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`ml-auto inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving
                ? "Đang lưu..."
                : isEditMode
                  ? "Lưu thay đổi"
                  : "Tạo category"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
