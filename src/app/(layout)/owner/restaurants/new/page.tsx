"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  RestaurantService,
  type RestaurantAddress,
  type OpeningHour,
} from "@/services/restaurant.service";

const DAY_CONFIG = [
  { key: "Mon", label: "Thứ 2" },
  { key: "Tue", label: "Thứ 3" },
  { key: "Wed", label: "Thứ 4" },
  { key: "Thu", label: "Thứ 5" },
  { key: "Fri", label: "Thứ 6" },
  { key: "Sat", label: "Thứ 7" },
  { key: "Sun", label: "Chủ nhật" },
];

const PRICE_OPTIONS = ["$", "$$", "$$$"];

export default function CreateRestaurantPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceRange, setPriceRange] = useState<"$" | "$$" | "$$$">("$$");

  const [address, setAddress] = useState<{
    country: string;
    city: string;
    district: string;
    ward: string;
    street: string;
    lat: string;
    lng: string;
  }>({
    country: "VN",
    city: "Ho Chi Minh",
    district: "",
    ward: "",
    street: "",
    lat: "",
    lng: "",
  });

  const [openingHours, setOpeningHours] = useState(
    DAY_CONFIG.map((d) => ({
      day: d.key,
      enabled: d.key !== "Sun",
      opens: "08:00",
      closes: "22:00",
    }))
  );

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formMessage, setFormMessage] = useState("");

  // nếu chưa login → đá về /auth
  useEffect(() => {
    if (!user) {
      router.replace("/auth");
    }
  }, [user, router]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGalleryFiles(files);
  };

  const handleDayToggle = (idx: number) => {
    setOpeningHours((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, enabled: !it.enabled } : it
      )
    );
  };

  const handleTimeChange = (
    idx: number,
    field: "opens" | "closes",
    value: string
  ) => {
    setOpeningHours((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, [field]: value } : it
      )
    );
  };

  const buildAddressPayload = (): RestaurantAddress => {
    const lng = parseFloat(address.lng);
    const lat = parseFloat(address.lat);
    return {
      country: address.country || "VN",
      city: address.city,
      district: address.district,
      ward: address.ward,
      street: address.street,
      locationType: "Point",
      coordinates: [
        Number.isFinite(lng) ? lng : 0,
        Number.isFinite(lat) ? lat : 0,
      ],
    };
  };

  const buildOpeningHoursPayload = (): OpeningHour[] => {
    return openingHours
      .filter((d) => d.enabled)
      .map((d) => {
        const is24h =
          d.opens === "00:00" &&
          (d.closes === "23:59" || d.closes === "24:00");
        return {
          day: d.day,
          periods: [{ opens: d.opens, closes: d.closes }],
          closed: false,
          is24h,
        };
      });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormMessage("");

    if (!name.trim()) {
      setFormMessage("Vui lòng nhập tên nhà hàng.");
      return;
    }
    if (!categoryId.trim()) {
      setFormMessage("Vui lòng nhập Category ID.");
      return;
    }
    if (!address.street.trim() || !address.city.trim()) {
      setFormMessage("Vui lòng nhập đầy đủ địa chỉ.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        categoryId: categoryId.trim(),
        priceRange,
        address: buildAddressPayload(),
        openingHours: buildOpeningHoursPayload(),
        logo: logoFile,
        cover: coverFile,
        gallery: galleryFiles,
      };

      const restaurant = await RestaurantService.create(payload);

      setFormMessage("Tạo nhà hàng thành công! Đang chuyển về trang chủ...");
      // bạn có thể đổi thành /owner/restaurants sau khi có trang list
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      const raw = err?.message || "";
      if (raw) setFormMessage(raw);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-rose-50 via-white to-amber-50 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Đăng quán mới
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Thêm nhà hàng của bạn lên FoodTour – quản lý nhiều chi nhánh, ưu
              đãi, menu và hơn thế nữa.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-xs text-gray-600 shadow-sm">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              🍽️
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-800">
                Tạo nhiều nhà hàng
              </span>
              <span>Hỗ trợ nhiều thương hiệu / chi nhánh</span>
            </div>
          </div>
        </div>

        {/* Main form layout */}
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]"
        >
          {/* Left: basic info + address + hours */}
          <div className="space-y-6 rounded-3xl border border-rose-100 bg-white/90 p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">
              Thông tin cơ bản
            </h2>

            <div className="space-y-4">
              {/* Tên + category */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-800">
                    Tên nhà hàng
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="vd: Bún Bò Huế Mẹ Nấu"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Category ID
                  </label>
                  <input
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="vd: 6733f1a0c9b7c8..."
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    required
                  />
                </div>
              </div>

              {/* Price range */}
              <div>
                <label className="text-sm font-medium text-gray-800">
                  Mức giá tham khảo
                </label>
                <div className="mt-2 flex gap-2">
                  {PRICE_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriceRange(p as "$" | "$$" | "$$$")}
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        priceRange === p
                          ? "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-rose-200"
                      }`}
                    >
                      {p === "$" && "Bình dân"}
                      {p === "$$" && "Trung bình"}
                      {p === "$$$" && "Cao cấp"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="mt-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">
                Địa chỉ
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-800">
                    Đường / số nhà
                  </label>
                  <input
                    value={address.street}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                    }
                    placeholder="123 Lê Lợi"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Phường
                  </label>
                  <input
                    value={address.ward}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, ward: e.target.value }))
                    }
                    placeholder="Bến Nghé"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Quận / Huyện
                  </label>
                  <input
                    value={address.district}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        district: e.target.value,
                      }))
                    }
                    placeholder="1"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Thành phố
                  </label>
                  <input
                    value={address.city}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Ho Chi Minh"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Quốc gia
                  </label>
                  <input
                    value={address.country}
                    onChange={(e) =>
                      setAddress((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="VN"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                  <div>
                    <label className="text-xs font-medium text-gray-800">
                      Kinh độ (lng)
                    </label>
                    <input
                      value={address.lng}
                      onChange={(e) =>
                        setAddress((prev) => ({ ...prev, lng: e.target.value }))
                      }
                      placeholder="106.70098"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-800">
                      Vĩ độ (lat)
                    </label>
                    <input
                      value={address.lat}
                      onChange={(e) =>
                        setAddress((prev) => ({ ...prev, lat: e.target.value }))
                      }
                      placeholder="10.77653"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Opening hours */}
            <div className="mt-6 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">
                Giờ mở cửa
              </h2>
              <p className="text-xs text-gray-500">
                Mặc định mở từ 08:00 - 22:00. Bạn có thể tắt ngày không phục vụ.
              </p>

              <div className="space-y-2 rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                {openingHours.map((d, idx) => (
                  <div
                    key={d.day}
                    className="flex flex-col items-start gap-2 rounded-xl bg-white px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDayToggle(idx)}
                        className={`h-5 w-9 rounded-full border transition ${
                          d.enabled
                            ? "border-emerald-400 bg-emerald-400"
                            : "border-gray-300 bg-gray-200"
                        }`}
                      >
                        <span
                          className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                            d.enabled ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span className="font-medium text-gray-800">
                        {
                          DAY_CONFIG.find((x) => x.key === d.day)?.label ??
                          d.day
                        }
                      </span>
                    </div>

                    {d.enabled ? (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <input
                          type="time"
                          value={d.opens}
                          onChange={(e) =>
                            handleTimeChange(idx, "opens", e.target.value)
                          }
                          className="rounded-lg border border-gray-200 px-2 py-1 outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100"
                        />
                        <span className="text-gray-500">–</span>
                        <input
                          type="time"
                          value={d.closes}
                          onChange={(e) =>
                            handleTimeChange(idx, "closes", e.target.value)
                          }
                          className="rounded-lg border border-gray-200 px-2 py-1 outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100"
                        />
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-gray-400">
                        Nghỉ
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: media uploads */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-rose-100 bg-white/90 p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">
                Hình ảnh
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Logo hiển thị trong danh sách; ảnh bìa là banner lớn trên trang
                quán.
              </p>

              <div className="mt-4 space-y-4">
                {/* Logo */}
                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Logo
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                      {logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          1:1
                        </div>
                      )}
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:border-rose-300 hover:text-rose-700">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                      <span>Chọn logo</span>
                    </label>
                  </div>
                </div>

                {/* Cover */}
                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Ảnh bìa
                  </label>
                  <div className="mt-2">
                    <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                      {coverPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          16:9
                        </div>
                      )}
                    </div>
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:border-rose-300 hover:text-rose-700">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                      <span>Chọn ảnh bìa</span>
                    </label>
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <label className="text-sm font-medium text-gray-800">
                    Bộ sưu tập (tuỳ chọn)
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Ảnh món ăn, không gian, góc đẹp… (có thể chọn nhiều ảnh).
                  </p>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:border-rose-300 hover:text-rose-700">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryChange}
                    />
                    <span>Chọn ảnh</span>
                    {galleryFiles.length > 0 && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                        {galleryFiles.length} ảnh
                      </span>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Hoàn tất
              </h2>
              <p className="mt-1 text-xs text-emerald-800/80">
                Bạn có thể tạo nhiều nhà hàng sau khi lưu – mỗi nhà hàng sẽ có
                trang chi tiết riêng.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang tạo nhà hàng..." : "Lưu & Đăng quán"}
              </button>

              {formMessage && (
                <p className="mt-3 text-xs text-gray-700">{formMessage}</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
