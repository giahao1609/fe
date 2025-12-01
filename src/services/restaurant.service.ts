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
  async createRestaurant(payload: CreateRestaurantPayload): Promise<Restaurant> {
    const formData = new FormData();

    formData.append("name", payload.name.trim());
    formData.append("categoryId", payload.categoryId.trim());
    formData.append("priceRange", payload.priceRange);

    formData.append("address", JSON.stringify(payload.address));
    formData.append("openingHours", JSON.stringify(payload.openingHours));

    if (payload.logo) formData.append("logo", payload.logo);
    if (payload.cover) formData.append("cover", payload.cover);
    if (payload.gallery && payload.gallery.length > 0) {
      for (const file of payload.gallery) {
        formData.append("gallery", file);
      }
    }

    const restaurant = await ApiService.postFormData<Restaurant>(
      "/owner/restaurants",
      formData,
    );

    NotifyService.success("Tạo nhà hàng thành công!");
    return restaurant;
  },

  /**
   * GET /api/v1/owner/restaurants
   * List nhà hàng của owner (có phân trang)
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
   * GET /api/v1/owner/restaurants/detail/:id
   * Lấy chi tiết 1 nhà hàng (bao gồm signed URL logo/cover/gallery)
   *
   * curl --location 'https://api.food-map.online/api/v1/owner/restaurants/detail/691f71667ddc4ff2de6cdeb4'
   */
  // services/restaurant.service.ts

  async getRestaurantDetail(
    id: string,
    opts?: { lat?: number | null; lng?: number | null }
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
      { params }
    );

    return res;
  },


  /**
   * GET /api/v1/owner/restaurants/nearby
   *  ?lat=10.77653
   *  &lng=106.70098
   *  &maxDistanceMeters=115000
   *  &limit=10
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

    // build query string thủ công để không bị ?params=[object Object]
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
