"use client";

import { useEffect, useState } from "react";
import { deletePost, getRelatedPosts, upsertPost } from "@/lib/api/owner";
import type { BlogPostRef } from "@/types/owner";

const emptyPost: BlogPostRef = {
  id: "",
  title: "",
  slug: "",
  banner: "",
  publishedAt: "",
  pinned: false,
};

export default function PostsTab() {
  const [items, setItems] = useState<BlogPostRef[]>([]);
  const [editing, setEditing] = useState<BlogPostRef | null>(null);
  const [kw, setKw] = useState("");

  const fetchAll = async () => {
    const res = await getRelatedPosts();
    setItems(res);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = items.filter(
    (p) =>
      p.title.toLowerCase().includes(kw.toLowerCase()) ||
      p.slug.toLowerCase().includes(kw.toLowerCase())
  );

  const onSave = async (input: BlogPostRef) => {
    const clean: BlogPostRef = {
      ...input,
      title: input.title.trim(),
      slug: input.slug.trim().replace(/\s+/g, "-").toLowerCase(),
      banner: input.banner?.trim(),
      publishedAt: input.publishedAt || new Date().toISOString(),
    };
    await upsertPost(clean);
    setEditing(null);
    await fetchAll();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Xoá bài viết này?")) return;
    await deletePost(id);
    await fetchAll();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Bài viết liên quan</h1>
        <div className="flex items-center gap-2">
          <input
            className="input w-64"
            placeholder="Tìm theo tiêu đề/slug…"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
          />
          <button
            onClick={() => setEditing({ ...emptyPost, id: crypto.randomUUID() })}
            className="rounded-xl bg-blue-600 text-white px-4 py-2 shadow hover:bg-blue-700"
          >
            + Bài viết
          </button>
        </div>
      </div>

      {editing && <PostEditor data={editing} onCancel={() => setEditing(null)} onSave={onSave} />}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-gray-500">
          Chưa có bài viết.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              {p.banner ? (
                <img src={p.banner} alt={p.title} className="h-36 w-full object-cover" />
              ) : (
                <div className="h-36 w-full bg-gray-100 grid place-items-center text-gray-400 text-sm">
                  No Banner
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="text-xs text-gray-500">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleString() : "—"}
                </div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-gray-500">/{p.slug}</div>
                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={p.pinned ?? false}
                      onChange={() => onSave({ ...p, pinned: !p.pinned })}
                    />
                    Ghim
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                      onClick={() => setEditing(p)}
                    >
                      Sửa
                    </button>
                    <button
                      className="rounded-lg bg-rose-600 text-white px-3 py-1.5 text-sm hover:bg-rose-700"
                      onClick={() => onDelete(p.id)}
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

function PostEditor({
  data,
  onCancel,
  onSave,
}: {
  data: BlogPostRef;
  onCancel: () => void;
  onSave: (v: BlogPostRef) => void;
}) {
  const [form, setForm] = useState<BlogPostRef>(data);

  return (
    <div className="rounded-2xl bg-white border border-blue-200 shadow p-4 space-y-3">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Tiêu đề">
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>
        <Field label="Slug (tự chuyển nếu để trống)">
          <input
            className="input"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </Field>
        <Field label="Banner URL">
          <input
            className="input"
            value={form.banner ?? ""}
            onChange={(e) => setForm({ ...form, banner: e.target.value })}
          />
        </Field>
        <Field label="Ngày xuất bản">
          <input
            className="input"
            type="datetime-local"
            value={
              form.publishedAt
                ? new Date(form.publishedAt).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) =>
              setForm({
                ...form,
                publishedAt: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : "",
              })
            }
          />
        </Field>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.pinned ?? false}
            onChange={() => setForm({ ...form, pinned: !form.pinned })}
          />
          Ghim bài
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-xl bg-blue-600 text-white px-4 py-2 shadow hover:bg-blue-700"
          onClick={() => onSave(form)}
        >
          Lưu
        </button>
        <button
          className="rounded-xl border px-4 py-2 hover:bg-gray-50"
          onClick={onCancel}
        >
          Huỷ
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      {children}
    </label>
  );
}
