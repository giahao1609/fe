// src/lib/api/owner.ts
import type {
  StoreProfile,
  CommentItem,
  BlogPostRef,
  DashboardSnapshot,
} from "@/types/owner";

/** ===================== FAKE MODE ===================== **/
const FAKE = process.env.NEXT_PUBLIC_FAKE_MODE === "1";

/** ===================== FAKE DB ===================== **/
let FAKE_STORE: StoreProfile = {
  id: "store_001",
  name: "Bếp Nhà Ngon",
  address: "12 Nguyễn Trãi, Q.1, TP.HCM",
  district: "Quận 1",
  phone: "0901 234 567",
  email: "contact@bepnhangon.vn",
  website: "https://bepnhangon.vn",
  priceRange: "50k - 120k",
  description:
    "Quán ăn gia đình với các món Việt truyền thống, phù hợp nhóm bạn & gia đình.",
  tags: ["món Việt", "gia đình", "lẩu", "nướng"],
  status: "published",
  bannerUrl:
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200",
  gallery: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200",
  ],
  openingHours: {
    monday: [
      { open: "06:30", close: "14:00" },
      { open: "17:00", close: "21:00" },
    ],
    tuesday: [
      { open: "06:30", close: "14:00" },
      { open: "17:00", close: "21:00" },
    ],
    wednesday: [
      { open: "06:30", close: "14:00" },
      { open: "17:00", close: "21:00" },
    ],
    thursday: [
      { open: "06:30", close: "14:00" },
      { open: "17:00", close: "21:00" },
    ],
    friday: [
      { open: "06:30", close: "14:00" },
      { open: "17:00", close: "22:00" },
    ],
    saturday: [
      { open: "06:30", close: "14:00" },
      { open: "17:00", close: "22:00" },
    ],
    sunday: [{ open: "06:30", close: "14:00" }],
  },
};

let FAKE_COMMENTS: CommentItem[] = [
  {
    id: "c1",
    userName: "Nguyễn An",
    rating: 5,
    text: "Quán ngon, phục vụ thân thiện. Sẽ quay lại!",
    createdAt: new Date().toISOString(),
    approved: true,
    userAvatar: "https://i.pravatar.cc/64?img=11",
  },
  {
    id: "c2",
    userName: "Mai Trúc",
    rating: 4,
    text: "Không gian sạch sẽ, món lẩu ổn áp.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    approved: false,
    userAvatar: "https://i.pravatar.cc/64?img=22",
  },
];

let FAKE_POSTS: BlogPostRef[] = [
  {
    id: "p1",
    title: "5 món nhất định phải thử tại Bếp Nhà Ngon",
    slug: "5-mon-phai-thu-tai-bep-nha-ngon",
    banner:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200",
    publishedAt: new Date().toISOString(),
    pinned: true,
  },
  {
    id: "p2",
    title: "Câu chuyện thương hiệu: từ bếp nhà đến trái tim thực khách",
    slug: "cau-chuyen-thuong-hieu",
    banner:
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=1200",
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    pinned: false,
  },
];

/** ===================== Helpers cho dashboard series ===================== **/
type DashboardPoint = {
  date: string;       // YYYY-MM-DD
  comments: number;   // số bình luận trong ngày
  ratingAvg: number;  // 0..5
  posts: number;      // số bài viết publish trong ngày
};

export type OwnerDashboardData = {
  snapshot: DashboardSnapshot;
  series14d: DashboardPoint[];
};

function seededRand(seed: number) {
  let x = seed || 123456789;
  return () => {
    // xorshift32
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 10000) / 10000;
  };
}

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const da = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** ===================== STORE PROFILE ===================== **/
export async function getStoreProfile(): Promise<StoreProfile> {
  if (FAKE) return structuredClone(FAKE_STORE);

  // TODO: real API
  // const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/owner/store`, { cache: "no-store" });
  // return res.json();
  return structuredClone(FAKE_STORE);
}

export async function updateStoreProfile(
  input: StoreProfile
): Promise<StoreProfile> {
  if (FAKE) {
    FAKE_STORE = structuredClone(input);
    return FAKE_STORE;
  }
  // TODO: real API (PUT)
  return structuredClone(input);
}

