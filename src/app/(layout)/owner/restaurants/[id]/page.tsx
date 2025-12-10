import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://api.food-map.online/api/v1";

type OpeningHourPeriod = {
  opens?: string;
  closes?: string;
};

type OpeningHour = {
  day: string;
  closed?: boolean;
  is24h?: boolean;
  periods?: OpeningHourPeriod[];
};

type RestaurantAddress = {
  country?: string;
  city?: string;
  district?: string;
  ward?: string;
  street?: string;
  locationType?: string;
  coordinates?: [number, number]; // [lng, lat]
};

type GallerySigned = {
  path: string;
  url: string | null;
};

type RestaurantDetail = {
  _id: string;
  ownerId?: string;
  categoryId?: string;
  name: string;
  slug?: string;
  priceRange?: string;
  isActive?: boolean;
  rating?: number;
  totalReviews?: number;

  address: RestaurantAddress;
  openingHours?: OpeningHour[];

  logoUrl?: string;
  logoUrlSigned?: string | null;
  coverImageUrl?: string;
  coverImageUrlSigned?: string | null;
  gallery?: string[];
  gallerySigned?: GallerySigned[];

  searchTerms?: string[];

  createdAt?: string;
  updatedAt?: string;
};

async function fetchRestaurant(id: string): Promise<RestaurantDetail | null> {
  const token = cookies().get("accessToken")?.value;

  const res = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/owner/restaurants/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch restaurant detail", res.status, await res.text());
    return null;
  }

  const json = await res.json();
  const data = json?.data ?? json;
  return data as RestaurantDetail;
}

export default async function OwnerRestaurantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const restaurant = await fetchRestaurant(params.id);

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-6 text-sm text-rose-700">
          Không tải được thông tin nhà hàng. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  const fullAddress = [
    restaurant.address?.street,
    restaurant.address?.ward,
    restaurant.address?.district,
    restaurant.address?.city,
    restaurant.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const coverSrc =
    restaurant.coverImageUrlSigned ??
    restaurant.coverImageUrl ??
    restaurant.logoUrlSigned ??
    restaurant.logoUrl ??
    "https://placehold.co/1200x400?text=Restaurant+Cover";

  const logoSrc =
    restaurant.logoUrlSigned ??
    restaurant.logoUrl ??
    "https://placehold.co/160x160?text=Logo";

  const galleryImages =
    (restaurant.gallerySigned
      ?.map((g) => g.url)
      .filter(Boolean) as string[] | undefined) ??
    restaurant.gallery ??
    [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:py-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 p-[1px]">
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white/95 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {restaurant.name}
              </h1>
              <p className="mt-1 text-xs text-gray-600">
                ID:{" "}
                <span className="font-mono text-[11px]">
                  {restaurant._id}
                </span>
              </p>
              {fullAddress && (
                <p className="mt-1 text-xs text-gray-600">{fullAddress}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 font-medium ${
                restaurant.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-gray-100 text-gray-600"
              }`}
            >
              {restaurant.isActive ? "Đang hiển thị" : "Tạm ẩn"}
            </span>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              {restaurant.slug && (
                <span>
                  Slug:{" "}
                  <span className="font-mono">{restaurant.slug}</span>
                </span>
              )}
              {restaurant.priceRange && (
                <span>Khoảng giá: {restaurant.priceRange}</span>
              )}
              {typeof restaurant.rating === "number" && (
                <span>
                  Rating:{" "}
                  <span className="font-semibold">
                    {restaurant.rating.toFixed
                      ? restaurant.rating.toFixed(1)
                      : restaurant.rating}
                  </span>
                  {typeof restaurant.totalReviews === "number" && (
                    <> · {restaurant.totalReviews} đánh giá</>
                  )}
                </span>
              )}
            </div>

            <div className="text-[11px] text-gray-400">
              <p>
                Tạo:{" "}
                {restaurant.createdAt
                  ? new Date(restaurant.createdAt).toLocaleString("vi-VN")
                  : "-"}
              </p>
              <p>
                Cập nhật:{" "}
                {restaurant.updatedAt
                  ? new Date(restaurant.updatedAt).toLocaleString("vi-VN")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COVER + INFO */}
      <div className="grid gap-4 lg:grid-cols-[2.2fr,1.8fr]">
        {/* Cover */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverSrc}
            alt={restaurant.name}
            className="h-56 w-full object-cover"
          />
        </div>

        {/* System & address */}
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-xs">
          <div>
            <p className="text-xs font-semibold text-gray-800">
              Thông tin hệ thống
            </p>
            <div className="mt-1 space-y-0.5 text-gray-700">
              <p>
                Owner ID:{" "}
                <span className="font-mono">
                  {restaurant.ownerId || "—"}
                </span>
              </p>
              <p>
                Category ID:{" "}
                <span className="font-mono">
                  {restaurant.categoryId || "—"}
                </span>
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div>
            <p className="text-xs font-semibold text-gray-800">
              Địa chỉ chi tiết
            </p>
            <div className="mt-1 space-y-0.5 text-gray-700">
              <p>{restaurant.address?.street || "—"}</p>
              <p>
                {[restaurant.address?.ward, restaurant.address?.district]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
              <p>
                {[restaurant.address?.city, restaurant.address?.country]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
              {restaurant.address?.coordinates &&
                typeof restaurant.address.coordinates[0] === "number" &&
                typeof restaurant.address.coordinates[1] === "number" && (
                  <p className="mt-1 font-mono text-[11px] text-gray-600">
                    lng: {restaurant.address.coordinates[0].toFixed(6)} · lat:{" "}
                    {restaurant.address.coordinates[1].toFixed(6)}
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* OPENING HOURS + GALLERY */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr,2.4fr]">
        {/* Opening hours & search terms */}
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-xs">
          <p className="text-xs font-semibold text-gray-800">Giờ mở cửa</p>
          {restaurant.openingHours && restaurant.openingHours.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {restaurant.openingHours.map((oh) => (
                <li
                  key={oh.day}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">{oh.day}</span>
                  {oh.closed ? (
                    <span className="text-[11px] text-gray-400">
                      Đóng cửa
                    </span>
                  ) : oh.is24h ? (
                    <span className="text-[11px] text-gray-600">
                      Mở 24h
                    </span>
                  ) : oh.periods && oh.periods.length > 0 ? (
                    <span className="text-[11px] text-gray-600">
                      {oh.periods
                        .map(
                          (p) => `${p.opens ?? "?"} – ${p.closes ?? "?"}`,
                        )
                        .join(", ")}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">
                      Không rõ
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[11px] text-gray-500">
              Chưa cấu hình giờ mở cửa.
            </p>
          )}

          {Array.isArray(restaurant.searchTerms) &&
            restaurant.searchTerms.length > 0 && (
              <>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    Từ khóa tìm kiếm
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {restaurant.searchTerms.slice(0, 20).map((term) => (
                      <span
                        key={term}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
                      >
                        #{term}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
        </div>

        {/* Gallery */}
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-800">
            Bộ sưu tập ảnh
          </p>
          {galleryImages.length === 0 ? (
            <p className="mt-1 text-xs text-gray-500">
              Chưa có bộ sưu tập ảnh cho quán này.
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {galleryImages.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="relative h-24 overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src || "https://placehold.co/300x200?text=Image"}
                    alt={`Gallery ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
