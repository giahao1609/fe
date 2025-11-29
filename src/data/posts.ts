// src/data/posts.ts
export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  cover: string; // đã chuẩn hoá CDN (i0.wp.com) để tối ưu cache
  author: { name: string; avatar?: string };
  tags: string[];
  category?: string;
  publishedAt: string; // ISO
  readingTime?: number;
};

export const posts: Post[] = [
  {
    slug: "10-quan-lau-am-bung-trong-mua",
    title: "10 quán lẩu “ấm bụng” trời mưa – note ngay kẻo quên",
    excerpt:
      "Danh sách lẩu quốc dân, giá dễ chịu, nhiều chi nhánh – quá hợp cho ngày mưa se lạnh.",
    content: [
      "Những ngày mưa kéo dài, một nồi lẩu nóng hổi là lựa chọn hoàn hảo.",
      "Tổng hợp 10 quán lẩu dễ đi, giá ổn, phù hợp nhóm bạn hoặc gia đình.",
      "Mẹo: đặt bàn sớm và canh khung giờ ưu đãi để tiết kiệm chi phí.",
    ],
    cover:
      "https://cdn.xanhsm.com/2025/01/2ea19145-quan-cafe-chup-hinh-dep-o-tphcm-3.jpg",
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
      "Danh sách ưu tiên vị trí trung tâm, mở sớm, và giá “mềm”.",
    ],
    cover:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJVowz2Qp_pg4obJVJCtb-ITnbqjWtHwQmROiFKOWi6z5jwP3Z_htlJHDYANUndu0rs82d43Lry0VBNxCCz-FjlnlkxAwmBlSOfax6PDqt&s=10",
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
      "Không gian, ánh sáng, và độ ồn là 3 yếu tố quan trọng khi chọn quán cafe.",
      "Ổ cắm điện và wifi ổn định cũng rất cần thiết.",
    ],
    cover:
      "https://cdn.xanhsm.com/2025/01/97f9dba2-quan-cafe-chup-hinh-dep-o-tphcm-2.jpg",
    author: { name: "HTQ x MN" },
    tags: ["cafe", "work-friendly", "check-in"],
    category: "Cafe",
    publishedAt: "2025-11-06T15:10:00.000Z",
  },
  {
    slug: "combo-trua-no-ne-chi-tu-39k",
    title: "Combo trưa no nê chỉ từ 39k",
    excerpt:
      "Tổng hợp combo trưa giá tốt quanh trung tâm, tiện đi làm, giao nhanh.",
    content: [
      "Bữa trưa tiết kiệm thời gian nhưng vẫn đảm bảo dinh dưỡng.",
      "Gợi ý combo món Việt, Nhật, Hàn phù hợp nhiều khẩu vị.",
    ],
    cover:
      "https://i0.wp.com/images.unsplash.com/photo-1544025162-d76694265947?w=1600&h=900&crop=1&auto=format&fit=crop&quality=85&ssl=1",
    author: { name: "FoodTour Team" },
    tags: ["cơm trưa", "combo", "ăn nhanh"],
    category: "Ăn trưa",
    publishedAt: "2025-11-04T11:20:00.000Z",
  },
  {
    slug: "lau-nuong-cuoi-tuan-cho-nhom-ban",
    title: "Lẩu/Nướng cuối tuần cho nhóm bạn",
    excerpt:
      "Một số quán rộng rãi, đặt bàn dễ, giá hợp lý cho nhóm 4–6 người.",
    content: [
      "Cuối tuần là thời điểm lý tưởng tụ tập, thưởng thức lẩu nướng.",
      "Gợi ý các quán có không gian thoải mái và combo tiết kiệm.",
    ],
    cover:
      "https://i0.wp.com/images.unsplash.com/photo-1543353071-10c8ba85a904?w=1600&h=900&crop=1&auto=format&fit=crop&quality=85&ssl=1",
    author: { name: "Pika" },
    tags: ["lẩu", "nướng", "đi nhóm"],
    category: "Gợi ý món",
    publishedAt: "2025-11-01T17:45:00.000Z",
  },
  {
    slug: "an-vat-gio-tan-tam",
    title: "Ăn vặt giờ tan tầm — vừa nhanh vừa vui",
    excerpt:
      "Danh sách ăn vặt dễ tìm, đứng ăn nhanh, giá “hạt dẻ”, hợp sau giờ làm.",
    content: [
      "Tổng hợp các món ăn vặt đường phố nổi bật quanh trung tâm.",
      "Có thể ghé nhanh trong 10–15 phút, không lo kẹt xe.",
    ],
    cover:
      "https://cdn.xanhsm.com/2025/01/97f9dba2-quan-cafe-chup-hinh-dep-o-tphcm-2.jpg",
    author: { name: "FoodTour Team" },
    tags: ["ăn vặt", "street-food"],
    category: "Ăn vặt",
    publishedAt: "2025-11-03T16:05:00.000Z",
  },
  {
    slug: "buffet-hai-san-dang-co-uu-dai",
    title: "Buffet hải sản đang có ưu đãi — săn ngay!",
    excerpt:
      "Một vài nhà hàng buffet hải sản giảm giá theo khung giờ hoặc ngày cố định.",
    content: [
      "Lưu ý khung giờ vàng để được mức giá tốt nhất.",
      "Một số nơi yêu cầu đặt cọc/đặt bàn trước.",
    ],
    cover:
      "https://i0.wp.com/images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&h=900&crop=1&auto=format&fit=crop&quality=85&ssl=1",
    author: { name: "HTQ x MN" },
    tags: ["buffet", "hải sản", "ưu đãi"],
    category: "Ưu đãi",
    publishedAt: "2025-10-31T19:30:00.000Z",
  },
  {
    slug: "quan-chay-sach-gan-trung-tam",
    title: "Quán chay sạch gần trung tâm — healthy mà ngon",
    excerpt:
      "Gợi ý 5 quán chay sạch, không quá đông, có chỗ ngồi thoải mái.",
    content: [
      "Ưu tiên quán có menu rõ nguồn gốc và ít dầu mỡ.",
      "Một vài nơi có bán theo set trưa, tiện lợi.",
    ],
    cover:
      "https://cdn.pixabay.com/photo/2021/01/08/06/32/cafe-5899078_1280.jpg",
    author: { name: "FoodTour Team" },
    tags: ["ăn chay", "healthy"],
    category: "Gợi ý món",
    publishedAt: "2025-10-29T09:15:00.000Z",
  },
  {
    slug: "cafe-work-friendly-co-nhieu-o-cam",
    title: "Cafe work-friendly — có nhiều ổ cắm & wifi ổn",
    excerpt:
      "3 quán cafe phù hợp làm việc một buổi dài, ổ cắm đủ, wifi mạnh.",
    content: [
      "Không gian yên tĩnh và ghế ngồi thoải mái rất quan trọng.",
      "Nên đi sớm để chọn vị trí gần ổ cắm.",
    ],
    cover:
      "https://mytour.vn/vi/blog/bai-viet/thuong-thuc-ve-dep-cua-ly-cafe-bo-suu-tap-hinh-anh-ly-cafe-dep-nhat.html",
    author: { name: "Pika" },
    tags: ["cafe", "work-friendly"],
    category: "Cafe",
    publishedAt: "2025-11-05T13:50:00.000Z",
  },
];
