"use client";

import { MOCK_RESTAURANTS } from "@/data/mock";


export type DayCode = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type Address = {
  country: string;       // "VN"
  city: string;          // "Ho Chi Minh"
  district: string;      // "1"
  ward?: string;         // "Bến Nghé"
  street?: string;       // "123 Lê Lợi"
  locationType: "Point"; // "Point"
  coordinates: [number, number]; // [lng, lat]
};

export type OpeningPeriod = {
  opens: string;  // "08:00"
  closes: string; // "22:00"
};

export type OpeningDay = {
  day: DayCode;
  closed: boolean;
  is24h: boolean;
  periods: OpeningPeriod[]; // [] nếu closed = true
};

export type BankTransferInfo = {
  bankCode: string;     // "VCB"
  bankName: string;     // "Vietcombank"
  accountName: string;  // "Nguyen Van A"
  accountNumber: string;// "0123456789"
  branch?: string;      // "Chi nhánh HCM"
  note?: string;        // "CK ghi: SDT + tên"
};

export type EWalletInfo = {
  provider: string;     // "MOMO"
  displayName: string;  // "Quan Ngon SG"
  phoneNumber: string;  // "0909000000"
  note?: string;        // "Ví Momo"
};

export type PaymentConfig = {
  allowCash: boolean;
  allowBankTransfer: boolean;
  allowEWallet: boolean;
  generalNote?: string;
  bankTransfers: BankTransferInfo[];
  eWallets: EWalletInfo[];
};

/** Tài sản hình ảnh: có thể là URL string (đã upload) hoặc objectURL (mock local) */
export type AssetUrl = string;

export type Restaurant = {
  _id: string;
  name: string;
  categoryId: string;     // <-- thêm theo API
  priceRange: string;     // ví dụ "$$", "50k-100k"

  address: Address;
  openingHours: OpeningDay[];
  paymentConfig: PaymentConfig;

  // mô tả thêm (không bắt buộc)
  description?: string;
  directions?: string;

  // assets
  logo?: AssetUrl | null;
  cover?: AssetUrl | null;
  gallery: AssetUrl[];
  bankQrs: AssetUrl[];
  ewalletQrs: AssetUrl[];

  // giữ lại 3 field cũ nếu bạn đang dùng trong UI (optional)
  // scheduleText?: string;  // thay bằng openingHours
  // banner?: string[];      // thay bằng cover
  // menuImages?: string[];  // nếu cần, có thể bỏ
};

/** ===== DTO cho create/update (giống API multipart) ===== */

export type CreateRestaurantDto = {
  name: string;
  categoryId: string;
  priceRange: string;

  address: Address;
  openingHours: OpeningDay[];
  paymentConfig: PaymentConfig;

  description?: string;
  directions?: string;

  // multipart
  logo?: File | string | null;
  cover?: File | string | null;
  gallery?: (File | string)[];     // nhiều file
  bankQrs?: (File | string)[];
  ewalletQrs?: (File | string)[];
};

export type UpdateRestaurantDto = Partial<CreateRestaurantDto>;

/** ===== Local persistence ===== */

const LS_KEY = "fm_restaurants_v2";

/** Map dữ liệu MOCK_RESTAURANTS cũ -> Restaurant mới (để demo render) */
function fromLegacyMock(m: any): Restaurant {
  // fallback address giả định nếu data/mock chưa có schema mới
  const address: Address = {
    country: "VN",
    city: "Ho Chi Minh",
    district: m.district || "1",
    ward: "",
    street: m.address || "",
    locationType: "Point",
    coordinates: [Number(m.longitude ?? 106.7), Number(m.latitude ?? 10.77)],
  };

  const defaultOpening = defaultOpeningHours();

  return {
    _id: m._id,
    name: m.name,
    categoryId: "LEGACY",
    priceRange: m.priceRange || "$$",
    address,
    openingHours: defaultOpening,
    paymentConfig: defaultPaymentConfig(),
    description: m.description,
    directions: m.directions,

    logo: null,
    cover: Array.isArray(m.banner) && m.banner.length ? m.banner[0] : null,
    gallery: Array.isArray(m.gallery) ? m.gallery : [],
    bankQrs: [],
    ewalletQrs: [],
  };
}

