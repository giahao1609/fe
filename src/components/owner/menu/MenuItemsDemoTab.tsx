"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MenuService,
  type MenuItem,
  type CreateMenuItemPayload,
} from "@/services/menu.service";
import { NotifyService } from "@/services/notify.service";
import {
  RestaurantService,
  type Restaurant,
} from "@/services/restaurant.service";

const ITEM_TYPE_OPTIONS = [
  { value: "food", label: "Món ăn" },
  { value: "drink", label: "Đồ uống" },
  { value: "other", label: "Khác" },
];

type FormMode = "create" | "edit";

interface FormState {
  id?: string; // dùng khi edit
  name: string;
  slug: string;
  description: string;
  itemType: string;

  // basePrice
  priceCurrency: string;
  priceAmount: string;

  // compareAtPrice (giá gốc / trước KM)
  compareAtPriceAmount: string;

  // % giảm giá
  discountPercent: string;

  tags: string; // nhập “drink, tea”
  cuisines: string; // nhập “vietnamese, korean”
  isAvailable: boolean;
  sortIndex: string;

  // Ảnh mới upload
  images: File[];
  imagePreviews: string[];

  // Ảnh hiện tại trên server (paths / URLs)
  existingImages: string[];
  removedExistingImages: string[];
}

const initialFormState: FormState = {
  name: "",
  slug: "",
  description: "",
  itemType: "drink",
  priceCurrency: "VND",
  priceAmount: "35000",
  compareAtPriceAmount: "",
  discountPercent: "",
  tags: "",
  cuisines: "",
  isAvailable: true,
  sortIndex: "",
  images: [],
  imagePreviews: [],
  existingImages: [],
  removedExistingImages: [],
};

