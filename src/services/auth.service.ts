import { ApiService } from "./api.service";
import { NotifyService } from "./notify.service";

export type AuthUser = {
  id: string;
  displayName: string;
  email: string;
  roles: string[];
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://api.food-map.online/api/v1";

export const AuthService = {
  async register(payload: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<AuthResponse> {
    try {
      const res = await ApiService.post<AuthResponse>("/auth/register", payload);

      if (res?.accessToken) {
        ApiService.setToken(res.accessToken);
        NotifyService.success("Đăng ký thành công");
      }

      return res;
    } catch (error: any) {
      console.error("Register error:", error);
      throw error;
    }
  },

  // Đăng nhập
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const res = await ApiService.post<AuthResponse>("/auth/login", payload);

      if (res?.accessToken) {
        ApiService.setToken(res.accessToken);
        NotifyService.success("Đăng nhập thành công");
      }

      return res;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Lấy thông tin me
  async me(): Promise<AuthUser | null> {
    try {
      const res = await ApiService.get<any>("/auth/me");

      const user: AuthUser = {
        id: res.id || res._id,
        displayName: res.displayName || "",
        email: res.email,
        roles: res.roles || [],
      };

      return user;
    } catch (error: any) {
      console.error("Get me error:", error);
      return null;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    const base = API_BASE_URL.replace(/\/+$/, "");
    const url = `${base}/auth/forgot-password`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // Backend lỗi (403, 400, ...) – lúc này thường có JSON, mình thử parse
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          // body rỗng / không phải JSON
        }

        const message = data?.message || "Có lỗi xảy ra khi gửi email khôi phục mật khẩu";

        if (message === "Please wait before requesting another code.") {
          NotifyService.error(
            "Bạn đã yêu cầu mã gần đây, vui lòng đợi thêm trước khi gửi lại."
          );
        } else {
          NotifyService.error(message);
        }

        throw new Error(message);
      }

      // ✅ Thành công: KHÔNG cần đọc body
      NotifyService.success(
        "Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn."
      );
    } catch (error: any) {
      console.error("Forgot password error:", error);
      if (!error?.message) {
        NotifyService.error("Có lỗi xảy ra khi gửi email khôi phục mật khẩu");
      }
      throw error;
    }
  },

  async resetPassword(payload: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<boolean> {
    try {
      const res = await ApiService.post<{ message?: string }>(
        "/auth/reset-password",
        payload
      );

      if ((res as any)?.message === "Password updated") {
        NotifyService.success(
          "Đã cập nhật mật khẩu, bạn có thể đăng nhập lại."
        );
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  logout() {
    ApiService.clearToken();
    NotifyService.info("Đã đăng xuất");
  },
};
