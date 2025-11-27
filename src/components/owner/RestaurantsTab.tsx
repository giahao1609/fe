"use client";

import { useEffect, useRef, useState, DragEvent, useMemo } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  RestaurantService,
  CreateRestaurantPayload,
  Restaurant,
} from "@/services/restaurant.service";
import {
  CategoryService,
  type Category,
} from "@/services/category.service";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

const DAY_ITEMS = [
  { value: "Mon", label: "Thứ 2" },
  { value: "Tue", label: "Thứ 3" },
  { value: "Wed", label: "Thứ 4" },
  { value: "Thu", label: "Thứ 5" },
  { value: "Fri", label: "Thứ 6" },
  { value: "Sat", label: "Thứ 7" },
  { value: "Sun", label: "Chủ nhật" },
];

const HCM_CENTER = { lng: 106.70098, lat: 10.77653 };

interface CategoryOption {
  _id: string;
  name: string;
  depth: number;
  icon?: string;
}

export default function RestaurantsTab() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ==== CATEGORY STATE ====
  const [categoriesTree, setCategoriesTree] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(""); // giờ là _id chọn từ dropdown
  const [priceRange, setPriceRange] = useState<"$" | "$$" | "$$$" | "$$$$">(
    "$$",
  );

  const [street, setStreet] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("22:00");

  const [selectedDays, setSelectedDays] = useState<string[]>(
    DAY_ITEMS.map((d) => d.value),
  );

  const [logoDragging, setLogoDragging] = useState(false);
  const [coverDragging, setCoverDragging] = useState(false);
  const [galleryDragging, setGalleryDragging] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [createdRestaurant, setCreatedRestaurant] = useState<Restaurant | null>(
    null,
  );

  // ==== LOAD CATEGORY TREE ====
  const loadCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const tree = await CategoryService.listTree();
      setCategoriesTree(tree || []);
    } catch (err: any) {
      console.error(err);
      setCategoriesError(
        err?.message || "Không tải được danh sách danh mục món ăn.",
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const arr: CategoryOption[] = [];

    const walk = (nodes: Category[], depth: number) => {
      for (const node of nodes) {
        arr.push({
          _id: node._id,
          name: node.name,
          depth,
          icon: node.extra?.icon,
        });
        if (Array.isArray(node.children) && node.children.length > 0) {
          walk(node.children, depth + 1);
        }
      }
    };

    walk(categoriesTree, 0);
    return arr;
  }, [categoriesTree]);

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setStreet("");
    setWard("");
    setDistrict("");
    setCity("");
    setCountry("");
    setLat("");
    setLng("");
    setLogoFile(null);
    setCoverFile(null);
    setGalleryFiles([]);
    setLogoPreview(null);
    setCoverPreview(null);
    setGalleryPreviews([]);
    setMsg(null);
    setError(null);
    setOpenTime("08:00");
    setCloseTime("22:00");
    setPriceRange("$$");
    setSelectedDays(DAY_ITEMS.map((d) => d.value));
  };

  const onDragOver =
    (setDragging: (b: boolean) => void) =>
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(true);
    };

  const onDragLeave =
    (setDragging: (b: boolean) => void) =>
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
    };

  const handleLogoDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLogoDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setCoverDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setGalleryDragging(false);
    const files = e.dataTransfer.files
      ? Array.from(e.dataTransfer.files).filter((f) =>
          f.type.startsWith("image/"),
        )
      : [];
    if (files.length) {
      setGalleryFiles((prev) => [...prev, ...files]);
      setGalleryPreviews((prev) => [
        ...prev,
        ...files.map((f) => URL.createObjectURL(f)),
      ]);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) {
      setGalleryFiles((prev) => [...prev, ...files]);
      setGalleryPreviews((prev) => [
        ...prev,
        ...files.map((f) => URL.createObjectURL(f)),
      ]);
    }
  };

  const toggleDay = (value: string) => {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
  };

  // Map init
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    if (!mapboxgl.accessToken) {
      console.warn("Thiếu NEXT_PUBLIC_MAPBOX_API_KEY");
      return;
    }

    const center =
      lat && lng && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
        ? { lng: Number(lng), lat: Number(lat) }
        : HCM_CENTER;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom: 14,
      cooperativeGestures: true,
      attributionControl: true,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right",
    );
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showAccuracyCircle: false,
        fitBoundsOptions: { maxZoom: 16 },
      }),
      "top-right",
    );

    map.on("click", (e) => {
      const { lng: elng, lat: elat } = e.lngLat;
      setLat(elat.toFixed(6));
      setLng(elng.toFixed(6));

      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ color: "#e11d48" })
          .setLngLat([elng, elat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([elng, elat]);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [lat, lng]);

  // Sync marker khi lat/lng thay đổi bằng tay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng)))
      return;

    const numLat = Number(lat);
    const numLng = Number(lng);

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: "#e11d48" })
        .setLngLat([numLng, numLat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([numLng, numLat]);
    }
  }, [lat, lng]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (!name.trim()) {
      setError("Vui lòng nhập tên nhà hàng.");
      return;
    }

    if (!categoryId.trim()) {
      setError("Vui lòng chọn danh mục món ăn.");
      return;
    }

    if (!street.trim() || !ward.trim() || !district.trim() || !city.trim()) {
      setError("Vui lòng nhập đầy đủ địa chỉ.");
      return;
    }

    if (!country.trim()) {
      setError("Vui lòng nhập quốc gia.");
      return;
    }

    if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
      setError("Tọa độ không hợp lệ. Hãy click lên bản đồ để chọn vị trí.");
      return;
    }

    if (selectedDays.length === 0) {
      setError("Vui lòng chọn ít nhất một ngày mở cửa.");
      return;
    }

    const openingHours = selectedDays.map((day) => ({
      day,
      periods: [{ opens: openTime, closes: closeTime }],
      closed: false,
      is24h: false,
    }));

    const payload: CreateRestaurantPayload = {
      name: name.trim(),
      categoryId: categoryId.trim(), // dùng _id từ dropdown
      priceRange,
      address: {
        country: country.trim(),
        city: city.trim(),
        district: district.trim(),
        ward: ward.trim(),
        street: street.trim(),
        locationType: "Point",
        coordinates: [Number(lng), Number(lat)],
      },
      openingHours,
      logo: logoFile || undefined,
      cover: coverFile || undefined,
      gallery: galleryFiles,
    };

    setLoading(true);
    try {
      const created = await RestaurantService.createRestaurant(payload);
      setCreatedRestaurant(created);
      setMsg("✅ Đăng quán thành công! Quán mới của bạn đã được tạo.");
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "❌ Không thể tạo nhà hàng. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fullAddressPreview = createdRestaurant
    ? `${createdRestaurant.address.street}, ${createdRestaurant.address.ward}, ${createdRestaurant.address.district}, ${createdRestaurant.address.city}, ${createdRestaurant.address.country}`
    : "";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 p-[1px]">
        <div className="flex h-full flex-col justify-between gap-4 rounded-2xl bg-white/90 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đăng quán / Quản lý nhà hàng
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Điền thông tin chi tiết, chọn vị trí trên bản đồ và thời gian mở
              cửa. Quán của bạn sẽ xuất hiện trong FoodTour sau khi được tạo.
            </p>
          </div>
          <div className="space-y-2 text-right sm:text-right">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700">
              <span className="text-base">🏪</span>
              <span>Vai trò: Chủ quán / Owner</span>
            </div>
            <p className="text-xs text-gray-500">
              Gợi ý: dùng logo vuông, ảnh bìa ngang để hiển thị đẹp nhất.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm lg:grid-cols-[1.9fr,2.1fr]"
      >
        {/* Cột trái: Thông tin cơ bản + ảnh */}
        <div className="space-y-5">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              01 · Thông tin cơ bản
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Tên quán, danh mục và khoảng giá giúp khách hiểu nhanh về quán.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Tên nhà hàng <span className="text-rose-500">*</span>
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="vd: Bún Bò Huế Oanh, Lẩu Bò A Tám..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Category dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Danh mục món ăn <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">
                  — Chọn danh mục (Đồ ăn nhanh, Cà phê, Món Hàn, ...) —
                </option>
                {categoryOptions.map((c) => (
                  <option key={c._id} value={c._id}>
                    {Array.from({ length: c.depth })
                      .map(() => "— ")
                      .join("")}
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
              {categoriesLoading && (
                <p className="text-xs text-gray-400">
                  Đang tải cây category...
                </p>
              )}
              {categoriesError && (
                <p className="text-xs text-rose-500">{categoriesError}</p>
              )}
              <p className="text-xs text-gray-400">
                Dữ liệu lấy từ cây danh mục Category. Sau này có thể phân loại
                quán theo nhiều nhóm.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Khoảng giá
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                value={priceRange}
                onChange={(e) =>
                  setPriceRange(e.target.value as "$" | "$$" | "$$$" | "$$$$")
                }
              >
                <option value="$">$ – Bình dân</option>
                <option value="$$">$$ – Vừa phải</option>
                <option value="$$$">$$$ – Hơi cao</option>
                <option value="$$$$">$$$$ – Cao cấp</option>
              </select>
            </div>
          </div>

          {/* Upload ảnh */}
          <div className="space-y-3 rounded-xl bg-rose-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Logo & ảnh bìa
                </p>
                <p className="text-xs text-gray-500">
                  Kéo thả ảnh vào ô bên dưới hoặc bấm để chọn file.
                </p>
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] text-gray-600">
                Gợi ý: Logo 1:1 · Cover 16:9
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.2fr,2fr]">
              {/* Logo dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Logo
                </label>
                <div
                  onDragOver={onDragOver(setLogoDragging)}
                  onDragLeave={onDragLeave(setLogoDragging)}
                  onDrop={handleLogoDrop}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3 py-2 text-xs transition ${
                    logoDragging
                      ? "border-rose-400 bg-rose-50"
                      : "border-gray-300 bg-gray-50 hover:border-rose-300"
                  }`}
                  onClick={() =>
                    document.getElementById("logo-input")?.click()
                  }
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white shadow-sm">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-400">
                        Logo
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">
                      Kéo thả hoặc bấm chọn
                    </p>
                    <p className="text-[11px] text-gray-500">
                      JPG, PNG, dưới 5MB
                    </p>
                  </div>
                </div>
                <input
                  id="logo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>

              {/* Cover dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Ảnh bìa
                </label>
                <div
                  onDragOver={onDragOver(setCoverDragging)}
                  onDragLeave={onDragLeave(setCoverDragging)}
                  onDrop={handleCoverDrop}
                  className={`flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed px-3 py-2 text-xs transition ${
                    coverDragging
                      ? "border-rose-400 bg-rose-50"
                      : "border-gray-300 bg-gray-50 hover:border-rose-300"
                  }`}
                  onClick={() =>
                    document.getElementById("cover-input")?.click()
                  }
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-xl bg-white shadow-sm">
                    {coverPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-400">
                        Ảnh bìa (banner lớn)
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Hình ngang, hiển thị nổi bật trên trang quán.
                  </p>
                </div>
                <input
                  id="cover-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
            </div>

            {/* Gallery dropzone */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Bộ sưu tập ảnh (tùy chọn)
              </label>
              <div
                onDragOver={onDragOver(setGalleryDragging)}
                onDragLeave={onDragLeave(setGalleryDragging)}
                onDrop={handleGalleryDrop}
                className={`flex cursor-pointer flex-col gap-1 rounded-xl border border-dashed px-3 py-3 text-xs transition ${
                  galleryDragging
                    ? "border-rose-400 bg-rose-50"
                    : "border-gray-300 bg-white hover:border-rose-300"
                }`}
                onClick={() =>
                  document.getElementById("gallery-input")?.click()
                }
              >
                <p className="font-medium text-gray-700">
                  Kéo thả nhiều ảnh món ăn / không gian vào đây
                </p>
                <p className="text-[11px] text-gray-500">
                  Giữ Shift/Ctrl khi chọn để chọn nhiều file.
                </p>
                {galleryFiles.length > 0 && (
                  <p className="text-[11px] text-emerald-600">
                    Đã chọn {galleryFiles.length} ảnh.
                  </p>
                )}
              </div>
              <input
                id="gallery-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleGalleryChange}
              />
            </div>
          </div>
        </div>

        {/* Cột phải: Địa chỉ, bản đồ & giờ mở cửa */}
        <div className="space-y-5">
          {/* Địa chỉ + map */}
          <div className="space-y-3 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  02 · Địa chỉ & bản đồ
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Điền địa chỉ và chọn chính xác vị trí trên bản đồ để hiển thị
                  đúng cho khách.
                </p>
              </div>
              <span className="hidden text-xs text-gray-400 md:inline">
                Tip: Click vào bản đồ để đặt marker.
              </span>
            </div>

            <div className="grid gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Địa chỉ
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Số nhà, tên đường"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Phường / Xã
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Quận / Huyện
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Thành phố
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Quốc gia
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-700">
                  Chọn vị trí trên bản đồ
                </p>
                <p className="text-[11px] text-gray-500">
                  Click vào bản đồ để cập nhật tọa độ.
                </p>
              </div>
              <div
                ref={mapContainerRef}
                className="h-56 w-full overflow-hidden rounded-xl border border-gray-200 bg-white"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Vĩ độ (lat)
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="10.77653"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Kinh độ (lng)
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="106.70098"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Giờ mở cửa + submit */}
          <div className="space-y-3 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  03 · Giờ mở cửa theo ngày
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Chọn các ngày mở cửa và thời gian áp dụng chung.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DAY_ITEMS.map((d) => {
                const active = selectedDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xs font-medium text-gray-700">
                Giờ áp dụng:
              </span>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-[110px] rounded-xl border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
              <span className="text-xs text-gray-500">đến</span>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-[110px] rounded-xl border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Sau này có thể cấu hình giờ riêng cho từng ngày / ca trong ngày.
            </p>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {loading ? "Đang tạo nhà hàng..." : "Đăng quán ngay"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* LIVE PREVIEW – xem trước ngay khi upload ảnh */}
      {(logoPreview || coverPreview || galleryPreviews.length > 0) && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Xem trước trang quán
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Đây là bản xem trước cho ảnh logo / bìa / gallery vừa chọn.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[2.4fr,1.6fr]">
            {/* Cover + logo */}
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                {/* Cover full-width */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    coverPreview ||
                    "https://placehold.co/1200x400?text=Cover+Preview"
                  }
                  alt="Cover preview"
                  className="h-56 w-full object-cover"
                />
                {/* Logo overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-2xl bg-black/40 px-3 py-2 backdrop-blur-sm">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/50 bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        logoPreview ||
                        "https://placehold.co/120x120?text=Logo"
                      }
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-white">
                    <p className="font-semibold">
                      {name || "Tên nhà hàng của bạn"}
                    </p>
                    <p className="text-[11px] text-gray-100">
                      {priceRange || "$$"} ·{" "}
                      {district || "Quận ?"}, {city || "Thành phố ?"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Gallery preview */}
              {galleryPreviews.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-700">
                    Bộ sưu tập ảnh (preview)
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {galleryPreviews.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative h-24 overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Gallery ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Info nhỏ */}
            <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-xs">
              <div>
                <p className="font-semibold text-gray-800">
                  Thông tin cơ bản
                </p>
                <p className="mt-1 text-gray-700">
                  {name || "Tên nhà hàng của bạn"}
                </p>
                <p className="mt-0.5 text-gray-500">
                  {street || "Địa chỉ..."}
                  {street && (ward || district || city || country) ? ", " : ""}
                  {[ward, district, city, country].filter(Boolean).join(", ")}
                </p>
                <p className="mt-0.5 text-gray-500">
                  Khoảng giá:{" "}
                  <span className="font-medium text-gray-800">
                    {priceRange}
                  </span>
                </p>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div>
                <p className="font-semibold text-gray-800">Giờ mở cửa</p>
                <p className="mt-1 text-[11px] text-gray-600">
                  {selectedDays.length > 0
                    ? `${selectedDays.length} ngày / tuần`
                    : "Chưa chọn ngày mở cửa"}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-600">
                  Khung giờ: {openTime} – {closeTime}
                </p>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div>
                <p className="font-semibold text-gray-800">
                  Tọa độ (nếu có)
                </p>
                {lat && lng ? (
                  <p className="mt-0.5 font-mono text-[11px] text-gray-700">
                    lat: {lat} · lng: {lng}
                  </p>
                ) : (
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    Chưa chọn vị trí trên bản đồ.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Thông báo */}
      {(msg || error) && (
        <div className="rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm">
          {msg && <p className="text-emerald-700">{msg}</p>}
          {error && <p className="text-rose-600">{error}</p>}
        </div>
      )}

      {/* Preview response từ backend sau khi create */}
      {createdRestaurant && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {createdRestaurant.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                ID:{" "}
                <span className="font-mono text-[11px]">
                  {createdRestaurant._id}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                Khoảng giá: {createdRestaurant.priceRange || "$$"}
              </span>
              <span className="text-xs text-gray-500">
                Trạng thái:{" "}
                {createdRestaurant.isActive ? (
                  <span className="font-medium text-emerald-600">Hoạt động</span>
                ) : (
                  <span className="font-medium text-gray-500">Tạm ẩn</span>
                )}
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr,1.4fr]">
            {/* Ảnh */}
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    createdRestaurant.coverImageUrlSigned ||
                    createdRestaurant.coverImageUrl ||
                    createdRestaurant.logoUrlSigned ||
                    createdRestaurant.logoUrl ||
                    "https://placehold.co/800x400?text=Restaurant+Cover"
                  }
                  alt={createdRestaurant.name}
                  className="h-40 w-full object-cover"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-gray-100 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      createdRestaurant.logoUrlSigned ||
                      createdRestaurant.logoUrl ||
                      "https://placehold.co/120x120?text=Logo"
                    }
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-xs text-gray-600">
                  <p className="font-medium text-gray-800">Địa chỉ</p>
                  <p className="line-clamp-2">{fullAddressPreview}</p>
                  {Array.isArray(createdRestaurant.searchTerms) &&
                    createdRestaurant.searchTerms.length > 0 && (
                      <p className="mt-1 text-[11px] text-gray-400">
                        Từ khóa tìm kiếm:{" "}
                        {createdRestaurant.searchTerms.slice(0, 4).join(", ")}
                        {createdRestaurant.searchTerms.length > 4 && "…"}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Info chi tiết */}
            <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-xs">
              <div>
                <p className="font-semibold text-gray-800">
                  Thông tin hệ thống
                </p>
                <p className="mt-1 text-gray-600">
                  Owner ID:{" "}
                  <span className="font-mono text-[11px]">
                    {createdRestaurant.ownerId}
                  </span>
                </p>
                <p className="mt-0.5 text-gray-600">
                  Category ID:{" "}
                  <span className="font-mono text-[11px]">
                    {createdRestaurant.categoryId}
                  </span>
                </p>
                <p className="mt-0.5 text-gray-600">
                  Slug:{" "}
                  <span className="font-mono text-[11px]">
                    {createdRestaurant.slug}
                  </span>
                </p>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              {Array.isArray(createdRestaurant.openingHours) && (
                <div>
                  <p className="font-semibold text-gray-800">Giờ mở cửa</p>
                  <ul className="mt-1 space-y-0.5">
                    {createdRestaurant.openingHours.map((oh) => (
                      <li
                        key={oh.day}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[11px] font-medium text-gray-700">
                          {oh.day}
                        </span>
                        {oh.closed ? (
                          <span className="text-[11px] text-gray-400">
                            Đóng cửa
                          </span>
                        ) : Array.isArray(oh.periods) &&
                          oh.periods.length > 0 ? (
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
                </div>
              )}

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="font-semibold text-gray-800">
                    Tọa độ & rating
                  </p>
                  <p className="text-[11px] text-gray-600">
                    lng:{" "}
                    {createdRestaurant.address.coordinates?.[0]?.toFixed
                      ? createdRestaurant.address.coordinates[0].toFixed(6)
                      : createdRestaurant.address.coordinates?.[0]}
                    {" · "}
                    lat:{" "}
                    {createdRestaurant.address.coordinates?.[1]?.toFixed
                      ? createdRestaurant.address.coordinates[1].toFixed(6)
                      : createdRestaurant.address.coordinates?.[1]}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    Rating:{" "}
                    {createdRestaurant.rating != null
                      ? createdRestaurant.rating.toFixed
                        ? createdRestaurant.rating.toFixed(1)
                        : createdRestaurant.rating
                      : "Chưa có đánh giá"}
                  </p>
                </div>
                <div className="text-right text-[11px] text-gray-500">
                  <p>
                    Tạo lúc:{" "}
                    {createdRestaurant.createdAt
                      ? new Date(
                          createdRestaurant.createdAt as unknown as string,
                        ).toLocaleString()
                      : ""}
                  </p>
                  <p>
                    Cập nhật:{" "}
                    {createdRestaurant.updatedAt
                      ? new Date(
                          createdRestaurant.updatedAt as unknown as string,
                        ).toLocaleString()
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
