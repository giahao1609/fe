// src/types/owner.ts
export type StoreStatus = "draft" | "published" | "archived";

export interface StoreProfile {
  id: string;
  name: string;
  address: string;
  district: string;
  phone?: string;
  email?: string;
  website?: string;
  priceRange?: string; // "50k - 100k"
  description?: string;
  tags: string[];      // ["bún bò", "đặc sản", ...]
  status: StoreStatus;
  bannerUrl?: string;
  gallery: string[];
  openingHours: OpeningHours;  // key theo thứ
}

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface OpeningHours {
  [day in Weekday]: Array<{ open: string; close: string }>; // ví dụ [{ open:"06:00", close:"14:00"}]
}

export interface CommentItem {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;      // 1..5
  text: string;
  createdAt: string;   // ISO
  approved: boolean;
  reply?: string;
}

export interface BlogPostRef {
  id: string;
  title: string;
  slug: string;
  banner?: string;
  publishedAt?: string;
  pinned?: boolean;
}

export interface DashboardSnapshot {
  totalComments: number;
  pendingComments: number;
  avgRating: number;
  totalPosts: number;
}
export interface DashboardPoint {
  date: string;       // YYYY-MM-DD
  comments: number;   // số bình luận trong ngày
  ratingAvg: number;  // điểm TB trong ngày (0..5)
  posts: number;      // số bài viết publish trong ngày
}

export interface OwnerDashboardData {
  snapshot: DashboardSnapshot;
  series14d: DashboardPoint[]; // 14 ngày gần nhất
}