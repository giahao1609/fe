"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

interface Props {
  id: string;
  API_URL?: string;
  reviews: any[];
  setReviews: (data: any[]) => void;
  getImageUrl: (path?: string) => string;
}

export default function RestaurantReviews({
  id,
  API_URL,
  reviews,
  setReviews,
  getImageUrl,
}: Props) {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [loadingReview, setLoadingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // 🖼️ Chọn ảnh upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (typeof window === "undefined") return;
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setFilePreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (i: number) => {
    const nf = [...files];
    const np = [...filePreviews];
    nf.splice(i, 1);
    np.splice(i, 1);
    setFiles(nf);
    setFilePreviews(np);
  };

  // 📨 Gửi review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập để gửi đánh giá!");
    if (!comment.trim() && files.length === 0)
      return alert("Vui lòng nhập nội dung hoặc chọn ảnh!");
    if (rating === 0) return alert("Vui lòng chọn số sao!");

    setLoadingReview(true);
    try {
      const fd = new FormData();
      fd.append("content", comment);
      fd.append("rating", String(rating));
      files.forEach((f) => fd.append("files", f));

      await axios.post(`${API_URL}/review/${user._id}/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await axios.get(`${API_URL}/review/restaurant/${id}`);
      setReviews(res.data);

      setComment("");
      setFiles([]);
      setFilePreviews([]);
      setRating(0);
    } catch (err) {
      console.error("❌ Gửi review thất bại:", err);
    } finally {
      setLoadingReview(false);
    }
  };

  return (
    <section className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-3 border-b pb-2">
        ⭐ Đánh giá & bình luận
      </h2>

      {/* --- Form nhập đánh giá --- */}
      {user ? (
        <form onSubmit={handleSubmitReview} className="space-y-4" suppressHydrationWarning>
          <div className="flex items-start gap-3">
            <Image
              src={user?.avatar || "/image/default-avatar.png"}
              alt={user?.name || "Ảnh đại diện người dùng"}
              width={48}
              height={48}
              className="rounded-full border object-cover"
            />

            <div className="flex-1">
              {/* ⭐ Rating selector */}
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    fill={star <= (hoverRating || rating) ? "#facc15" : "none"}
                    stroke="#facc15"
                    className="w-6 h-6 cursor-pointer transition-transform hover:scale-110"
                  />
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về quán ăn này..."
                className="w-full border rounded-md px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-red-400 outline-none bg-white"
              />

              <div className="mt-2 flex items-center justify-between">
                <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                  📷 Thêm ảnh
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loadingReview}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {loadingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </div>
          </div>

          {/* 🖼️ Ảnh xem trước */}
          {filePreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-3">
              {filePreviews.map((src, i) => (
                <div key={i} className="relative w-full aspect-square rounded overflow-hidden">
                  <Image
                    src={src}
                    alt={`preview-${i}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-600 rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>
      ) : (
        <p className="text-gray-600 italic">
          🔒 Vui lòng{" "}
          <Link href="/auth" className="text-blue-600 underline">
            đăng nhập
          </Link>{" "}
          để viết đánh giá.
        </p>
      )}

      {/* --- Danh sách review --- */}
      <div className="space-y-4 mt-6" suppressHydrationWarning>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có đánh giá nào.</p>
        ) : (
          reviews.map((r: any) => (
            <div key={r._id} className="border-b pb-3">
              <div className="flex items-start gap-3">
                <Image
                  src={"/default-avatar.png"}
                  alt={r.userName || "Ảnh người dùng"}
                  width={40}
                  height={40}
                  className="rounded-full border mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      {r.userName || "Người dùng"}
                    </h4>
                    <span className="text-sm text-gray-400" suppressHydrationWarning>
                      {r.createdAt
                        ? new Date(r.createdAt).toISOString().split("T")[0]
                        : ""}
                    </span>
                  </div>

                  {/* ⭐ Rating */}
                  <div className="flex mt-1 text-yellow-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        fill={s <= r.rating ? "currentColor" : "none"}
                        stroke="currentColor"
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 text-sm mt-1">{r.content}</p>

                  {/* 🖼️ Ảnh review (dùng getImageUrl) */}
                  {r.images?.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                      {r.images.map((img: string, i: number) => (
                        <div
                          key={i}
                          className="relative w-full aspect-square rounded overflow-hidden"
                        >
                          <Image
                            src={getImageUrl(img)}
                            alt={`rv-${i}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
