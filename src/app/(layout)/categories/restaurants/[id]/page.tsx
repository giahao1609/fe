"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import RestaurantHeader from "@/components/restaurant/RestaurantHeader";
import RestaurantInfo from "@/components/restaurant/RestaurantInfo";
import RestaurantGallery from "@/components/restaurant/RestaurantGallery";
import RestaurantReviews from "@/components/restaurant/RestaurantReviews";
import RestaurantLightbox from "@/components/restaurant/RestaurantLightbox";

import { mockRestaurants } from "@/data/mock-restaurants";
import { mockReviews } from "@/data/mock-reviews";

// ========= helpers =========
const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();

export default function RestaurantDetailPage() {
  const { id: idOrSlug } = useParams<{ id: string }>();

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const GCS_URL = process.env.NEXT_PUBLIC_GCS_URL || ""; // vd: https://storage.googleapis.com/foodmap-secure
  const USE_FAKE = process.env.NEXT_PUBLIC_USE_FAKE_DATA === "1";

  const [restaurant, setRestaurant] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chế độ fake: tìm theo _id hoặc slug từ tên
  const fakeRestaurant = useMemo(() => {
    if (!USE_FAKE) return null;
    const foundById = mockRestaurants.find((r) => r._id === idOrSlug);
    if (foundById) return foundById;

    const foundBySlug = mockRestaurants.find((r) => slugify(r.name) === idOrSlug);
    return foundBySlug || null;
  }, [USE_FAKE, idOrSlug]);

  const fakeReviewsForRestaurant = useMemo(() => {
    if (!USE_FAKE || !fakeRestaurant) return [];
    return (mockReviews || []).filter(
      (rv) => rv.restaurantId === fakeRestaurant._id
    );
  }, [USE_FAKE, fakeRestaurant]);

  // 1) Load dữ liệu restaurant + reviews
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        if (USE_FAKE) {
          if (!fakeRestaurant) {
            setRestaurant(null);
            setReviews([]);
          } else {
            setRestaurant(fakeRestaurant);
            setReviews(fakeReviewsForRestaurant);
          }
        } else {
          // Backend thật: hỗ trợ id hoặc slug (backend của bạn cần hỗ trợ endpoint theo cách này)
          const [r, rv] = await Promise.all([
            axios.get(`${API_URL}/restaurants/${idOrSlug}`),
            axios.get(`${API_URL}/review/restaurant/${idOrSlug}`),
          ]);

          // Tùy response thực tế (res.data hoặc res.data.data)
          const dataRestaurant = r.data?.data ?? r.data;
          const dataReviews = rv.data?.data ?? rv.data;

          setRestaurant(dataRestaurant || null);
          setReviews(Array.isArray(dataReviews) ? dataReviews : []);
        }
      } catch (e: any) {
        setError("Không thể tải dữ liệu quán ăn.");
        setRestaurant(null);
        setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (idOrSlug) load();
    return () => {
      mounted = false;
    };
  }, [idOrSlug, API_URL, USE_FAKE, fakeRestaurant, fakeReviewsForRestaurant]);

  // 2) Làm mới signed URL cho ảnh private (chỉ khi KHÔNG fake)
  useEffect(() => {
    if (USE_FAKE) return; // bỏ qua khi fake
    if (!restaurant && reviews.length === 0) return;

    const refresh = async () => {
      const urls: Record<string, string> = {};
      const paths: string[] = [];

      // Gom ảnh của quán
      if (restaurant) {
        const banners = Array.isArray(restaurant.banner)
          ? restaurant.banner
          : [restaurant.banner].filter(Boolean);

        paths.push(
          ...banners,
          ...(restaurant.gallery || []),
          ...(restaurant.menuImages || [])
        );
      }

      // Gom ảnh review
      for (const rv of reviews) {
        if (Array.isArray(rv.images)) paths.push(...rv.images);
        else if (rv.image) paths.push(rv.image);
      }

      // Refresh từng path nếu là key (không phải URL)
      for (const path of paths) {
        if (!path) continue;

        // nếu đã là http(s) thì bỏ qua
        if (/^https?:\/\//i.test(path)) continue;

        // Nếu path có prefix GCS_URL → cắt thành key
        let clean = path.trim();
        if (GCS_URL && clean.startsWith(GCS_URL)) {
          clean = clean.replace(`${GCS_URL}/`, "");
        }

        try {
          const { data } = await axios.get(
            `${API_URL}/restaurants/refresh-link/${encodeURIComponent(clean)}`
          );
          if (data?.url) urls[clean] = data.url;
        } catch {
          // im lặng để không phá UI
        }
      }

      setSignedUrls(urls);
    };

    refresh();
  }, [restaurant, reviews, API_URL, GCS_URL, USE_FAKE]);

  // 3) Lấy URL ảnh: ưu tiên http/s, tiếp theo signed cache, cuối cùng ghép từ GCS_URL
  const getImageUrl = (path?: string) => {
    if (!path) return "";

    const p = path.trim();
    if (/^https?:\/\//i.test(p)) return p; // đã là URL tuyệt đối

    // có signed URL sẵn
    if (signedUrls[p]) return signedUrls[p];

    // nếu dùng fake: coi banner luôn là URL; phòng hờ nếu ai đó truyền key
    if (USE_FAKE) return p;

    // GCS
    if (GCS_URL) return `${GCS_URL}/${p}`;
    return p; // fallback cuối
  };

  // 4) UI states
  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600" suppressHydrationWarning>
        ⏳ Đang tải...
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="p-10 text-center" suppressHydrationWarning>
        {error || "Không thể tải thông tin quán ăn."}
        <Link href="/categories/restaurants" className="text-blue-600 underline block mt-3">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <RestaurantHeader restaurant={restaurant} getImageUrl={getImageUrl} />

      <RestaurantInfo restaurant={restaurant} />

      <div className="max-w-5xl mx-auto mt-8 space-y-8 p-4">
        {/* Giới thiệu */}
        {restaurant.description && (
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">Giới thiệu</h2>
            <p className="text-gray-700 whitespace-pre-line">{restaurant.description}</p>
          </section>
        )}

        {/* Bộ sưu tập ảnh */}
        {Array.isArray(restaurant.gallery) && restaurant.gallery.length > 0 && (
          <RestaurantGallery
            title="Hình ảnh quán"
            images={restaurant.gallery}
            getImageUrl={getImageUrl}
            onPreview={setPreviewImage}
          />
        )}

        {/* Ảnh menu */}
        {Array.isArray(restaurant.menuImages) && restaurant.menuImages.length > 0 && (
          <RestaurantGallery
            title="Thực đơn"
            images={restaurant.menuImages}
            getImageUrl={getImageUrl}
            onPreview={setPreviewImage}
          />
        )}

        {/* Review */}
        <RestaurantReviews
          id={typeof restaurant._id === "string" ? restaurant._id : String(restaurant._id)}
          API_URL={API_URL}
          reviews={reviews}
          setReviews={setReviews}
          getImageUrl={getImageUrl}
          // Nếu bạn cần chặn gửi review khi fake thì có thể truyền cờ xuống component
          // isReadOnly={USE_FAKE}
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
