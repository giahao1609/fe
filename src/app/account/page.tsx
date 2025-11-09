"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Image from "next/image";

export default function AccountPage() {
  const { user, token, logout, reloadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    "/image/default-avatar.jpg"
  );
  const [edit, setEdit] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    username: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user && token) {
      setForm({
        ...form,
        username: user.username || user.name || "",
        phone: user.phone || "",
      });
      setAvatarPreview(
        user.avatarUrl || user.picture || "/image/default-avatar.jpg"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Xử lý chọn ảnh mới
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // xem trước ảnh mới
    }
  };

  //  Lưu thông tin tài khoản
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let avatarUrl = avatarPreview;

      // Nếu user chọn ảnh mới → upload lên backend (GCS)
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadRes = await axios.post(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/upload/user/${user._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        avatarUrl = uploadRes.data.url; // URL ảnh GCS
      }

      // Gửi request cập nhật thông tin user
      await axios.patch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/auth/update-me`,
        {
          username: form.username,
          phone: form.phone,
          avatarUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(" Cập nhật thành công!");
      reloadUser();
      setEdit(false);
    } catch (err: any) {
      console.error(err);
      setMessage(" Có lỗi khi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  //  Đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (form.newPassword !== form.confirmPassword) {
      setMessage(" Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }

    try {
      await axios.patch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/auth/update-me`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(" Đổi mật khẩu thành công!");
      setForm({
        ...form,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setMessage(err.response?.data?.message || " Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        <p>Đang tải thông tin...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-[#fff8f8] to-[#ffecec]">
      <div className="bg-white border rounded-2xl p-8 w-full max-w-md shadow-xl relative z-10">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Tài khoản
        </h2>

        {/* Ảnh đại diện */}
        <div className="w-full flex justify-center mb-4">
          <div className="relative w-24 h-24">
            <Image
              src={avatarPreview || "/image/default-avatar.jpg"}
              alt="Avatar"
              fill
              className="rounded-full object-cover border-2 border-red-500"
              unoptimized
              priority
            />
          </div>
        </div>

        {edit ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="text-sm text-gray-600"
              />
            </div>

            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="Tên người dùng"
            />
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border p-2 rounded"
              placeholder="Số điện thoại"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded text-white font-semibold ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-1">
            <p className="font-semibold">{user.username || user.name}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <p className="text-gray-500 text-sm">
              {user.phone || "Chưa có SĐT"}
            </p>
          </div>
        )}

        {/* Nút hành động */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setEdit(!edit)}
            className="flex-1 border py-2 rounded text-blue-600 hover:bg-blue-50"
          >
            {edit ? "Hủy" : "Chỉnh sửa"}
          </button>
          <button
            onClick={logout}
            className="flex-1 border py-2 rounded text-red-600 hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </div>

        {/* Form đổi mật khẩu */}
        <form
          onSubmit={handleChangePassword}
          className="space-y-3 mt-8 border-t pt-4"
        >
          <h3 className="font-semibold text-gray-700 mb-2 text-center">
            Đổi mật khẩu
          </h3>

          <input
            type="password"
            placeholder="Mật khẩu hiện tại"
            value={form.currentPassword}
            onChange={(e) =>
              setForm({ ...form, currentPassword: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white font-semibold ${
              loading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>

        {message && (
          <p
            className={`text-center text-sm mt-4 ${
              message.startsWith("v") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
