// src/data/mock.ts
export type Restaurant = {
  _id: string;
  name: string;
  address: string;
  district: string;
  category: string;
  priceRange: string;        // "50k - 100k", "200k+", ...
  latitude: number;
  longitude: number;
  description?: string;
  directions?: string;
  scheduleText?: string;
  banner: string[];          // ảnh cover (có thể 1)
  gallery: string[];         // ảnh slide
  menuImages: string[];      // ảnh menu
};

export type Deal = {
  id: string;
  restaurantId: string;
  title: string;
  details: string;
  percentOff?: number;
  validFrom?: string;  // ISO
  validUntil?: string; // ISO
  tags?: string[];
  image?: string;
};

export type Collection = {
  id: string;
  title: string;
  subtitle?: string;
  cover: string;
  restaurantIds: string[];
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  publishedAt: string; // ISO
  author?: string;
};

const r = (len = 8) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");

// ======== RESTAURANTS ========
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    _id: "r_" + r(),
    name: "Bún Bò Huế O Sen",
    address: "52 Nguyễn Thị Minh Khai, Q.1, TP.HCM",
    district: "Quận 1",
    category: "Bún - Phở",
    priceRange: "45k - 70k",
    latitude: 10.78067,
    longitude: 106.70042,
    description: "Bún bò Huế chuẩn vị, nước lèo đậm đà, chả cua siêu chất.",
    directions: "Ngay cầu Thị Nghè rẽ phải 100m.",
    scheduleText: "06:00 – 14:00; 17:00 – 21:00",
    banner: ["https://images.unsplash.com/photo-1604908176997-43165105f1ab?q=80&w=1200&auto=format&fit=crop"],
    gallery: [
      "https://images.unsplash.com/photo-1605478367593-62676f8c84aa?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
    ],
    menuImages: ["https://images.unsplash.com/photo-1589131102973-3acb30b3b3b2?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    _id: "r_" + r(),
    name: "Cơm Tấm Sương Sương",
    address: "12 Trần Quang Diệu, Q.3, TP.HCM",
    district: "Quận 3",
    category: "Cơm",
    priceRange: "35k - 60k",
    latitude: 10.7862,
    longitude: 106.6833,
    description: "Sườn bì chả, mỡ hành thơm, nước mắm pha vừa miệng.",
    directions: "Cách vòng xoay Dân Chủ 300m.",
    scheduleText: "07:00 – 21:30",
    banner: ["https://images.unsplash.com/photo-1617195737490-97d640eb4bd1?q=80&w=1200&auto=format&fit=crop"],
    gallery: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566438480900-0609be27a4be?q=80&w=1200&auto=format&fit=crop",
    ],
    menuImages: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    _id: "r_" + r(),
    name: "Lẩu Thái Chua Cay 1999",
    address: "186 Phan Xích Long, Phú Nhuận, TP.HCM",
    district: "Phú Nhuận",
    category: "Lẩu",
    priceRange: "150k - 300k",
    latitude: 10.801,
    longitude: 106.686,
    description: "Lẩu Thái đậm đà, hải sản tươi, không gian nhóm.",
    directions: "Đối diện ngân hàng ACB.",
    scheduleText: "10:30 – 23:30",
    banner: ["https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop"],
    gallery: [
      "https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
    ],
    menuImages: ["https://images.unsplash.com/photo-1617195737332-6d2c2e07d6f8?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    _id: "r_" + r(),
    name: "Phở Thìn 13 Lò Đúc – CN SG",
    address: "25 Nguyễn Trãi, Q.1, TP.HCM",
    district: "Quận 1",
    category: "Bún - Phở",
    priceRange: "60k - 90k",
    latitude: 10.7707,
    longitude: 106.6948,
    description: "Phở bò áp chảo lừng danh, nước dùng trong, dậy mùi gừng.",
    directions: "Gần công viên 23/9.",
    scheduleText: "06:00 – 22:00",
    banner: ["https://images.unsplash.com/photo-1607328874071-45a9cd6004f9?q=80&w=1200&auto=format&fit=crop"],
    gallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
    ],
    menuImages: ["https://images.unsplash.com/photo-1617195737490-97d640eb4bd1?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    _id: "r_" + r(),
    name: "Ốc Mẹt Nướng Đêm",
    address: "379 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM",
    district: "Bình Thạnh",
    category: "Hải sản",
    priceRange: "80k - 200k",
    latitude: 10.805,
    longitude: 106.712,
    description: "Ốc nướng mọi, bơ tỏi, mỡ hành, mở tới 1h sáng.",
    directions: "Qua cầu Bình Triệu 700m.",
    scheduleText: "17:00 – 01:00",
    banner: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop"],
    gallery: [
      "https://images.unsplash.com/photo-1481931098730-318b6f776db0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579884971717-73c8da8a47fe?q=80&w=1200&auto=format&fit=crop",
    ],
    menuImages: ["https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1200&auto=format&fit=crop"],
  },
  {
    _id: "r_" + r(),
    name: "Cà phê Lặng",
    address: "42 Phạm Ngọc Thạch, Q.3, TP.HCM",
    district: "Quận 3",
    category: "Cafe",
    priceRange: "30k - 70k",
    latitude: 10.7829,
    longitude: 106.6958,
    description: "Không gian yên tĩnh, bàn rộng làm việc, wifi mạnh.",
    directions: "Đối diện trường Lê Quý Đôn.",
    scheduleText: "07:00 – 22:30",
    banner: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop"],
    gallery: [
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop",
    ],
    menuImages: ["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1200&auto=format&fit=crop"],
  },
];

