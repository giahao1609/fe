import { Restaurant } from "@/data/mock";

export function getMainImage(r: any): string | undefined {
  return r.coverImageUrl || r.logoUrl || r.gallery?.[0];
}

export function formatPriceRange(priceRange?: string | null): string {
  if (!priceRange) return '';
  if (priceRange === '$') return 'Giá rẻ';
  if (priceRange === '$$') return 'Trung bình';
  if (priceRange === '$$$') return 'Cao';
  return priceRange;
}

export function getCategoryLabel(r: any): string | undefined {
  // Nếu backend đã trả categoryName
  if (r.categoryName) return r.categoryName;

  // Nếu ông có map categoryId -> name, thì thay bằng:
  // return categoriesById[r.categoryId];

  // fallback: không hiện gì
  return undefined;
}


type CategoryMeta = {
  name?: string;
  slug?: string;
  icon?: string;
  color?: string;
};

export function getCategoryMeta(r: any): CategoryMeta {
  const cat: any = (r as any).category || {};
  const name = (r as any).categoryName ?? cat.name;
  const slug = (r as any).categorySlug ?? cat.slug;
  const icon = cat.extra?.icon;
  const color = cat.extra?.color;
  return { name, slug, icon, color };
}

export const DAY_LABELS: { key: string; label: string }[] = [
  { key: "Mon", label: "Thứ 2" },
  { key: "Tue", label: "Thứ 3" },
  { key: "Wed", label: "Thứ 4" },
  { key: "Thu", label: "Thứ 5" },
  { key: "Fri", label: "Thứ 6" },
  { key: "Sat", label: "Thứ 7" },
  { key: "Sun", label: "Chủ nhật" },
];

export function getRestaurantCoordsFromData(r: any | null) {
  if (!r) return null;
  const lat =
    (r as any).coordinates?.lat ??
    (r as any).location?.coordinates?.[1] ??
    r.address?.coordinates?.[1];
  const lng =
    (r as any).coordinates?.lng ??
    (r as any).location?.coordinates?.[0] ??
    r.address?.coordinates?.[0];

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat: lat as number, lng: lng as number };
}


export function formatDistanceText(km: number | null): string | null {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(2)} km`;
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}