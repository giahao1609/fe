// src/services/menu.service.ts
import { ApiService } from "./api.service";

export type MoneyInput = {
  currency: string;
  amount: number;
};

export type CreateMenuItemPayload = {
  name: string;
  slug: string;
  description?: string;
  itemType: string;

  basePrice: MoneyInput;
  compareAtPrice?: MoneyInput;
  discountPercent?: number;

  tags: string[];
  cuisines: string[];
  isAvailable: boolean;
  sortIndex?: number;

  images?: File[];
};

export type UpdateMenuItemFlags = {
  imagesMode?: "append" | "replace" | "remove";
  removeAllImages?: boolean;
  imagesRemovePaths?: string[];
};

export type UpdateMenuItemPayload = {
  name: string;
  slug: string;
  description?: string;
  itemType: string;

  basePrice: MoneyInput;
  compareAtPrice?: MoneyInput;
  discountPercent?: number;

  tags: string[];
  cuisines: string[];
  isAvailable: boolean;
  sortIndex?: number;

  images?: File[];
  flags?: UpdateMenuItemFlags;
};

export type MenuItem = {
  _id: string;
  restaurantId: string;
  name: string;
  slug: string;
  description?: string;

  images: string[];
  imagesSigned?: string[];

  tags: string[];
  cuisines: string[];
  itemType: string;

  basePrice: {
    currency: string;
    amount: number;
  };
  compareAtPrice?: {
    currency: string;
    amount: number;
  };
  discountPercent?: number;

  variants: any[];
  optionGroups: any[];
  promotions: any[];

  vegetarian: boolean;
  vegan: boolean;
  halal: boolean;
  glutenFree: boolean;

  allergens: string[];
  spicyLevel: number;

  isAvailable: boolean;
  sortIndex?: number;

  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type MenuItemPageResponse = {
  restaurantId: string;
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: MenuItem[];
};

// helper nhỏ để append Money dạng field lồng (không JSON.stringify)
function appendMoney(
  form: FormData,
  fieldName: string, // "basePrice" / "compareAtPrice"
  money?: MoneyInput,
) {
  if (!money) return;
  form.append(`${fieldName}[currency]`, money.currency);
  form.append(`${fieldName}[amount]`, String(money.amount));
}

export const MenuService = {
  /** Tạo menu-item cho 1 nhà hàng (multipart/form-data) */
  async createForRestaurant(
    restaurantId: string,
    payload: CreateMenuItemPayload,
  ): Promise<MenuItem> {
    const form = new FormData();

    // ---- scalar fields ----
    form.append("name", payload.name);
    form.append("slug", payload.slug);
    if (payload.description) {
      form.append("description", payload.description);
    }
    form.append("itemType", payload.itemType);

    // Money fields
    appendMoney(form, "basePrice", payload.basePrice);
    appendMoney(form, "compareAtPrice", payload.compareAtPrice);

    // discountPercent (simple number)
    if (typeof payload.discountPercent === "number") {
      form.append("discountPercent", String(payload.discountPercent));
    }

    // tags & cuisines: nhiều field trùng tên
    (payload.tags || []).forEach((t) => form.append("tags", t));
    (payload.cuisines || []).forEach((c) => form.append("cuisines", c));

    // boolean & number
    form.append("isAvailable", String(payload.isAvailable));
    if (typeof payload.sortIndex === "number") {
      form.append("sortIndex", String(payload.sortIndex));
    }

    // images
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        form.append("images", file);
      });
    }

    const url = `/owner/restaurants/${restaurantId}/menu-items`;
    const res = await ApiService.postFormData<MenuItem>(url, form);
    return res;
  },

  /** Cập nhật 1 menu-item (multipart/form-data + flags ảnh) */
  async updateForRestaurant(
    restaurantId: string,
    menuItemId: string,
    payload: UpdateMenuItemPayload,
  ): Promise<MenuItem> {
    const form = new FormData();

    // ---- scalar fields ----
    form.append("name", payload.name);
    form.append("slug", payload.slug);
    if (payload.description) {
      form.append("description", payload.description);
    }
    form.append("itemType", payload.itemType);

    // Money fields
    appendMoney(form, "basePrice", payload.basePrice);
    appendMoney(form, "compareAtPrice", payload.compareAtPrice);

    // discountPercent
    if (typeof payload.discountPercent === "number") {
      form.append("discountPercent", String(payload.discountPercent));
    }

    // tags & cuisines
    (payload.tags || []).forEach((t) => form.append("tags", t));
    (payload.cuisines || []).forEach((c) => form.append("cuisines", c));

    // boolean & number
    form.append("isAvailable", String(payload.isAvailable));
    if (typeof payload.sortIndex === "number") {
      form.append("sortIndex", String(payload.sortIndex));
    }

    // images mới upload
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        form.append("images", file);
      });
    }

    // flags ảnh
    if (payload.flags) {
      if (payload.flags.imagesMode) {
        form.append("imagesMode", payload.flags.imagesMode);
      }
      if (typeof payload.flags.removeAllImages === "boolean") {
        form.append("removeAllImages", String(payload.flags.removeAllImages));
      }
      if (
        payload.flags.imagesRemovePaths &&
        payload.flags.imagesRemovePaths.length > 0
      ) {
        // Nest parseJsonArray: nếu nhiều field cùng tên => string[]
        payload.flags.imagesRemovePaths.forEach((p) =>
          form.append("imagesRemovePaths", p),
        );
      }
    }

    const url = `/owner/restaurants/${restaurantId}/menu-items/${menuItemId}`;
    const res = await ApiService.postFormData<MenuItem>(url, form);
    return res;
  },

  /** List menu-items dạng phân trang cho 1 nhà hàng */
  async listByRestaurant(
    restaurantId: string,
    input?: {
      page?: number;
      limit?: number;
    },
  ): Promise<MenuItemPageResponse> {
    const page = Math.max(1, Number(input?.page ?? 1));
    const rawLimit = Number(input?.limit ?? 20);
    const limit = Math.min(999, Math.max(1, rawLimit));

    const url = `/owner/restaurants/${restaurantId}/menu-items`;
    const res = await ApiService.get<MenuItemPageResponse>(url, {
      params: { page, limit },
    });

    return res;
  },

  /** Xoá 1 menu-item của nhà hàng */
  async deleteForRestaurant(
    restaurantId: string,
    menuItemId: string,
  ): Promise<void> {
    const url = `/owner/restaurants/${restaurantId}/menu-items/${menuItemId}`;
    await ApiService.delete(url);
  },
};
