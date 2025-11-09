import type { Slide } from "@/components/common/BannerSlider";

export const slides: Slide[] = [
  {
    id: 1,
    title: "Giảm 40% buffet lẩu cuối tuần",
    subtitle: "Áp dụng tại 12 chi nhánh trong tháng này",
    ctaText: "Đặt bàn ngay",
    ctaHref: "/categories/deals",
    image: "/image/slider/slide-1.jpg",
    align: "left",
  },
  {
    id: 2,
    title: "Cafe view đẹp — check-in nhận voucher 20k",
    subtitle: "Ưu đãi áp dụng hôm nay",
    ctaText: "Khám phá quán",
    ctaHref: "/categories/nearby",
    image: "/image/slider/slide-2.jpg",
    align: "center",
  },
  {
    id: 3,
    title: "Combo trưa no nê chỉ từ 39k",
    subtitle: "Món Việt, Nhật, Hàn đa dạng",
    ctaText: "Xem menu",
    ctaHref: "/categories/restaurants",
    image: "/image/slider/slide-3.jpg",
    align: "right",
  },
];
