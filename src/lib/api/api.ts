import axios from "axios";

// ✅ Tự động lấy BASE_URL từ .env (nếu có), fallback localhost
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ✅ Tạo instance mặc định
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // bật true nếu backend dùng cookie auth
});

// ✅ Thêm interceptor tự động gắn token (nếu có)
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Xử lý lỗi tập trung
api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("❌ API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
