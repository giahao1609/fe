import type { Collection } from "@/components/collections/CollectionCard";

export const sampleCollections: Collection[] = [
  {
    _id: "c1",
    slug: "lau-nuong-cuoi-tuan",
    title: "Lẩu/Nướng cuối tuần",
    cover:
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_2_02db0ace83.jpg",
    description:
      "Tuyển chọn quán lẩu/nướng phù hợp đi nhóm 4–6 người, giá hợp lý.",
    tags: ["lẩu", "nướng", "nhóm bạn"],
    district: "Q1",
    category: "Lẩu/Nướng",
    itemsCount: 16,
    featuredScore: 95,
    createdAt: "2025-10-01T10:00:00.000Z",
    updatedAt: "2025-11-01T10:00:00.000Z",
  },
  {
    _id: "c2",
    slug: "ca-phe-view-dep",
    title: "Cà phê view đẹp",
    cover:
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_1_4e4d62c337.jpg",
    description: "Không gian chill, hợp làm việc nhẹ và hẹn hò.",
    tags: ["cafe", "work", "hẹn hò"],
    district: "Phú Nhuận",
    category: "Cà phê",
    itemsCount: 22,
    featuredScore: 88,
    createdAt: "2025-08-10T10:00:00.000Z",
    updatedAt: "2025-10-28T10:00:00.000Z",
  },
  {
    _id: "c3",
    slug: "an-vat-gio-tan-tam",
    title: "Ăn vặt giờ tan tầm",
    cover:
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_6_88ca431418.jpg",
    description: "Ăn nhanh–ngon–rẻ, tiện ở gần trung tâm.",
    tags: ["ăn vặt", "street-food"],
    district: "Q3",
    category: "Ăn vặt",
    itemsCount: 18,
    featuredScore: 90,
    createdAt: "2025-09-05T10:00:00.000Z",
    updatedAt: "2025-11-03T10:00:00.000Z",
  },
];
