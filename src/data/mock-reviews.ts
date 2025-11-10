export type MockReview = {
  _id: string;
  restaurantId: string; // map với _id trong mock-restaurants
  user: { name: string; avatar?: string };
  rating: number; // 1..5
  content: string;
  images?: string[];
  createdAt: string;
};

export const mockReviews: MockReview[] = [
  {
    _id: "rv1",
    restaurantId: "r1",
    user: { name: "Minh An" },
    rating: 5,
    content: "Lẩu thơm, nhiều topping, nước chấm ngon. Đi nhóm rất hợp!",
    images: [
      "https://i0.wp.com/images.unsplash.com/photo-1543353071-10c8ba85a904?w=1280&h=960&crop=1&auto=format&fit=crop&q=85&ssl=1",
    ],
    createdAt: "2025-11-01T11:00:00.000Z",
  },
  {
    _id: "rv2",
    restaurantId: "r2",
    user: { name: "Pika" },
    rating: 4,
    content: "Bánh mì giòn, pate béo. Đi làm buổi sáng tiện.",
    createdAt: "2025-11-03T08:20:00.000Z",
  },
];
