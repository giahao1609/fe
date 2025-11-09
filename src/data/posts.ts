export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[]; // mỗi đoạn 1 paragraph
  cover: string;
  author: { name: string; avatar?: string };
  tags: string[];
  category?: string;
  publishedAt: string; // ISO
  readingTime?: number; // sẽ tự tính nếu thiếu
};

export const posts: Post[] = [
  {
    slug: "10-quan-lau-am-bung-trong-mua",
    title: "10 quán lẩu “ấm bụng” trời mưa – note ngay kẻo quên",
    excerpt:
      "Danh sách lẩu quốc dân, giá dễ chịu, nhiều chi nhánh – quá hợp cho ngày mưa se lạnh.",
    content: [
      "Những ngày mưa kéo dài, một nồi lẩu nóng hổi là sự lựa chọn không thể hợp lý hơn.",
      "Bài viết này tổng hợp 10 quán lẩu dễ đi, giá ổn, menu đa dạng, phù hợp đi nhóm bạn hoặc gia đình.",
      "Mẹo nhỏ: đặt bàn sớm và canh các khung giờ có ưu đãi để tiết kiệm chi phí.",
    ],
    cover: "/image/blog/lau-1.jpg",
    author: { name: "FoodTour Team", avatar: "/image/default-avatar.jpg" },
    tags: ["lẩu", "trời mưa", "đi nhóm"],
    category: "Gợi ý món",
    publishedAt: "2025-11-02T08:30:00.000Z",
  },
  {
    slug: "banh-mi-sang-chi-tu-15k",
    title: "Bánh mì sáng chỉ từ 15k – rẻ, nhanh, ngon",
    excerpt:
      "Gợi ý các xe bánh mì và tiệm take-away mở sớm, tiện đi làm buổi sáng.",
    content: [
      "Bánh mì là món quốc dân, tiện và đủ chất cho buổi sáng bận rộn.",
      "Danh sách dưới đây ưu tiên vị trí trung tâm, mở sớm, và giá “mềm”.",
    ],
    cover: "/image/blog/banhmi-1.jpg",
    author: { name: "Pika" },
    tags: ["bánh mì", "ăn sáng", "take-away"],
    category: "Ăn nhanh",
    publishedAt: "2025-10-28T06:00:00.000Z",
  },
  {
    slug: "ca-phe-view-dep-check-in-lien-tay",
    title: "Cafe view đẹp — check-in liền tay",
    excerpt:
      "3 quán cafe không gian rộng, ánh sáng đẹp, phù hợp làm việc và chụp ảnh.",
    content: [
      "Không gian, ánh sáng, và độ ồn là 3 yếu tố quan trọng khi chọn quán cafe để làm việc.",
      "Ngoài ra, ổ cắm điện và wifi ổn định cũng rất cần thiết.",
    ],
    cover: "/image/blog/cafe-1.jpg",
    author: { name: "HTQ x MN" },
    tags: ["cafe", "work-friendly", "check-in"],
    category: "Cafe",
    publishedAt: "2025-11-06T15:10:00.000Z",
  },
];
