// data/slides.ts
import type { Slide } from "@/components/common/BannerSlider";

export const slides: Slide[] = [
  {
    id: 1,
    title: "Giảm 40% buffet lẩu cuối tuần",
    subtitle: "Áp dụng tại 12 chi nhánh trong tháng này",
    ctaText: "Đặt bàn ngay",
    ctaHref: "/categories/deals",
    image:
      "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1600&q=80",
    align: "left",
  },
  {
    id: 2,
    title: "Cafe view đẹp — check-in nhận voucher 20k",
    subtitle: "Ưu đãi áp dụng hôm nay",
    ctaText: "Khám phá quán",
    ctaHref: "/categories/nearby",
    image:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1600&q=80",
    align: "center",
  },
  {
    id: 3,
    title: "Combo trưa no nê chỉ từ 39k",
    subtitle: "Món Việt, Nhật, Hàn đa dạng",
    ctaText: "Xem menu",
    ctaHref: "/categories/restaurants",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80",
    align: "right",
  },
];
