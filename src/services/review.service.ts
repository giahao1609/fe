import { ApiService } from "./api.service";
import { NotifyService } from "./notify.service";

export type Review = {
  _id: string;
  restaurantId: string;

  content: string;
  rating: number; // 1–5

  images?: string[]; // các path/key hoặc URL
  imagesSigned?: string[]; // nếu backend có trả signed URL

  createdAt?: string;
  updatedAt?: string;
};

export type CreateReviewPayload = {
  restaurantId: string;
  content: string;
  rating: number;      // frontend dùng number, khi gửi sẽ convert sang string
  images?: File[];     // file upload (review1.jpg, review2.jpg...)
};

export const ReviewService = {
  /**
   * GET /api/v1/restaurants/:restaurantId/reviews
   * - Lấy danh sách bình luận của 1 nhà hàng
   */
  async listByRestaurant(restaurantId: string): Promise<Review[]> {
    if (!restaurantId) throw new Error("restaurantId is required");

    const res = await ApiService.get<
      Review[] | { items?: Review[] } | { data?: Review[] }
    >(`/restaurants/${restaurantId}/reviews`);

    if (Array.isArray(res)) return res;

    if (Array.isArray((res as any).items)) {
      return (res as any).items;
    }

    if (Array.isArray((res as any).data)) {
      return (res as any).data;
    }

    return [];
  },

  /**
   * POST /api/v1/restaurants/:restaurantId/reviews
   *
   * curl tương ứng:
   * curl --location 'https://api.food-map.online/api/v1/restaurants/RESTAURANT_ID/reviews' \
   * --header 'Accept: application/json' \
   * --form 'userId="USER_123"' \
   * --form 'content="Trà sữa ngon, ship nhanh."' \
   * --form 'rating="5"' \
   * --form 'images=@"/path/review1.jpg"' \
   * --form 'images=@"/path/review2.jpg"'
   */
  async createForRestaurant(payload: CreateReviewPayload): Promise<Review> {
    const { restaurantId, content, rating, images } = payload;

    if (!restaurantId) throw new Error("restaurantId is required");
    if (!content?.trim()) throw new Error("Nội dung đánh giá không được trống");
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error("Điểm rating phải từ 1 đến 5");
    }

    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("rating", String(rating)); // backend đang nhận dạng string

    if (images && images.length > 0) {
      for (const file of images) {
        formData.append("images", file);
      }
    }

    const review = await ApiService.postFormData<Review>(
      `/restaurants/${restaurantId}/reviews`,
      formData,
    );

    NotifyService.success("Đã gửi đánh giá của bạn, cảm ơn bạn!");
    return review;
  },
};
