// src/services/restaurant.service.ts
import { ApiService } from "./api.service";
import { NotifyService } from "./notify.service";

/* ================== Types ================== */

export type RestaurantAddress = {
  country: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  locationType: "Point";
  coordinates: [number, number]; // [lng, lat]
};

export type OpeningPeriod = {
  opens: string; // "08:00"
  closes: string; // "22:00"
};

export type OpeningHour = {
  day: string; // "Mon" | "Tue" | ...
  periods: OpeningPeriod[];
  closed?: boolean;
  is24h?: boolean;
};

export type CreateRestaurantPayload = {
  name: string;
  categoryId: string;
  priceRange: string; // "$" | "$$" | "$$$" | "$$$$"
  address: RestaurantAddress;
  openingHours: OpeningHour[];
  logo?: File | null;
  cover?: File | null;
  gallery?: File[];
};

// ✅ theo response thật của API
export type Restaurant = {
  _id: string;
  ownerId: string;
  categoryId: string;
  name: string;
  slug: string;

  logoUrl?: string;
  coverImageUrl?: string;
  logoUrlSigned?: string | null;
  coverImageUrlSigned?: string | null;

  gallery?: string[];
  gallerySigned?: string[];

  address: RestaurantAddress;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };

  cuisine?: string[];
  priceRange: string;
  rating?: number | null;
  amenities?: string[];

  openingHours?: {
    day: string;
    periods: OpeningPeriod[];
    closed?: boolean;
    is24h?: boolean;
  }[];

  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  tags?: string[];
  searchTerms?: string[];

  // chỉ có trong nearby
  distanceMeters?: number;
  distanceKm?: number;
  distanceText?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type RestaurantListResponse = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: Restaurant[];
};

export type NearbyRestaurantsResponse = {
  center: {
    lat: number;
    lng: number;
  };
  maxDistanceMeters: number;
  limit: number;
  count: number;
  items: Restaurant[];
};

/* ================== Service ================== */

