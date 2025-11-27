"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import RestaurantHeader from "@/components/restaurant/RestaurantHeader";
import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import RestaurantGallery from "@/components/restaurant/RestaurantGallery";
import RestaurantReviews from "@/components/restaurant/RestaurantReviews";
import RestaurantLightbox from "@/components/restaurant/RestaurantLightbox";

import {
  RestaurantService,
  type Restaurant,
} from "@/services/restaurant.service";
import {
  MenuService,
  type MenuItem,
} from "@/services/menu.service";

/** helper: hiện tại backend detail đã trả sẵn signed URL
 *  nên hàm này chủ yếu để phòng hờ, nếu sau này có path "thô"
 */
const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  const p = path.toString().trim();
  if (!p) return "";
  // đã là URL tuyệt đối
  if (/^https?:\/\//i.test(p)) return p;
  // fallback (nếu backend trả key GCS thì lúc khác xử lý thêm)
  return p;
};

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);

  // ==== Load restaurant detail + menu + reviews ====
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadRestaurant = async () => {
      setLoadingRestaurant(true);
      setError(null);
      try {
        // GET /owner/restaurants/detail/:id
        const data = await RestaurantService.getRestaurantDetail(id);
        if (!cancelled) setRestaurant(data);
      } catch (e: any) {
        console.error("[RestaurantDetail] load restaurant error:", e);
        if (!cancelled) {
          setError("Không thể tải thông tin nhà hàng.");
          setRestaurant(null);
        }
      } finally {
        if (!cancelled) setLoadingRestaurant(false);
      }
    };

    const loadMenu = async () => {
      setLoadingMenu(true);
      setMenuError(null);
      try {
        // GET /owner/restaurants/:id/menu-items (từ MenuService)
        const res = await MenuService.listByRestaurant(id);
        const list = Array.isArray(res) ? res : (res as any)?.items ?? [];
        if (!cancelled) setMenuItems(list);
      } catch (e: any) {
        console.error("[RestaurantDetail] load menu error:", e);
        if (!cancelled) {
          setMenuError("Không thể tải thực đơn.");
          setMenuItems([]);
        }
      } finally {
        if (!cancelled) setLoadingMenu(false);
      }
    };

    const loadReviews = async () => {
      if (!API_URL) return;
      try {
        const rv = await axios.get(`${API_URL}/review/restaurant/${id}`);
        const dataReviews = rv.data?.data ?? rv.data;
        if (!cancelled) {
          setReviews(Array.isArray(dataReviews) ? dataReviews : []);
        }
      } catch (e) {
        console.warn("[RestaurantDetail] load reviews error:", e);
        if (!cancelled) setReviews([]);
      }
    };

    loadRestaurant();
    loadMenu();
    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [id, API_URL]);

  // ==== State UI ====
  if (loadingRestaurant) {
    return (
      <div className="p-10 text-center text-gray-600">
        ⏳ Đang tải thông tin nhà hàng...
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 mb-3">
          {error || "Không tìm thấy nhà hàng."}
        </p>
        <Link href="/categories/restaurants" className="text-blue-600 underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  // Ưu tiên gallerySigned, fallback gallery thường
  const galleryImages =
    (restaurant.gallerySigned && restaurant.gallerySigned.length > 0
      ? restaurant.gallerySigned
      : restaurant.gallery) ?? [];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner + overlay */}
      <RestaurantHeader restaurant={restaurant} getImageUrl={getImageUrl} />

      {/* Card info dưới banner */}
      <RestaurantInfo restaurant={restaurant} />

      <div className="max-w-5xl mx-auto mt-8 space-y-8 p-4">
        {/* Giới thiệu (lấy từ metaDescription nếu có) */}
        {(restaurant.metaDescription || restaurant.metaTitle) && (
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">
              Giới thiệu
            </h2>
            {restaurant.metaTitle && (
              <p className="text-base font-semibold text-gray-900 mb-1">
                {restaurant.metaTitle}
              </p>
            )}
            {restaurant.metaDescription && (
              <p className="text-gray-700 whitespace-pre-line">
                {restaurant.metaDescription}
              </p>
            )}
            {!restaurant.metaTitle && !restaurant.metaDescription && (
              <p className="text-gray-500 text-sm">
                Nhà hàng chưa có nội dung giới thiệu chi tiết.
              </p>
            )}
          </section>
        )}

        {/* Thực đơn (menu items) */}
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-xl font-semibold border-b pb-2 flex-1">
              Thực đơn
            </h2>
            {loadingMenu && (
              <span className="text-xs text-gray-500">Đang tải...</span>
            )}
          </div>

          {menuError && (
            <p className="text-sm text-red-500 mb-2">{menuError}</p>
          )}

          {!loadingMenu && menuItems.length === 0 && !menuError && (
            <p className="text-sm text-gray-500">
              Nhà hàng chưa có món nào trong hệ thống.
            </p>
          )}

          {!loadingMenu && menuItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menuItems.map((item) => {
                const rawImg =
                  (item as any).imagesSigned?.[0] ??
                  (item as any).images?.[0];

                const price =
                  item.basePrice?.amount != null
                    ? `${item.basePrice.amount.toLocaleString("vi-VN")} ${
                        item.basePrice.currency || "VND"
                      }`
                    : "-";

                return (
                  <div
                    key={item._id}
                    className="flex gap-3 rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md transition"
                  >
                    {rawImg && (
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(rawImg)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.name}
                        </h3>
                        <span className="text-xs font-mono text-gray-700">
                          {price}
                        </span>
                      </div>

                      {item.description && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.itemType && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                            {item.itemType}
                          </span>
                        )}
                        {item.isAvailable === false && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                            Tạm ngưng
                          </span>
                        )}
                        {Array.isArray(item.tags) &&
                          item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bộ sưu tập ảnh (lấy gallerySigned) */}
        {galleryImages.length > 0 && (
          <RestaurantGallery
            title="Hình ảnh quán"
            images={galleryImages}
            getImageUrl={getImageUrl}
            onPreview={setPreviewImage}
          />
        )}

        {/* Review */}
        <RestaurantReviews
          id={restaurant._id}
          API_URL={API_URL}
          reviews={reviews}
          setReviews={setReviews}
          getImageUrl={getImageUrl}
        />
      </div>

      {/* Lightbox xem ảnh */}
      <RestaurantLightbox
        previewImage={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}
