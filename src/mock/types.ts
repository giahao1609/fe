export type ObjectId = string;

export interface Restaurant {
  _id: ObjectId;
  name: string;
  address: string;
  district: string;
  category: string;        // VD: "Vietnamese", "Coffee", …
  priceRange: string;      // "50K - 100K"
  latitude: number;
  longitude: number;
  description?: string;
  directions?: string;
  scheduleText?: string;
  banner: string[];        // đường dẫn ảnh (hoặc signed URL)
  gallery: string[];
  menuImages: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  cover: string;
  excerpt: string;
  publishedAt: string;     // ISO
  tags: string[];
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  restaurantId: ObjectId;
  discountPercent?: number;
  validUntil?: string;     // ISO
  badge?: "HOT" | "NEW" | "LIMITED";
}

export interface Collection {
  id: string;
  title: string;
  cover: string;
  restaurantIds: ObjectId[];
  description?: string;
}

export interface ChatbotFile {
  name: string;    // path hoặc tên
  url: string;     // link tải
  createdAt: string;
  status?: "indexed" | "pending";
}

export interface AdminStats {
  restaurants: number;
  reviews: number;
  users: number;
  files: number;
  reviewChart: { date: string; reviews: number }[];
  chatbotChart: { date: string; chats: number }[];
}
