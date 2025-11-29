"use client";

import { useEffect, useMemo, useState } from "react";
import { approveComment, deleteComment, getComments, replyComment } from "@/lib/api/owner";
import type { CommentItem } from "@/types/owner";

export default function CommentsTab() {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kw, setKw] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const res = await getComments();
    setItems(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = kw.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.userName.toLowerCase().includes(q) ||
        c.text.toLowerCase().includes(q)
    );
  }, [items, kw]);

  const onApprove = async (id: string, next: boolean) => {
    await approveComment(id, next);
    await fetchAll();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Xoá bình luận này?")) return;
    await deleteComment(id);
    await fetchAll();
  };

  const onReply = async (id: string) => {
    const content = prompt("Nhập nội dung phản hồi:");
    if (content && content.trim()) {
      await replyComment(id, content.trim());
      await fetchAll();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Bình luận</h1>
        <input
          className="input w-64"
          placeholder="Tìm theo tên hoặc nội dung…"
          value={kw}
          onChange={(e) => setKw(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-gray-500">
          Chưa có bình luận nào.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <img
                  src={c.userAvatar ?? "https://i.pravatar.cc/64?img=1"}
                  alt={c.userName}
                  className="w-10 h-10 rounded-full border"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="font-medium">{c.userName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-amber-500 my-1">
                    {"★".repeat(c.rating)}{" "}
                    <span className="text-gray-400">
                      {"★".repeat(Math.max(0, 5 - c.rating))}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{c.text}</p>
                  {c.reply && (
                    <div className="mt-2 rounded-xl bg-gray-50 border p-2">
                      <div className="text-xs text-gray-500 mb-1">Phản hồi của cửa hàng</div>
                      <div className="text-sm text-gray-800">{c.reply}</div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {c.approved ? (
                      <button
                        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        onClick={() => onApprove(c.id, false)}
                      >
                        Ẩn
                      </button>
                    ) : (
                      <button
                        className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm hover:bg-emerald-700"
                        onClick={() => onApprove(c.id, true)}
                      >
                        Duyệt
                      </button>
                    )}
                    <button
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                      onClick={() => onReply(c.id)}
                    >
                      Phản hồi
                    </button>
                    <button
                      className="rounded-lg bg-rose-600 text-white px-3 py-1.5 text-sm hover:bg-rose-700"
                      onClick={() => onDelete(c.id)}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
