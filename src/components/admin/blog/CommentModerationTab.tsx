"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type Comment = {
  id: string;
  postTitle: string;
  user: string;
  content: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

const mockComments: Comment[] = [
  {
    id: "c1",
    postTitle: "Top 10 quán phở khuya ở Q.1",
    user: "minhdao",
    content: "Bài viết hữu ích, quán số 3 ngon!",
    createdAt: new Date().toISOString(),
    status: "pending",
  },
  {
    id: "c2",
    postTitle: "Cách chọn quán lẩu theo nhóm",
    user: "thuylinh",
    content: "Mình thích lẩu riêu nhất.",
    createdAt: new Date().toISOString(),
    status: "approved",
  },
  {
    id: "c3",
    postTitle: "Top 10 quán phở khuya ở Q.1",
    user: "anonymous",
    content: "Quán số 8 phục vụ chưa tốt.",
    createdAt: new Date().toISOString(),
    status: "rejected",
  },
];

export default function CommentModerationTab() {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const list = useMemo(
    () => (filter === "all" ? comments : comments.filter((c) => c.status === filter)),
    [comments, filter]
  );

  const updateStatus = (id: string, status: Comment["status"]) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const remove = (id: string) => {
    if (!confirm("Xoá bình luận này?")) return;
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Duyệt bình luận</h3>
        <div className="flex items-center gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((k) => (
            <Button
              key={k}
              variant={filter === k ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(k)}
            >
              {k}
            </Button>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bài viết</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.length ? (
            list.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.postTitle}</TableCell>
                <TableCell>{c.user}</TableCell>
                <TableCell className="max-w-[360px] truncate">{c.content}</TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  {c.status === "approved" && <span className="text-emerald-600">Approved</span>}
                  {c.status === "pending" && <span className="text-amber-600">Pending</span>}
                  {c.status === "rejected" && <span className="text-red-600">Rejected</span>}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "approved")}>
                    Duyệt
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "rejected")}>
                    Từ chối
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(c.id)}>
                    Xoá
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400">
                Không có bình luận
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