/** ===================== COMMENTS ===================== **/
export async function getComments(): Promise<CommentItem[]> {
  if (FAKE) return structuredClone(FAKE_COMMENTS);

  // TODO: real API
  return structuredClone(FAKE_COMMENTS);
}

export async function approveComment(
  id: string,
  approved: boolean
): Promise<void> {
  if (FAKE) {
    FAKE_COMMENTS = FAKE_COMMENTS.map((c) =>
      c.id === id ? { ...c, approved } : c
    );
    return;
  }
  // TODO: real API
}

export async function replyComment(id: string, reply: string): Promise<void> {
  if (FAKE) {
    FAKE_COMMENTS = FAKE_COMMENTS.map((c) =>
      c.id === id ? { ...c, reply } : c
    );
    return;
  }
  // TODO: real API
}

export async function deleteComment(id: string): Promise<void> {
  if (FAKE) {
    FAKE_COMMENTS = FAKE_COMMENTS.filter((c) => c.id !== id);
    return;
  }
  // TODO: real API
}

/** ===================== RELATED POSTS ===================== **/
export async function getRelatedPosts(): Promise<BlogPostRef[]> {
  if (FAKE) return structuredClone(FAKE_POSTS);

  // TODO: real API
  return structuredClone(FAKE_POSTS);
}

export async function upsertPost(input: BlogPostRef): Promise<BlogPostRef> {
  if (FAKE) {
    const idx = FAKE_POSTS.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      FAKE_POSTS[idx] = structuredClone(input);
      return structuredClone(FAKE_POSTS[idx]);
    } else {
      const newPost = { ...input, id: crypto.randomUUID() };
      FAKE_POSTS.unshift(newPost);
      return structuredClone(newPost);
    }
  }
  // TODO: real API
  return structuredClone(input);
}

export async function deletePost(id: string): Promise<void> {
  if (FAKE) {
    FAKE_POSTS = FAKE_POSTS.filter((p) => p.id !== id);
    return;
  }
  // TODO: real API
}

/** ===================== SNAPSHOT ===================== **/
export async function getSnapshot(): Promise<DashboardSnapshot> {
  if (FAKE) {
    const approved = FAKE_COMMENTS.filter((c) => c.approved);
    const avg =
      approved.length === 0
        ? 0
        : approved.reduce((s, c) => s + c.rating, 0) / approved.length;

    return {
      totalComments: FAKE_COMMENTS.length,
      pendingComments: FAKE_COMMENTS.filter((c) => !c.approved).length,
      avgRating: Math.round(avg * 10) / 10,
      totalPosts: FAKE_POSTS.length,
    };
  }

  // TODO: real API
  // const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/owner/snapshot`, { cache: "no-store" });
  // return res.json();

  // fallback an toàn nếu chưa có backend
  const approved = FAKE_COMMENTS.filter((c) => c.approved);
  const avg =
    approved.length === 0
      ? 0
      : approved.reduce((s, c) => s + c.rating, 0) / approved.length;

  return {
    totalComments: FAKE_COMMENTS.length,
    pendingComments: FAKE_COMMENTS.filter((c) => !c.approved).length,
    avgRating: Math.round(avg * 10) / 10,
    totalPosts: FAKE_POSTS.length,
  };
}

/** ===================== DASHBOARD (snapshot + 14 ngày series) ===================== **/
export async function getOwnerDashboard(): Promise<OwnerDashboardData> {
  const snapshot = await getSnapshot();

  // seed ổn định theo tên quán + số lượng dữ liệu
  const seedBase =
    (FAKE_STORE.name?.length ?? 7) * 97 +
    (FAKE_COMMENTS.length + FAKE_POSTS.length) * 13;
  const rand = seededRand(seedBase);

  const days = 14;
  const series: DashboardPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const r1 = rand();
    const r2 = rand();
    const r3 = rand();

    const comments = Math.round(r1 * 18 + r2 * 4); // 0..~22
    const ratingAvg = clamp(3.4 + r2 * 1.6, 0, 5); // quanh 4.2 ± 0.8
    const posts = r3 > 0.85 ? 2 : r3 > 0.65 ? 1 : 0; // hiếm khi đăng

    series.push({
      date: isoDay(d),
      comments,
      ratingAvg: Math.round(ratingAvg * 10) / 10,
      posts,
    });
  }

  return {
    snapshot,
    series14d: series,
  };
}