// ======== DEALS (ƯU ĐÃI) ========
export const MOCK_DEALS: Deal[] = [
  {
    id: "d_" + r(),
    restaurantId: MOCK_RESTAURANTS[0]._id,
    title: "Giảm 20% Combo bún bò + trà đá",
    details: "Áp dụng khung giờ 10:00 – 12:00 các ngày trong tuần.",
    percentOff: 20,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 1000 * 3600 * 24 * 14).toISOString(),
    tags: ["bún-bò", "buổi-trưa"],
    image: "https://images.unsplash.com/photo-1604908176997-43165105f1ab?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "d_" + r(),
    restaurantId: MOCK_RESTAURANTS[2]._id,
    title: "Mua 3 tặng 1 set lẩu mini",
    details: "Áp dụng nhóm đi 4, tối Thứ 6 – CN.",
    percentOff: 25,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 1000 * 3600 * 24 * 7).toISOString(),
    tags: ["nhóm-bạn", "cuối-tuần"],
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "d_" + r(),
    restaurantId: MOCK_RESTAURANTS[5]._id,
    title: "Free bánh croissant khi gọi cà phê máy",
    details: "Từ 08:00 – 11:00 mỗi ngày.",
    percentOff: 0,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 1000 * 3600 * 24 * 21).toISOString(),
    tags: ["coffee", "sáng"],
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop",
  },
];

// ======== COLLECTIONS (BỘ SƯU TẬP) ========
export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "c_" + r(),
    title: "Bún bò & Phở cho bữa sáng",
    subtitle: "Dậy vị, ấm bụng, nạp năng lượng ngày mới",
    cover: "https://images.unsplash.com/photo-1607328874071-45a9cd6004f9?q=80&w=1200&auto=format&fit=crop",
    restaurantIds: [MOCK_RESTAURANTS[0]._id, MOCK_RESTAURANTS[3]._id],
  },
  {
    id: "c_" + r(),
    title: "Quán mở khuya",
    subtitle: "Nghỉ muộn mới ăn? Không vấn đề!",
    cover: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
    restaurantIds: [MOCK_RESTAURANTS[2]._id, MOCK_RESTAURANTS[4]._id],
  },
  {
    id: "c_" + r(),
    title: "Cafe ngồi làm việc",
    subtitle: "Yên tĩnh, bàn rộng, wifi khoẻ",
    cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop",
    restaurantIds: [MOCK_RESTAURANTS[5]._id],
  },
];

// ======== BLOG (HOT BLOG) ========
export const MOCK_BLOGS: BlogPost[] = [
  {
    id: "b_" + r(),
    slug: "top-5-bun-bo-hue-giua-long-sai-gon",
    title: "Top 5 Bún Bò Huế giữa lòng Sài Gòn",
    excerpt: "Tổng hợp các quán bún bò chuẩn vị, nước dùng đậm đà...",
    cover: "https://images.unsplash.com/photo-1604908176997-43165105f1ab?q=80&w=1200&auto=format&fit=crop",
    publishedAt: new Date().toISOString(),
    author: "FoodMap Team",
  },
  {
    id: "b_" + r(),
    slug: "dia-diem-an-dem-binh-thanh",
    title: "Bình Thạnh ăn đêm: ốc nướng, cháo khuya, lẩu mini",
    excerpt: "Muộn rồi mới đói? Đây là danh sách dành cho bạn...",
    cover: "https://images.unsplash.com/photo-1579884971717-73c8da8a47fe?q=80&w=1200&auto=format&fit=crop",
    publishedAt: new Date().toISOString(),
    author: "Pika",
  },
];
