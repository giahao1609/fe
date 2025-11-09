"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { X, Upload, Trash2, RefreshCw } from "lucide-react"; 

export default function AdminUploadPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /**  Lấy danh sách tên ảnh trong bucket (thư mục "image/") */
  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/upload/list/image`);
      setImageNames(res.data || []);
    } catch (err) {
      console.error(" Lỗi tải danh sách ảnh:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  /**  Chọn ảnh upload */
  const handleSelectFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (i: number) => {
    const nf = [...files];
    const np = [...previews];
    nf.splice(i, 1);
    np.splice(i, 1);
    setFiles(nf);
    setPreviews(np);
  };

  /**  Upload ảnh mới */
  const handleUpload = async () => {
    if (files.length === 0) return alert("Vui lòng chọn ít nhất 1 ảnh!");

    setLoading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      await axios.post(`${API_URL}/upload/website`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(" Thêm ảnh thành công!");
      setFiles([]);
      setPreviews([]);
      fetchImages();
    } catch (err) {
      console.error(" Upload thất bại:", err);
      alert("Upload thất bại!");
    } finally {
      setLoading(false);
    }
  };

  /**  Xóa ảnh */
  const handleDelete = async (path: string) => {
    if (!confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    try {
      await axios.delete(`${API_URL}/upload/delete`, {
        data: { path },
      });
      alert(" Đã xóa ảnh!");
      fetchImages();
    } catch (err) {
      console.error(" Xóa thất bại:", err);
      alert("Xóa thất bại!");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow animate-fadeIn">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-semibold text-[#0d47a1]">
           Upload & Quản lý ảnh Website
        </h1>
        <button
          onClick={fetchImages}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* --- Upload --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
          {/*  Dùng Font Awesome icon ở đây */}
          <i className="fa-regular fa-image text-white text-lg"></i>
          <span>Chọn ảnh</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleSelectFiles}
            className="hidden"
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={loading || files.length === 0}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center gap-2"
        >
          <Upload size={18} />
          {loading ? "Đang upload..." : "Upload"}
        </button>
      </div>

      {/* --- Preview ảnh mới --- */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded overflow-hidden border">
              <img src={src} alt={`preview-${i}`} className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 bg-white/80 hover:bg-white text-red-600 rounded-full p-1"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- Danh sách tên ảnh --- */}
      <h2 className="text-lg font-semibold mb-3 text-[#0d47a1]">
        <i className="fa-regular fa-image"></i>
      </h2>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : imageNames.length === 0 ? (
        <p className="text-gray-500 italic">Chưa có ảnh nào.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border rounded-md">
          {imageNames.map((name, i) => (
            <li
              key={i}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2">
                <i className="fa-regular fa-image text-blue-500"></i>
                <span className="text-sm text-gray-700">{name}</span>
              </div>
              <button
                onClick={() => handleDelete(name)}
                className="text-red-500 hover:text-red-600 transition"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
