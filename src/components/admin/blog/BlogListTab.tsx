"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type Blog = {
  id: string;
  title: string;
  slug: string;
  author: string;
  published: boolean;
  createdAt: string;
};

const initialBlogs: Blog[] = [
  {
    id: "b1",
    title: "Top 10 quán phở khuya ở Q.1",
    slug: "top-10-quan-pho-khuya-q1",
    author: "Admin",
    published: true,
    createdAt: new Date("2025-10-01").toISOString(),
  },
  {
    id: "b2",
    title: "Cách chọn quán lẩu theo nhóm",
    slug: "meo-chon-quan-lau-theo-nhom",
    author: "Editor",
    published: false,
    createdAt: new Date("2025-10-08").toISOString(),
  },
];

export default function BlogListTab() {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);

  const togglePublish = (id: string) => {
    setBlogs((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, published: !b.published } : b
      )
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xoá bài viết này?")) return;
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Danh sách bài viết</h3>
        <Button onClick={() => alert("Chuyển sang tab Blog Form để thêm/sửa")}>
          Thêm bài viết
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Tác giả</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.length ? (
            blogs.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.title}</TableCell>
                <TableCell>{b.slug}</TableCell>
                <TableCell>{b.author}</TableCell>
                <TableCell>
                  {b.published ? (
                    <span className="text-emerald-600 font-medium">Đã xuất bản</span>
                  ) : (
                    <span className="text-gray-500">Bản nháp</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(b.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(b.id)}
                  >
                    {b.published ? "Ẩn" : "Xuất bản"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(b.id)}
                  >
                    Xoá
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400">
                Chưa có bài viết nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
