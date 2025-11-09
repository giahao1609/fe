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

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const GCS_URL = process.env.NEXT_PUBLIC_GCS_URL;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  //  Load dữ liệu nhà hàng + review
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, rv] = await Promise.all([
          axios.get(`${API_URL}/restaurants/${id}`),
          axios.get(`${API_URL}/review/restaurant/${id}`),
        ]);
        setRestaurant(r.data);
        setReviews(rv.data);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, API_URL]);

  //  Làm mới signed URL cho ảnh private (banner, gallery, menu, review)
  useEffect(() => {
    if (!restaurant && reviews.length === 0) return;

    const refresh = async () => {
      const urls: Record<string, string> = {};
      const paths: string[] = [];

      //  Gom ảnh của quán
      if (restaurant) {
        paths.push(
          ...(Array.isArray(restaurant.banner)
            ? restaurant.banner
            : [restaurant.banner].filter(Boolean)),
          ...(restaurant.gallery || []),
          ...(restaurant.menuImages || [])
        );
      }

      //  Gom thêm ảnh từ review
      reviews.forEach((rv) => {
        if (Array.isArray(rv.images)) paths.push(...rv.images);
        else if (rv.image) paths.push(rv.image);
      });

      //  Làm mới từng path
      for (const path of paths) {
        if (!path) continue;
        let clean = path.replace(`${GCS_URL}/`, "").trim();

        try {
          const { data } = await axios.get(
            `${API_URL}/restaurants/refresh-link/${encodeURIComponent(clean)}`
          );
          if (data?.url) urls[clean] = data.url;
        } catch (err) {
          console.warn(" Không thể làm mới link:", err);
        }
      }

      setSignedUrls(urls);
    };

    refresh();
  }, [restaurant, reviews, API_URL, GCS_URL]);

  //  Hàm lấy ảnh từ GCS (ưu tiên signed URL)
  const getImageUrl = (path?: string) => {
    if (!path) return "";
    const clean = path.trim();

    //  Nếu đã là URL signed → dùng luôn
    if (clean.startsWith("http")) return clean;

    //  Nếu có signed URL cache
    if (signedUrls[clean]) return signedUrls[clean];

    //  Nếu là đường dẫn trong bucket
    return `${GCS_URL}/${clean}`;
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600" suppressHydrationWarning>
        ⏳ Đang tải...
      </div>
    );

  //  Không có dữ liệu
  if (!restaurant)
    return (
      <div className="p-10 text-center" suppressHydrationWarning>
         Không thể tải thông tin quán ăn.
        <Link
          href="/categories/restaurants"
          className="text-blue-600 underline block mt-3"
        >
          ← Quay lại danh sách
        </Link>
      </div>
    );

  const banner =
    Array.isArray(restaurant.banner) && restaurant.banner.length > 0
      ? restaurant.banner[0]
      : restaurant.banner;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header (banner chính có priority để tối ưu LCP) */}
      <RestaurantHeader restaurant={restaurant} getImageUrl={getImageUrl} />

      {/* Thông tin quán */}
      <RestaurantInfo restaurant={restaurant} />

      <div className="max-w-5xl mx-auto mt-8 space-y-8 p-4">
        {/* Giới thiệu */}
        {restaurant.description && (
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-3 border-b pb-2">
               Giới thiệu
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {restaurant.description}
            </p>
          </section>
        )}

        {/* Bộ sưu tập ảnh */}
        {restaurant.gallery?.length > 0 && (
          <RestaurantGallery
            title=" Hình ảnh quán"
            images={restaurant.gallery}
            getImageUrl={getImageUrl}
            onPreview={setPreviewImage}
          />
        )}

        {/* Ảnh menu */}
        {restaurant.menuImages?.length > 0 && (
          <RestaurantGallery
            title=" Thực đơn"
            images={restaurant.menuImages}
            getImageUrl={getImageUrl}
            onPreview={setPreviewImage}
          />
        )}

        {/* Review */}
        <RestaurantReviews
          id={id}
          API_URL={API_URL}
          reviews={reviews}
          setReviews={setReviews}
          getImageUrl={getImageUrl} // Thêm dòng này để ảnh review dùng chung logic ảnh
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
