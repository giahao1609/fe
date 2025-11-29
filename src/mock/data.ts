import type {
  AdminStats,
  BlogPost,
  ChatbotFile,
  Collection,
  Deal,
  Restaurant,
} from "./types";

const IMG = (p: string) => `https://images.unsplash.com/${p}`;

// ===================== Restaurants (fake) =====================
export const restaurantsSeed: Restaurant[] = [
  {
    _id: "rs_1001",
    name: "Bún Bò Gánh Nguyễn Du",
    address: "110 Nguyễn Du, Q.1, TP.HCM",
    district: "Quận 1",
    category: "Vietnamese",
    priceRange: "50K - 80K",
    latitude: 10.77935,
    longitude: 106.69583,
    description:
      "Bún bò chuẩn vị, nước dùng đậm, topping phong phú. Không gian sạch sẽ.",
    directions: "Ngay công viên Tao Đàn, đối diện số 115.",
    scheduleText: "06:00 – 14:00 & 16:00 – 21:00 (CN mở 06:00 – 14:00)",
    banner: [IMG("photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format")],
    gallery: [
      IMG("photo-1526318472351-c75fcf070305?q=80&w=800&auto=format"),
      IMG("photo-1521017432531-fbd92d56f65e?q=80&w=800&auto=format"),
    ],
    menuImages: [
      IMG("photo-1533777324565-a040eb52fac1?q=80&w=800&auto=format"),
    ],
  },
  {
    _id: "rs_1002",
    name: "Cơm Tấm Ba Ghiền",
    address: "84 Đặng Văn Ngữ, Q.Phú Nhuận",
    district: "Phú Nhuận",
    category: "Vietnamese",
    priceRange: "45K - 90K",
    latitude: 10.79694,
    longitude: 106.67671,
    description:
      "Sườn bì chả trứ danh, nước mắm kẹo đặc trưng, đông khách vào giờ trưa.",
    directions: "Cách ngã tư Phạm Văn Hai ~150m.",
    scheduleText: "07:00 – 21:00 (mở cả tuần)",
    banner: [IMG("photo-1544025162-d76694265947?q=80&w=1200&auto=format")],
    gallery: [
      IMG("photo-1526318472351-c75fcf070305?q=80&w=800&auto=format"),
      IMG("photo-1544025162-d76694265947?q=80&w=800&auto=format"),
    ],
    menuImages: [
      IMG("photo-1512058564366-18510be2db19?q=80&w=800&auto=format"),
    ],
  },
  {
    _id: "rs_1003",
    name: "The Coffee House – HBT",
    address: "40 Hàm Nghi, Q.1, TP.HCM",
    district: "Quận 1",
    category: "Coffee",
    priceRange: "35K - 75K",
    latitude: 10.77104,
    longitude: 106.70142,
    description:
      "Không gian hiện đại, wifi mạnh, hợp làm việc. Signature Cold Brew ngon.",
    directions: "Gần ga Bến Thành mới.",
    scheduleText: "07:00 – 22:30",
    banner: [IMG("photo-1511920170033-f8396924c348?q=80&w=1200&auto=format")],
    gallery: [
      IMG("photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format"),
      IMG("photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format&sat=-50"),
    ],
    menuImages: [
      IMG("photo-1521305916504-4a1121188589?q=80&w=800&auto=format"),
    ],
  },
];

// ===================== Deals / Ưu đãi =====================
export const dealsSeed: Deal[] = [
  {
    id: "deal_01",
    title: "Mua 2 tặng 1 – Cold Brew",
    description: "Áp dụng 14–20h mỗi ngày tại chi nhánh Hàm Nghi.",
    restaurantId: "rs_1003",
    discountPercent: 33,
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
    badge: "HOT",
  },
  {
    id: "deal_02",
    title: "Combo trưa 69K",
    description: "Cơm sườn + canh + trà đá. Áp dụng ngày thường.",
    restaurantId: "rs_1002",
    discountPercent: 15,
    validUntil: new Date(Date.now() + 3 * 86400000).toISOString(),
    badge: "LIMITED",
  },
];

// ===================== Collections / Bộ sưu tập =====================
export const collectionsSeed: Collection[] = [
  {
    id: "col_01",
    title: "Quán gần chợ Bến Thành",
    cover: IMG("photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format"),
    restaurantIds: ["rs_1001", "rs_1003"],
    description: "Đi một vòng là đủ bữa sáng – xế – cà phê.",
  },
  {
    id: "col_02",
    title: "Ăn trưa dưới 100K",
    cover: IMG("photo-1544025162-d76694265947?q=80&w=1200&auto=format"),
    restaurantIds: ["rs_1002", "rs_1001"],
    description: "No bụng – nhẹ ví – lên năng lượng buổi chiều.",
  },
];

// ===================== Hot / Trending (dùng deals + sort) =====================
export const hotSeed = dealsSeed.map((d) => ({
  ...d,
  hotScore: d.badge === "HOT" ? 100 : 70,
}));

// ===================== Blog =====================
export const blogsSeed: BlogPost[] = [
  {
    id: "blog_01",
    title: "5 Quán bún bò “đáng thử” ở trung tâm Sài Gòn",
    slug: "5-quan-bun-bo-dang-thu-o-trung-tam-sai-gon",
    cover: IMG("photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format"),
    excerpt:
      "Tổng hợp vài địa chỉ bún bò nước dùng trong, topping đầy đủ, phù hợp bữa sáng.",
    publishedAt: new Date().toISOString(),
    tags: ["bun-bo", "quan-ngon", "q1"],
  },
  {
    id: "blog_02",
    title: "3 quán Coffee làm việc yên tĩnh quanh Bến Thành",
    slug: "3-quan-coffee-lam-viec-yen-tinh-quanh-ben-thanh",
    cover: IMG("photo-1511920170033-f8396924c348?q=80&w=1200&auto=format"),
    excerpt:
      "Ổ cắm đầy, wifi mạnh, ghế ngồi dễ chịu — dành cho những buổi deepwork.",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ["coffee", "work", "q1"],
  },
];

// ===================== Chatbot Files =====================
export const chatbotFilesSeed: ChatbotFile[] = [
  {
    name: "docs/foodmap/guide-v1.pdf",
    url: "https://example.com/files/guide-v1.pdf",
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    status: "indexed",
  },
  {
    name: "menu/rs_1002/menu-2025-11.pdf",
    url: "https://example.com/files/menu-2025-11.pdf",
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
    status: "pending",
  },
];

// ===================== Admin Stats =====================
export const adminStatsSeed: AdminStats = {
  restaurants: restaurantsSeed.length,
  reviews: 128, // số giả lập
  users: 4520,
  files: chatbotFilesSeed.length,
  reviewChart: Array.from({ length: 10 }).map((_, i) => ({
    date: new Date(Date.now() - (9 - i) * 86400000)
      .toISOString()
      .slice(0, 10),
    reviews: Math.round(30 + Math.random() * 40),
  })),
  chatbotChart: Array.from({ length: 10 }).map((_, i) => ({
    date: new Date(Date.now() - (9 - i) * 86400000)
      .toISOString()
      .slice(0, 10),
    chats: Math.round(50 + Math.random() * 80),
  })),
};