export const RestaurantService = {
  /**
   * POST /api/v1/owner/restaurants
   * Tạo nhà hàng mới (multipart/form-data)
   */
  // async createRestaurant(payload: any): Promise<Restaurant> {
  //   const formData = new FormData();

  //   formData.append("name", payload.name.trim());
  //   formData.append("categoryId", payload.categoryId.trim());
  //   formData.append("priceRange", payload.priceRange);

  //   formData.append("address", JSON.stringify(payload.address));
  //   formData.append("openingHours", JSON.stringify(payload.openingHours));

  //   // 👈 THIẾU CHỖ NÀY
  //   if (payload.paymentConfig) {
  //     formData.append("paymentConfig", JSON.stringify(payload.paymentConfig));
  //   }

  //   // file đơn
  //   if (payload.logo) formData.append("logo", payload.logo);
  //   if (payload.cover) formData.append("cover", payload.cover);

  //   // gallery
  //   if (payload.gallery && payload.gallery.length > 0) {
  //     for (const file of payload.gallery) {
  //       formData.append("gallery", file);
  //     }
  //   }

  //   // 👇 thêm bankQrs
  //   if (payload.bankQrs && payload.bankQrs.length > 0) {
  //     for (const file of payload.bankQrs) {
  //       formData.append("bankQrs", file);
  //     }
  //   }

  //   // 👇 thêm ewalletQrs
  //   if (payload.ewalletQrs && payload.ewalletQrs.length > 0) {
  //     for (const file of payload.ewalletQrs) {
  //       formData.append("ewalletQrs", file);
  //     }
  //   }

  //   const restaurant = await ApiService.postFormData<Restaurant>(
  //     "/owner/restaurants",          // nhớ base URL có /api/v1 nếu backend đang dùng
  //     formData,
  //   );

  //   NotifyService.success("Tạo nhà hàng thành công!");
  //   return restaurant;
  // },

  async createRestaurant(payload: any) {
    const formData = new FormData();

    // text fields
    formData.append("name", payload.name.trim());
    formData.append("categoryId", payload.categoryId.trim());
    formData.append("priceRange", String(payload.priceRange));

    // JSON fields – mirror với curl
    formData.append("address", JSON.stringify(payload.address));
    formData.append("openingHours", JSON.stringify(payload.openingHours));
    formData.append("paymentConfig", JSON.stringify(payload.paymentConfig));

    // single file
    if (payload.logo) formData.append("logo", payload.logo);
    if (payload.cover) formData.append("cover", payload.cover);

    // gallery
    if (payload.gallery && payload.gallery.length > 0) {
      for (const file of payload.gallery) {
        formData.append("gallery", file);
      }
    }

    // bankQrs
    if (payload.bankQrs && payload.bankQrs.length > 0) {
      for (const file of payload.bankQrs) {
        formData.append("bankQrs", file);
      }
    }

    // ewalletQrs
    if (payload.ewalletQrs && payload.ewalletQrs.length > 0) {
      for (const file of payload.ewalletQrs) {
        formData.append("ewalletQrs", file);
      }
    }

    // Debug nếu cần so formData với curl
    // console.log("FD entries:", Array.from(formData.entries()));

    const restaurant = await ApiService.postFormData<Restaurant>("/owner/restaurants", formData);
    return restaurant;
  },
  /**
   * GET /api/v1/owner/restaurants
   * List nhà hàng (có phân trang)
   */
  async listRestaurants(input?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<RestaurantListResponse> {
    const page = Math.max(1, Number(input?.page ?? 1));
    const rawLimit = Number(input?.limit ?? 20);
    const limit = Math.min(999, Math.max(1, rawLimit));

    const params: Record<string, any> = { page, limit };

    if (typeof input?.isActive === "boolean") {
      params.isActive = input.isActive ? "true" : "false";
    }

    const res = await ApiService.get<RestaurantListResponse>(
      "/owner/restaurants",
      { params },
    );

    return res;
  },

  /**
   * GET /api/v1/owner/restaurants/get-by-owner
   * Lấy danh sách nhà hàng của owner hiện tại
   */
  async getByOwner() {
    const res = await ApiService.get("/owner/restaurants/get-by-owner");
    return res;
  },

  /**
   * GET /api/v1/owner/restaurants/detail/:idOrSlug
   * Lấy chi tiết 1 nhà hàng (bao gồm signed URL logo/cover/gallery)
   */
  async getRestaurantDetail(
    id: string,
    opts?: { lat?: number | null; lng?: number | null },
  ): Promise<Restaurant> {
    if (!id) {
      throw new Error("Restaurant id is required");
    }

    const params: Record<string, any> = {};

    // chỉ gửi lên khi thực sự có số
    if (typeof opts?.lat === "number" && typeof opts?.lng === "number") {
      params.lat = opts.lat;
      params.lng = opts.lng;
    }

    const res = await ApiService.get<Restaurant>(
      `/owner/restaurants/detail/${id}`,
      { params },
    );

    return res;
  },

  /**
   * ✅ ALIAS cho trang owner: dùng đúng tên mà component đang gọi
   * GET /api/v1/owner/restaurants/detail/:idOrSlug
   */
  async getOwnerDetail(
    idOrSlug: string,
    opts?: { lat?: number | null; lng?: number | null },
  ): Promise<Restaurant> {
    return RestaurantService.getRestaurantDetail(idOrSlug, opts);
  },

  /**
   * ✅ Update nhà hàng của owner
   * POST /api/v1/owner/restaurants/:id  (multipart/form-data)
   * Khớp với OwnerRestaurantsController.updateById
   */
  async updateOwnerRestaurant(
    id: string,
    payload: any,
  ): Promise<Restaurant> {
    if (!id) throw new Error("Restaurant id is required");

    const formData = new FormData();

    const appendIfString = (key: string, value?: string | null) => {
      if (typeof value === "string" && value.trim().length > 0) {
        formData.append(key, value.trim());
      }
    };

    // ===== BASIC FIELDS =====
    appendIfString("name", payload.name ?? null);
    appendIfString("categoryId", payload.categoryId ?? null);
    appendIfString("priceRange", payload.priceRange ?? null);
    appendIfString("phone", payload.phone ?? null);
    appendIfString("email", payload.email ?? null);
    appendIfString("website", payload.website ?? null);
    appendIfString("description", payload.description ?? null);
    appendIfString("status", payload.status ?? null);

    if (payload.address) {
      formData.append("address", JSON.stringify(payload.address));
    }

    if (payload.openingHours) {
      formData.append("openingHours", JSON.stringify(payload.openingHours));
    }

    if (Array.isArray(payload.tags)) {
      formData.append("tags", JSON.stringify(payload.tags));
    }

    // ===== PAYMENT CONFIG + QR =====
    // BE: if ('paymentConfig' in dto) { ... }
    if (payload.paymentConfig !== undefined) {
      // JSON.stringify(null) -> "null" => BE sẽ parse ra null và unset paymentConfig
      formData.append(
        "paymentConfig",
        JSON.stringify(payload.paymentConfig),
      );
    }

    if (Array.isArray(payload.bankQrs) && payload.bankQrs.length > 0) {
      for (const file of payload.bankQrs) {
        formData.append("bankQrs", file);
      }
    }

    if (Array.isArray(payload.ewalletQrs) && payload.ewalletQrs.length > 0) {
      for (const file of payload.ewalletQrs) {
        formData.append("ewalletQrs", file);
      }
    }

    // ===== MEDIA: LOGO / COVER / GALLERY =====
    if (payload.logo instanceof File) {
      formData.append("logo", payload.logo);
    }
    if (payload.cover instanceof File) {
      formData.append("cover", payload.cover);
    }
    if (Array.isArray(payload.gallery) && payload.gallery.length > 0) {
      for (const file of payload.gallery) {
        formData.append("gallery", file);
      }
    }

    // ===== FLAGS MEDIA (match parseBool/parseJsonArray ở BE) =====
    if (typeof payload.removeLogo === "boolean") {
      formData.append("removeLogo", String(payload.removeLogo));
    }
    if (typeof payload.removeCover === "boolean") {
      formData.append("removeCover", String(payload.removeCover));
    }
    if (payload.galleryMode) {
      formData.append("galleryMode", payload.galleryMode);
    }
    if (Array.isArray(payload.galleryRemovePaths)) {
      formData.append(
        "galleryRemovePaths",
        JSON.stringify(payload.galleryRemovePaths),
      );
    }
    if (typeof payload.removeAllGallery === "boolean") {
      formData.append("removeAllGallery", String(payload.removeAllGallery));
    }

    // ===== CALL API =====
    const restaurant = await ApiService.postFormData<Restaurant>(
      `/owner/restaurants/${id}`,
      formData,
    );

    NotifyService.success("Cập nhật nhà hàng thành công!");
    return restaurant;
  },

  /**
   * GET /api/v1/owner/restaurants/nearby
   */
  async getNearbyRestaurants(input: {
    lat: number;
    lng: number;
    maxDistanceKm?: number;
    limit?: number;
  }): Promise<NearbyRestaurantsResponse> {
    const lat = Number(input.lat);
    const lng = Number(input.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error("Invalid lat/lng");
    }

    const maxDistanceKm = input.maxDistanceKm ?? 5;
    const maxDistanceMeters = Math.max(0, maxDistanceKm * 1000);

    const rawLimit = Number(input.limit ?? 20);
    const limit = Math.min(999, Math.max(1, rawLimit));

    const qs = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      maxDistanceMeters: String(maxDistanceMeters),
      limit: String(limit),
    }).toString();

    const res = await ApiService.get<NearbyRestaurantsResponse>(
      `/owner/restaurants/nearby?${qs}`,
    );

    return res;
  },
};
