"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { resolveCDN as cdn } from "@/utils/cdn";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://api.food-map.online/api/v1";

// ===== TYPES =====

type OwnerRestaurantApiItem = {
  _id: string;
  name: string;
};

type OwnerRestaurant = {
  _id: string;
  name: string;
};

type OwnerRestaurantsResponse = {
  ownerId: string;
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: OwnerRestaurantApiItem[];
};

type ReviewUser = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  email?: string;
};

type ReviewItem = {
  id: string;
  restaurantId: string;
  content: string;
  images: string[];
  rating: number;
  createdAt: string;
  reply?: string;
  user: ReviewUser | null;
};

type ReviewsResponse = {
  success: boolean;
  message: string;
  data: {
    items: any[];
    total: number;
  };
};

// ===== HELPERS =====

function formatDateTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapApiReview(raw: any): ReviewItem {
  const u = raw.user ?? null;

  const rawImages: string[] = Array.isArray(raw.images) ? raw.images : [];
  const images = rawImages.map((p) => cdn(p));

  const avatarUrl = u?.avatarUrl ? cdn(u.avatarUrl) : null;

  return {
    id: raw._id,
    restaurantId: raw.restaurantId?.toString?.() ?? "",
    content: raw.content ?? "",
    images,
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    createdAt: raw.createdAt ?? "",
    reply: raw.reply ?? undefined,
    user: u
      ? {
          id: u._id?.toString?.() ?? u.id ?? "",
          displayName: u.displayName ?? u.name ?? "Người dùng",
          avatarUrl,
          email: u.email ?? undefined,
        }
      : null,
  };
}

// ===== COMPONENT =====

