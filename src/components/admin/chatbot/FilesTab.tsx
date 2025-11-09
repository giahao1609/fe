"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFiles, uploadFile, deleteFile } from "@/lib/api/chatbot";

export default function FilesTab() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await getFiles();
      setFiles(res || []);
    } catch (err) {
      console.error(" Fetch files error:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: any) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        await uploadFile(file);
      }
      await fetchFiles();
    } catch (err) {
      console.error(" Upload error:", err);
    }
    setUploading(false);
  };

  const handleDelete = async (name: string) => {
    const fileName = name.split("/").pop();
    const confirmDelete = window.confirm(
      ` Bạn có chắc chắn muốn xóa file "${fileName}" không?`
    );
    if (!confirmDelete) return;

    try {
      await deleteFile(name);
      await fetchFiles();
    } catch (err) {
      console.error(" Delete error:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload section */}
      <div className="flex items-center gap-3">
        <Button asChild>
          <label className="cursor-pointer">
            Upload File
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
              accept=".txt,.pdf,.docx,.md"
            />
          </label>
        </Button>
        {uploading && <span> Đang upload...</span>}
      </div>

      {/* Table section */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên file</TableHead>
            <TableHead>Ngày upload</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {files.length > 0 ? (
            files.map((f, index) => (
              <TableRow key={f.name || index}>
                <TableCell>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {f.name.split("/").pop()}
                  </a>
                </TableCell>
                <TableCell>
                  {f.createdAt
                    ? new Date(f.createdAt).toLocaleString()
                    : new Date().toLocaleString()}
                </TableCell>
                <TableCell>{f.status || "indexed"}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(f.name)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-gray-400"
              >
                Chưa có file nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