export default function MenuItemsDemoTab() {
  // ==== Nhà hàng của owner ====
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [restaurantsError, setRestaurantsError] = useState<string | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] =
    useState<string | null>(null);

  // ==== Menu items ====
  const [items, setItems] = useState<any[]>([]);
  const [itemsPage, setItemsPage] = useState<number>(1);
  const [itemsLimit] = useState<number>(20);
  const [itemsTotal, setItemsTotal] = useState<number>(0);
  const [itemsPages, setItemsPages] = useState<number>(1);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(initialFormState);
  const [mode, setMode] = useState<FormMode>("create");
  const [search, setSearch] = useState("");

  // ==== Helpers ====
  const slugify = (input: string) =>
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const resetForm = () => {
    setForm(initialFormState);
    setMode("create");
  };

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r._id === selectedRestaurantId) ?? null,
    [restaurants, selectedRestaurantId],
  );

  // ==== Load restaurants (owner/restaurants) ====
  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    setRestaurantsError(null);
    try {
      const res = await RestaurantService.getByOwner();
      setRestaurants(res.items);

      // nếu chưa chọn quán nào và có quán => tự chọn quán đầu tiên
      if (!selectedRestaurantId && res.items.length > 0) {
        setSelectedRestaurantId(res.items[0]._id);
      }
    } catch (err: any) {
      console.error(err);
      setRestaurantsError(
        err?.message || "Không tải được danh sách nhà hàng.",
      );
    } finally {
      setLoadingRestaurants(false);
    }
  };

  // ==== Load menu items cho 1 nhà hàng ====
  const loadItems = async (restaurantId: string, page = 1) => {
    setLoadingList(true);
    setError(null);
    try {
      const data = await MenuService.listByRestaurant(restaurantId, {
        page,
        limit: itemsLimit,
      });

      setItems(data.items || []);
      setItemsPage(data.page);
      setItemsTotal(data.total);
      setItemsPages(data.pages);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Không tải được danh sách món.");
      setItems([]);
      setItemsTotal(0);
      setItemsPages(1);
    } finally {
      setLoadingList(false);
    }
  };

  // Khi tab mount → load restaurants
  useEffect(() => {
    loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi chọn nhà hàng mới → load menu của nhà hàng đó
  useEffect(() => {
    if (!selectedRestaurantId) {
      setItems([]);
      setItemsTotal(0);
      setItemsPages(1);
      return;
    }
    loadItems(selectedRestaurantId, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurantId]);

  // ==== Form events ====
  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      // auto slug nếu đang create hoặc slug đang trống
      slug:
        mode === "create" || !prev.slug.trim() ? slugify(value) : prev.slug,
    }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    const newPreviews = files.map((f) => URL.createObjectURL(f));

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
      imagePreviews: [...prev.imagePreviews, ...newPreviews],
    }));
  };

  const removeImageAt = (index: number) => {
    setForm((prev) => {
      const newFiles = [...prev.images];
      const newPreviews = [...prev.imagePreviews];
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);
      return { ...prev, images: newFiles, imagePreviews: newPreviews };
    });
  };

  const handleRemoveExistingImage = (path: string) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((p) => p !== path),
      removedExistingImages: prev.removedExistingImages.includes(path)
        ? prev.removedExistingImages
        : [...prev.removedExistingImages, path],
    }));
  };

  const parseTags = (raw: string): string[] =>
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const parseCuisines = (raw: string): string[] =>
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  // ==== Create / Edit submit ====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRestaurantId) {
      setError("Vui lòng chọn nhà hàng trước khi tạo menu.");
      return;
    }

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên món.");
      return;
    }
    if (!form.slug.trim()) {
      setError("Vui lòng nhập slug.");
      return;
    }
    if (!form.priceAmount.trim() || Number.isNaN(Number(form.priceAmount))) {
      setError("Giá phải là số.");
      return;
    }
    if (
      form.compareAtPriceAmount.trim() &&
      Number.isNaN(Number(form.compareAtPriceAmount))
    ) {
      setError("Giá gốc phải là số.");
      return;
    }
    if (
      form.discountPercent.trim() &&
      Number.isNaN(Number(form.discountPercent))
    ) {
      setError("Phần trăm giảm giá phải là số.");
      return;
    }

    const baseCurrency = form.priceCurrency.trim() || "VND";
    const baseAmount = Number(form.priceAmount);

    const compareAtAmount = form.compareAtPriceAmount.trim();
    const discountPercentStr = form.discountPercent.trim();

    const payloadBase: CreateMenuItemPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      itemType: form.itemType || "other",
      basePrice: {
        currency: baseCurrency,
        amount: baseAmount,
      },
      // optional compareAtPrice
      ...(compareAtAmount && {
        compareAtPrice: {
          currency: baseCurrency,
          amount: Number(compareAtAmount),
        },
      }),
      // optional discountPercent
      ...(discountPercentStr && {
        discountPercent: Number(discountPercentStr),
      }),
      tags: parseTags(form.tags),
      cuisines: parseCuisines(form.cuisines),
      isAvailable: form.isAvailable,
      sortIndex: form.sortIndex.trim()
        ? Number(form.sortIndex.trim())
        : undefined,
      // variants, optionGroups, promotions... có thể thêm sau tuỳ nhu cầu
    };

    setLoadingSubmit(true);
    try {
      if (mode === "create" || !form.id) {
        // === TẠO MỚI ===
        await MenuService.createForRestaurant(selectedRestaurantId, {
          ...payloadBase,
          images: form.images,
        });
        NotifyService.success("Đã thêm món vào menu.");
      } else {
        // === SỬA ===
        await MenuService.updateForRestaurant(selectedRestaurantId, form.id, {
          ...payloadBase,
          images: form.images,
          flags: {
            imagesMode: "append",
            removeAllImages: false,
            imagesRemovePaths: form.removedExistingImages,
          },
        });
        NotifyService.success("Đã cập nhật món.");
      }

      resetForm();
      await loadItems(selectedRestaurantId, itemsPage);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Không thể lưu menu item.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setMode("edit");

    setForm({
      id: item._id,
      name: item.name || "",
      slug: item.slug || "",
      description: item.description || "",
      itemType: item.itemType || "other",
      priceCurrency: item.basePrice?.currency || "VND",
      priceAmount:
        item.basePrice && typeof item.basePrice.amount === "number"
          ? String(item.basePrice.amount)
          : "",
      compareAtPriceAmount:
        item.compareAtPrice && typeof item.compareAtPrice.amount === "number"
          ? String(item.compareAtPrice.amount)
          : "",
      discountPercent:
        typeof item.discountPercent === "number"
          ? String(item.discountPercent)
          : "",
      tags: (item.tags || []).join(", "),
      cuisines: (item.cuisines || []).join(", "),
      isAvailable: item.isAvailable ?? true,
      sortIndex:
        typeof item.sortIndex === "number" ? String(item.sortIndex) : "",
      images: [],
      imagePreviews: [],
      existingImages: item.images || [],
      removedExistingImages: [],
    });
  };

  const handleDelete = async (item: MenuItem) => {
    if (!selectedRestaurantId) {
      setError("Vui lòng chọn nhà hàng trước khi xoá món.");
      return;
    }
    if (!window.confirm(`Xoá món "${item.name}" khỏi menu?`)) return;

    setLoadingDeleteId(item._id);
    try {
      await MenuService.deleteForRestaurant(selectedRestaurantId, item._id);
      NotifyService.success("Đã xoá món.");
      await loadItems(selectedRestaurantId, itemsPage);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Không thể xoá món.");
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const filteredItems = items.filter((item : any) => {
    if (!search.trim()) return true;
    const keyword = search.trim().toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.slug.toLowerCase().includes(keyword) ||
      (item.description || "").toLowerCase().includes(keyword) ||
      (item.tags || []).some((t : any) => t.toLowerCase().includes(keyword))
    );
  });

  const canPrev = itemsPage > 1;
  const canNext = itemsPage < itemsPages;

  const gotoPage = async (page: number) => {
    if (!selectedRestaurantId) return;
    const safePage = Math.min(Math.max(1, page), itemsPages || 1);
    await loadItems(selectedRestaurantId, safePage);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header chọn nhà hàng */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 p-[1px]">
        <div className="flex flex-col gap-3 rounded-2xl bg-white/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Menu nhà hàng
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Chọn một nhà hàng bên dưới để thêm, sửa, xoá món ăn / đồ uống.
            </p>
            {selectedRestaurant && (
              <p className="mt-1 text-xs text-gray-500">
                Đang chọn:{" "}
                <span className="font-semibold text-gray-800">
                  {selectedRestaurant.name}
                </span>{" "}
                ·{" "}
                <span className="font-mono">
                  {selectedRestaurant._id}
                </span>
              </p>
            )}
            {!selectedRestaurant && !loadingRestaurants && (
              <p className="mt-1 text-xs text-rose-600">
                Chưa có nhà hàng, hoặc bạn chưa chọn nhà hàng nào.
              </p>
            )}
          </div>

          <div className="space-y-1 text-right text-xs text-gray-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
              <span>📋</span>
              <span>1. Chọn nhà hàng · 2. Quản lý menu</span>
            </div>
            <p>
              Chế độ:{" "}
              <span className="font-semibold text-gray-800">
                {mode === "create" ? "Thêm món mới" : "Sửa món"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách nhà hàng (selector) */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Nhà hàng của bạn
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Chọn một nhà hàng để xem và chỉnh sửa menu.
            </p>
          </div>
          <button
            type="button"
            onClick={loadRestaurants}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            🔄 Tải lại
          </button>
        </div>

        {loadingRestaurants && (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-9 w-40 animate-pulse rounded-full bg-gray-100"
              />
            ))}
          </div>
        )}

        {restaurantsError && (
          <p className="text-xs text-rose-600 mb-2">
            Lỗi: {restaurantsError}
          </p>
        )}

        {!loadingRestaurants && restaurants.length === 0 && (
          <p className="text-xs text-gray-500">
            Bạn chưa có nhà hàng nào. Hãy tạo nhà hàng trước khi thêm menu.
          </p>
        )}

        {!loadingRestaurants && restaurants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {restaurants.map((r) => {
              const isActive = r._id === selectedRestaurantId;
              return (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => {
                    setSelectedRestaurantId(r._id);
                    resetForm();
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs flex items-center gap-2 ${
                    isActive
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <span className="font-medium truncate max-w-[140px]">
                    {r.name}
                  </span>
                  {r.isActive ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Top controls & list */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr,1.4fr]">
        {/* Bảng danh sách / list */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Danh sách món ăn / đồ uống
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Các món thuộc nhà hàng đang chọn.
              </p>
              {selectedRestaurantId && (
                <p className="mt-0.5 text-[11px] text-gray-400">
                  Tổng: {itemsTotal} · Trang {itemsPage}/{itemsPages}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, slug, tag..."
                className="w-48 rounded-xl border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Món</th>
                  <th className="px-3 py-2 text-left font-semibold">Loại</th>
                  <th className="px-3 py-2 text-right font-semibold">Giá</th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2 text-right font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingList && (
                  <>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-gray-50 bg-white"
                      >
                        <td className="px-3 py-2">
                          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-3 py-2">
                          <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="ml-auto h-3 w-16 animate-pulse rounded bg-gray-100" />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="mx-auto h-5 w-20 animate-pulse rounded-full bg-gray-100" />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="ml-auto h-6 w-20 animate-pulse rounded-full bg-gray-100" />
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {!loadingList && filteredItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-5 text-center text-xs text-gray-500"
                    >
                      {selectedRestaurantId
                        ? "Chưa có món nào hoặc không tìm thấy theo từ khoá."
                        : "Vui lòng chọn nhà hàng để xem menu."}
                    </td>
                  </tr>
                )}

                {!loadingList &&
                  filteredItems.map((item) => {
                    const baseAmount = item.basePrice?.amount ?? null;
                    const baseCurrency =
                      item.basePrice?.currency ||
                      item.compareAtPrice?.currency ||
                      "VND";
                    const compareAmount = item.compareAtPrice?.amount ?? null;
                    const hasCompare =
                      typeof compareAmount === "number" &&
                      compareAmount > (baseAmount ?? 0);

                    return (
                      <tr
                        key={item._id}
                        className="border-t border-gray-50 bg-white hover:bg-gray-50/80"
                      >
                        <td className="px-3 py-2 align-top">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-900">
                                {item.name}
                              </span>
                              {typeof item.sortIndex === "number" && (
                                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                                  #{item.sortIndex}
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-[10px] text-gray-400">
                              {item.slug}
                            </p>
                            {item.tags && item.tags.length > 0 && (
                              <p className="text-[10px] text-gray-500">
                                Tags: {item.tags.join(", ")}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] capitalize text-gray-700">
                            {item.itemType || "other"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right align-top">
                          <div className="flex flex-col items-end gap-0.5">
                            {hasCompare && (
                              <span className="font-mono text-[10px] text-gray-400 line-through">
                                {compareAmount?.toLocaleString?.("vi-VN") ??
                                  compareAmount}{" "}
                                <span className="text-[9px]">
                                  {baseCurrency}
                                </span>
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-gray-900">
                              {baseAmount?.toLocaleString?.("vi-VN") ??
                                baseAmount ??
                                "-"}{" "}
                              <span className="text-[10px] text-gray-500">
                                {baseCurrency}
                              </span>
                            </span>
                            {typeof item.discountPercent === "number" &&
                              item.discountPercent > 0 && (
                                <span className="text-[10px] text-emerald-600">
                                  -{item.discountPercent}%
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              item.isAvailable
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <span
                              className={`mr-1 h-1.5 w-1.5 rounded-full ${
                                item.isAvailable
                                  ? "bg-emerald-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {item.isAvailable ? "Đang bán" : "Tạm ngưng"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right align-top">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="rounded-full border border-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              type="button"
                              disabled={loadingDeleteId === item._id}
                              onClick={() => handleDelete(item)}
                              className="rounded-full border border-rose-100 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {loadingDeleteId === item._id
                                ? "Đang xoá..."
                                : "🗑 Xoá"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination đơn giản */}
          {selectedRestaurantId && itemsPages > 1 && (
            <div className="mt-2 flex items-center justify-end gap-2 text-[11px] text-gray-500">
              <button
                type="button"
                disabled={!canPrev || loadingList}
                onClick={() => gotoPage(itemsPage - 1)}
                className={`rounded-full border px-2 py-1 ${
                  canPrev && !loadingList
                    ? "border-gray-200 hover:border-blue-300 hover:text-blue-700"
                    : "border-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                ← Trước
              </button>
              <span>
                Trang {itemsPage}/{itemsPages}
              </span>
              <button
                type="button"
                disabled={!canNext || loadingList}
                onClick={() => gotoPage(itemsPage + 1)}
                className={`rounded-full border px-2 py-1 ${
                  canNext && !loadingList
                    ? "border-gray-200 hover:border-blue-300 hover:text-blue-700"
                    : "border-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                Sau →
              </button>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600">
              Lỗi: {error}
            </p>
          )}
        </section>

        {/* Form tạo / sửa */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {mode === "create" ? "Thêm món mới" : "Sửa món"}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {selectedRestaurant
                  ? `Nhà hàng: ${selectedRestaurant.name}`
                  : "Vui lòng chọn nhà hàng trước khi thêm món."}
              </p>
            </div>
            {mode === "edit" && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                ← Chuyển về chế độ thêm mới
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Tên + slug */}
            <div className="grid gap-3 sm:grid-cols-[1.4fr,1.2fr]">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Tên món <span className="text-rose-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Trà đào cam sả, Phở bò, Tokbokki..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  disabled={!selectedRestaurantId}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={handleChange("slug")}
                  placeholder="tra-dao-cam-sa"
                  className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  disabled={!selectedRestaurantId}
                />
              </div>
            </div>

            {/* Type + price */}
            <div className="grid gap-3 sm:grid-cols-[1.2fr,1.8fr]">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Loại món
                </label>
                <select
                  value={form.itemType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      itemType: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  disabled={!selectedRestaurantId}
                >
                  {ITEM_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Giá đang bán (basePrice)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    value={form.priceAmount}
                    onChange={handleChange("priceAmount")}
                    placeholder="35000"
                    className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    disabled={!selectedRestaurantId}
                  />
                  <input
                    value={form.priceCurrency}
                    onChange={handleChange("priceCurrency")}
                    className="w-20 rounded-xl border border-gray-200 px-2 py-1.5 text-xs font-mono text-gray-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    disabled={!selectedRestaurantId}
                  />
                </div>
              </div>
            </div>

            {/* compareAtPrice + discountPercent */}
            <div className="grid gap-3 sm:grid-cols-[1.3fr,0.7fr]">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Giá gốc / trước khuyến mãi (compareAtPrice)
                </label>
                <input
                  value={form.compareAtPriceAmount}
                  onChange={handleChange("compareAtPriceAmount")}
                  placeholder="Ví dụ: 45000"
                  className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  disabled={!selectedRestaurantId}
                />
                <p className="text-[10px] text-gray-400">
                  Để trống nếu không có giá gốc (sẽ không hiển thị gạch ngang).
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Giảm giá (%) đơn giản
                </label>
                <input
                  value={form.discountPercent}
                  onChange={handleChange("discountPercent")}
                  placeholder="Ví dụ: 20"
                  className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  disabled={!selectedRestaurantId}
                />
                <p className="text-[10px] text-gray-400">
                  Tùy chọn, dùng để hiển thị badge -20%.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                value={form.description}
                onChange={handleChange("description")}
                rows={2}
                placeholder="Trà đào cam sả mát lạnh..."
                className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                disabled={!selectedRestaurantId}
              />
            </div>

            {/* Tags + cuisines + sort + status */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Tags (phân loại nhỏ)
                </label>
                <input
                  value={form.tags}
                  onChange={handleChange("tags")}
                  placeholder="drink, tea, peach..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  disabled={!selectedRestaurantId}
                />
                <p className="text-[10px] text-gray-400">
                  Cách nhau bằng dấu phẩy.
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Ẩm thực (cuisine)
                </label>
                <input
                  value={form.cuisines}
                  onChange={handleChange("cuisines")}
                  placeholder="vietnamese, korean..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  disabled={!selectedRestaurantId}
                />
                <p className="text-[10px] text-gray-400">
                  Cách nhau bằng dấu phẩy.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Thứ tự hiển thị (sortIndex)
                </label>
                <input
                  value={form.sortIndex}
                  onChange={handleChange("sortIndex")}
                  placeholder="Ví dụ: 5"
                  className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  disabled={!selectedRestaurantId}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Trạng thái
                </label>
                <label className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-1.5 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    checked={form.isAvailable}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isAvailable: e.target.checked,
                      }))
                    }
                    disabled={!selectedRestaurantId}
                  />
                  {form.isAvailable ? "Đang bán" : "Tạm ngưng"}
                </label>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Ảnh món (có thể chọn nhiều)
              </label>
              <div className="space-y-2">
                {/* Ảnh hiện tại (từ server) */}
                {form.existingImages.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[11px] text-gray-500">
                      Ảnh hiện tại (click ✕ để xoá ảnh này khi lưu):
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {form.existingImages.map((path) => (
                        <div
                          key={path}
                          className="relative h-20 overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={path}
                            alt={path}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(path)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-[10px] text-white hover:bg-black/80"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50">
                    <span>📷</span>
                    <span>Chọn ảnh mới</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImagesChange}
                      disabled={!selectedRestaurantId}
                    />
                  </label>
                  {form.images.length > 0 && (
                    <span className="text-[11px] text-emerald-600">
                      Đã chọn {form.images.length} ảnh mới.
                    </span>
                  )}
                </div>

                {/* Preview ảnh mới */}
                {form.imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {form.imagePreviews.map((src, idx) => (
                      <div
                        key={src}
                        className="relative h-20 overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-[10px] text-white hover:bg-black/80"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error + submit */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="max-w-xs text-xs">
                {error && <p className="text-rose-600">Lỗi: {error}</p>}
                {!error && !selectedRestaurantId && (
                  <p className="text-gray-500">
                    Vui lòng chọn một nhà hàng trước khi thêm món.
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loadingSubmit || !selectedRestaurantId}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm ${
                  loadingSubmit || !selectedRestaurantId
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loadingSubmit
                  ? "Đang lưu..."
                  : mode === "create"
                  ? "Thêm món vào menu"
                  : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