export default function CommentsTab() {
  const { token } = useAuth();

  const [restaurants, setRestaurants] = useState<OwnerRestaurant[]>([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string>("");

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [kw, setKw] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ===== CALL API: GET OWNER RESTAURANTS =====
  const fetchOwnerRestaurants = async () => {
    if (!token) return;

    try {
      setError(null);

      const res = await axios.get<OwnerRestaurantsResponse>(
        `${API_BASE}/owner/restaurants/get-by-owner`,
        {
          params: {
            page: 1,
            limit: 20,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const apiItems = Array.isArray(res.data.items) ? res.data.items : [];
      const mapped: OwnerRestaurant[] = apiItems.map((r) => ({
        _id: r._id,
        name: r.name ?? "Nhà hàng",
      }));

      setRestaurants(mapped);

      // chọn quán đầu tiên nếu chưa chọn
      if (!currentRestaurantId && mapped[0]?._id) {
        setCurrentRestaurantId(mapped[0]._id);
      }
    } catch (e: any) {
      console.error(
        "[CommentsTab] GET /owner/restaurants/get-by-owner error:",
        e,
      );
      setError("Không tải được danh sách nhà hàng.");
    }
  };

  // ===== CALL API: GET REVIEWS BY RESTAURANT =====
  const fetchReviews = async (restaurantId: string) => {
    if (!token || !restaurantId) return;

    setLoading(true);
    try {
      setError(null);
      const res = await axios.get<ReviewsResponse>(
        `${API_BASE}/restaurants/${restaurantId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const rawItems = Array.isArray(res.data.data?.items)
        ? res.data.data.items
        : [];
      const mapped = rawItems.map(mapApiReview);
      setItems(mapped);
    } catch (e: any) {
      console.error(
        "[CommentsTab] GET /owner/restaurants/:id/reviews error:",
        e,
      );
      setItems([]);
      setError("Không tải được danh sách bình luận.");
    } finally {
      setLoading(false);
    }
  };

  // ===== ACTION APIs (reply + delete) =====

  const deleteReview = async (reviewId: string) => {
    if (!token || !currentRestaurantId) return;

    setActionLoading(true);
    try {
      await axios.delete(
        `${API_BASE}/owner/restaurants/${currentRestaurantId}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (e) {
      console.error("[CommentsTab] DELETE review error:", e);
    } finally {
      setActionLoading(false);
    }
  };

  const replyReview = async (reviewId: string, reply: string) => {
    if (!token || !currentRestaurantId) return;

    setActionLoading(true);
    try {
      await axios.patch(
        `${API_BASE}/owner/restaurants/${currentRestaurantId}/reviews/${reviewId}/reply`,
        { reply },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (e) {
      console.error("[CommentsTab] PATCH reply error:", e);
    } finally {
      setActionLoading(false);
    }
  };

  // ===== EFFECTS =====

  // load list nhà hàng của owner
  useEffect(() => {
    if (!token) return;
    fetchOwnerRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // khi đã có restaurantId → load reviews
  useEffect(() => {
    if (!token || !currentRestaurantId) return;
    fetchReviews(currentRestaurantId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentRestaurantId]);

  const filtered = useMemo(() => {
    const q = kw.trim().toLowerCase();
    if (!q) return items;

    return items.filter((c) => {
      const name = c.user?.displayName?.toLowerCase() ?? "";
      const text = c.content?.toLowerCase() ?? "";
      return name.includes(q) || text.includes(q);
    });
  }, [items, kw]);

  // ===== HANDLERS =====

  const onDelete = async (id: string) => {
    if (!confirm("Xoá bình luận này?")) return;
    await deleteReview(id);
    await fetchReviews(currentRestaurantId);
  };

  const onReply = async (id: string) => {
    const content = prompt("Nhập nội dung phản hồi:");
    if (content && content.trim()) {
      await replyReview(id, content.trim());
      await fetchReviews(currentRestaurantId);
    }
  };

  // ===== RENDER =====

  const currentRestaurantName =
    restaurants.find((r) => r._id === currentRestaurantId)?.name ||
    "Nhà hàng";

  return (
    <div className="space-y-4">
      {/* Header + chọn nhà hàng + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Bình luận</h1>
          <p className="text-sm text-gray-500">
            Xem & phản hồi đánh giá của khách hàng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {restaurants.length > 1 && (
            <select
              className="input h-10"
              value={currentRestaurantId}
              onChange={(e) => setCurrentRestaurantId(e.target.value)}
            >
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

          <input
            className="input h-10 w-64"
            placeholder="Tìm theo tên hoặc nội dung…"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Đang xem bình luận của:{" "}
        <span className="font-semibold text-gray-800">
          {currentRestaurantName}
        </span>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
                  <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-gray-500">
          Chưa có bình luận nào.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const userName = c.user?.displayName || "Người dùng";
            const avatar =
              c.user?.avatarUrl || "https://i.pravatar.cc/64?img=1";
            const fullStars = Math.max(0, Math.min(5, c.rating ?? 0));
            const emptyStars = Math.max(0, 5 - fullStars);

            return (
              <div
                key={c.id}
                className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={avatar}
                    alt={userName}
                    className="w-10 h-10 rounded-full border object-cover"
                  />

                  <div className="flex-1">
                    {/* header: user + time */}
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="font-medium">{userName}</div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(c.createdAt)}
                      </div>
                    </div>

                    {/* rating */}
                    <div className="text-amber-500 my-1 text-sm">
                      <span className="text-amber-500">
                        {"★".repeat(fullStars)}
                      </span>
                      <span className="text-gray-300">
                        {"★".repeat(emptyStars)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {c.rating}/5
                      </span>
                    </div>

                    {/* content */}
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {c.content}
                    </p>

                    {/* images */}
                    {Array.isArray(c.images) && c.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {c.images.map((img, idx) => (
                          <button
                            key={`${c.id}-img-${idx}`}
                            type="button"
                            className="group relative h-16 w-16 overflow-hidden rounded-md border bg-gray-50"
                            onClick={() => window.open(img, "_blank")}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={`Review image ${idx + 1}`}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* reply */}
                    {c.reply && (
                      <div className="mt-2 rounded-xl bg-gray-50 border p-2">
                        <div className="text-xs text-gray-500 mb-1">
                          Phản hồi của cửa hàng
                        </div>
                        <div className="text-sm text-gray-800">
                          {c.reply}
                        </div>
                      </div>
                    )}

                    {/* actions: chỉ reply + xoá (không duyệt/ẩn) */}
                    {/* <div className="flex items-center gap-2 mt-3">
                      <button
                        disabled={actionLoading}
                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => onReply(c.id)}
                      >
                        Phản hồi
                      </button>

                      <button
                        disabled={actionLoading}
                        className="rounded-lg bg-rose-600 text-white px-3 py-1.5 text-sm hover:bg-rose-700 disabled:opacity-50"
                        onClick={() => onDelete(c.id)}
                      >
                        Xoá
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
