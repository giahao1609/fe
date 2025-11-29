"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function BlogFormTab() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    cover: "",
    published: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Fake submit blog (mock). Bạn có thể nối API sau này.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md shadow">
      <h3 className="font-semibold">Thêm / Sửa bài viết</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Tiêu đề</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          name="slug"
          value={form.slug}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded"
          placeholder="vd: mon-ngon-cuoi-tuan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mô tả ngắn</label>
        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nội dung</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded"
          rows={8}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Tags (phân cách bởi dấu phẩy)
        </label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded"
          placeholder="pho, bunbo, lau"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ảnh cover (URL)</label>
        <input
          name="cover"
          value={form.cover}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded"
          placeholder="https://..."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
          Lưu
        </Button>
      </div>
    </form>
  );
}
