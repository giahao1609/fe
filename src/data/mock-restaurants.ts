export type MockRestaurant = {
  _id: string;
  name: string;
  address: string;
  district?: string;
  priceRange?: string;
  banner?: string | string[];
};

export const mockRestaurants: MockRestaurant[] = [
  {
    _id: "r1",
    name: "Lẩu Thái MeKong",
    address: "123 Lê Lai, Q.1, TP.HCM",
    district: "Q1",
    priceRange: "120k - 250k/người",
    banner:
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_1_4e4d62c337.jpg",
  },
  {
    _id: "r2",
    name: "Bánh Mì Bụi Phố",
    address: "45 Trần Quang Diệu, Q.3",
    district: "Q3",
    priceRange: "15k - 35k",
    banner:
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_2_02db0ace83.jpg",
  },
  {
    _id: "r3",
    name: "Cơm Tấm Sương Sương",
    address: "27 Phan Xích Long, Phú Nhuận",
    district: "Phú Nhuận",
    priceRange: "35k - 65k",
    banner:
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_3_7f95f1e0e6.jpg",
  },
  {
    _id: "r4",
    name: "Cafe Moonlight",
    address: "90 Nguyễn Trãi, Q.5",
    district: "Q5",
    priceRange: "29k - 69k",
    banner:
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_4_2f5dc864b5.jpg",
  },
  {
    _id: "r5",
    name: "Bún Chả Hà Nội",
    address: "12 Pasteur, Q.1",
    district: "Q1",
    priceRange: "45k - 75k",
    banner:
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_5_7d7368c0f1.jpg",
  },
  {
    _id: "r6",
    name: "Mì Quảng Quê Nhà",
    address: "88 D3, Bình Thạnh",
    district: "Bình Thạnh",
    priceRange: "40k - 60k",
    banner:
      "https://simg.zalopay.com.vn/zlp-website/assets/quan_thai_6_88ca431418.jpg",
  },
];