function load(): Restaurant[] {
  if (typeof window === "undefined") {
    // SSR: trả mock convert
    return MOCK_RESTAURANTS.map(fromLegacyMock);
  }
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    const seeded = MOCK_RESTAURANTS.map(fromLegacyMock);
    localStorage.setItem(LS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Restaurant[];
    return parsed;
  } catch {
    const seeded = MOCK_RESTAURANTS.map(fromLegacyMock);
    localStorage.setItem(LS_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function save(list: Restaurant[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

const genId = () =>
  "r_" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);

/** ===== Helpers ===== */

/** Tạo objectURL cho File (mock), hoặc trả nguyên string nếu đã là URL từ server */
function toStoredUrl(v?: File | string | null): AssetUrl | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  // local mock: tạo objectURL để hiển thị ngay
  return URL.createObjectURL(v);
}

function toStoredArray(v?: (File | string)[] | null): AssetUrl[] {
  if (!v || !Array.isArray(v)) return [];
  return v
    .map((it) => toStoredUrl(it))
    .filter((u): u is string => typeof u === "string" && u.length > 0);
}

export function defaultOpeningHours(): OpeningDay[] {
  const days: DayCode[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d) => ({
    day: d,
    closed: false,
    is24h: false,
    periods: [{ opens: "08:00", closes: "22:00" }],
  }));
}

export function defaultPaymentConfig(): PaymentConfig {
  return {
    allowCash: true,
    allowBankTransfer: true,
    allowEWallet: true,
    generalNote: "",
    bankTransfers: [],
    eWallets: [],
  };
}

/** Merge “sâu” cho nested object (đủ dùng cho Update DTO nhỏ gọn) */
function deepMerge<T>(target: T, patch: Partial<T>): T {
  const out: any = Array.isArray(target) ? [...(target as any)] : { ...(target as any) };
  for (const [k, v] of Object.entries(patch as any)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge(out[k] ?? {}, v);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

/** ===== Public API ===== */

export async function getAllRestaurants(): Promise<Restaurant[]> {
  return load();
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  return load().find((r) => r._id === id) ?? null;
}

/** Create khớp API schema */
export async function createRestaurant(dto: CreateRestaurantDto): Promise<Restaurant> {
  const list = load();

  const item: Restaurant = {
    _id: genId(),
    name: dto.name,
    categoryId: dto.categoryId,
    priceRange: dto.priceRange,

    address: dto.address,
    openingHours: dto.openingHours?.length ? dto.openingHours : defaultOpeningHours(),
    paymentConfig: dto.paymentConfig ?? defaultPaymentConfig(),

    description: dto.description ?? "",
    directions: dto.directions ?? "",

    logo: toStoredUrl(dto.logo) ?? null,
    cover: toStoredUrl(dto.cover) ?? null,
    gallery: toStoredArray(dto.gallery),
    bankQrs: toStoredArray(dto.bankQrs),
    ewalletQrs: toStoredArray(dto.ewalletQrs),
  };

  list.unshift(item);
  save(list);
  return item;
}

/** Update khớp API schema */
export async function updateRestaurant(id: string, dto: UpdateRestaurantDto): Promise<Restaurant> {
  const list = load();
  const idx = list.findIndex((r) => r._id === id);
  if (idx === -1) throw new Error("Not found");

  const current = list[idx];

  // xử lý asset riêng (File/string)
  const assetsPatch: Partial<Restaurant> = {};
  if ("logo" in dto) assetsPatch.logo = toStoredUrl(dto.logo ?? null);
  if ("cover" in dto) assetsPatch.cover = toStoredUrl(dto.cover ?? null);
  if ("gallery" in dto) assetsPatch.gallery = toStoredArray(dto.gallery ?? []);
  if ("bankQrs" in dto) assetsPatch.bankQrs = toStoredArray(dto.bankQrs ?? []);
  if ("ewalletQrs" in dto) assetsPatch.ewalletQrs = toStoredArray(dto.ewalletQrs ?? []);

  // merge các field còn lại
  const merged = deepMerge<Restaurant>(current, {
    ...dto,
    ...assetsPatch,
  } as any);

  // đảm bảo không rớt _id
  merged._id = id;

  list[idx] = merged;
  save(list);
  return merged;
}

export async function deleteRestaurant(id: string): Promise<void> {
  const next = load().filter((r) => r._id !== id);
  save(next);
}
