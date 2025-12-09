"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Image from "next/image";

type MessageType = "success" | "error" | "";

type MeType = {
  _id: string;
  displayName?: string;
  username?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  picture?: string;
  roles?: string[];
  [key: string]: any;
};

export default function AccountPage() {
  const { user, token, logout, reloadUser } = useAuth();

  const [me, setMe] = useState<MeType | null>(null);
  const [meLoading, setMeLoading] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    "/image/default-avatar.jpg"
  );

  const [profileForm, setProfileForm] = useState({
    displayName: "",
    username: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("");

  const API_BASE =
    process.env.API_BASE_URL || "https://api.food-map.online/api/v1";

  const resetMessage = () => {
    setMessage("");
    setMessageType("");
  };

  // ===== Fetch /users/me từ API =====
  const fetchMe = useCallback(async () => {
    if (!token) return;
    try {
      setMeLoading(true);
      const res = await axios.get<MeType>(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;
      setMe(data);

      setProfileForm({
        displayName:
          data.displayName || data.username || (data as any).name || "",
        username: data.username || "",
        phone: data.phone || "",
      });

      setAvatarPreview(
        data.avatarUrl || data.picture || "/image/default-avatar.jpg"
      );
    } catch (error) {
      console.error("Fetch /users/me error:", error);
    } finally {
      setMeLoading(false);
    }
  }, [API_BASE, token]);

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token, fetchMe]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetMessage();
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // ===== Lưu thông tin cá nhân (displayName, username, phone, avatar) =====
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !me) return;

    resetMessage();
    setProfileLoading(true);

    try {
      const formData = new FormData();

      formData.append("displayName", profileForm.displayName || "");
      formData.append("username", profileForm.username || "");
      formData.append("phone", profileForm.phone || "");

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await axios.post(`${API_BASE}/users/me/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Cập nhật thông tin tài khoản thành công!");
      setMessageType("success");
      setAvatarFile(null);

      // reload lại /users/me + context
      await fetchMe();
      await reloadUser();
    } catch (err: any) {
      console.error(err);
      setMessage(
        err?.response?.data?.message || "Có lỗi khi cập nhật thông tin!"
      );
      setMessageType("error");
    } finally {
      setProfileLoading(false);
    }
  };

  // ===== Đổi mật khẩu (PATCH /users/me/password) =====
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !me) return;

    resetMessage();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      setMessageType("error");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/users/me/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmNewPassword: passwordForm.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data?.message || "Đổi mật khẩu thành công!");
      setMessageType("success");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error(err);
      setMessage(
        err?.response?.data?.message ||
          "Đổi mật khẩu thất bại, vui lòng thử lại!"
      );
      setMessageType("error");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!token || meLoading || !me) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <p className="text-sm text-gray-600">Đang tải thông tin tài khoản…</p>
      </div>
    );
  }

  const displayName =
    me.displayName ||
    me.username ||
    (me as any).name ||
    me.email?.split("@")[0] ||
    "Người dùng";

  const email = me.email;
  const phone = me.phone;
  const roles = (me.roles || []) as string[];

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="mx-auto max-w-[90%] px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Tài khoản của bạn
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý thông tin cá nhân, avatar và mật khẩu cho tài khoản
            FoodTour.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          {/* Card Thông tin cá nhân */}
          <section className="rounded-2xl border border-rose-100 bg-white/90 p-6 shadow-lg shadow-rose-100/60 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20">
                <Image
                  src={avatarPreview || "/image/default-avatar.jpg"}
                  alt="Avatar"
                  fill
                  className="rounded-full border-2 border-rose-500 object-cover"
                  unoptimized
                  priority
                />
                <label className="absolute bottom-0 right-0 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-[11px] text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  ✏️
                </label>
              </div>

              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">{email}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {roles?.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600 ring-1 ring-rose-100"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="Tên bạn muốn hiển thị với mọi người"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="Tên tài khoản (a-z, 0-9, _ .)"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder={phone || "Thêm SĐT để đặt bàn nhanh hơn"}
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileLoading ? "Đang lưu…" : "Lưu thay đổi"}
              </button>
            </form>

            <button
              onClick={logout}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Đăng xuất
            </button>
          </section>

          {/* Card Đổi mật khẩu */}
          <section className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-lg shadow-gray-100/60 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-gray-800">
              Đổi mật khẩu
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Nên dùng mật khẩu dài, khó đoán và không dùng chung với dịch vụ
              khác.
            </p>

            <form
              onSubmit={handleChangePassword}
              className="mt-4 space-y-3 text-sm"
            >
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-gray-800 to-gray-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-gray-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordLoading ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
              </button>
            </form>
          </section>
        </div>

        {message && (
          <div className="mt-5 flex justify-center">
            <div
              className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-medium ${
                messageType === "success"
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                  : "bg-red-50 text-red-600 ring-1 ring-red-100"
              }`}
            >
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
