"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BlogPost,
  BlogStatus,
  BlogService,
  PaginatedBlogs,
} from "@/services/blog.service";

type CreateForm = {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  status: BlogStatus;
};

type GalleryItem = {
  id: string;
  file: File;
  previewUrl: string;
};

const defaultForm: CreateForm = {
  title: "",
  slug: "",
  excerpt: "",
  contentHtml: "",
  status: "DRAFT",
};

// ===== Simple Rich Text Editor (contentEditable) =====
function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Sync từ ngoài vào editor (khi reset form chẳng hạn)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  };

  const exec = (cmd: string, arg?: string) => {
    // tránh mất focus khi click toolbar
    document.execCommand(cmd, false, arg);
    handleInput();
  };

  const handleLink = () => {
    const url = prompt("Nhập URL:");
    if (url) {
      exec("createLink", url);
    }
  };

  const clearFormat = () => {
    exec("removeFormat");
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200 text-xs">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
          className="px-2 py-1 rounded hover:bg-gray-200 font-semibold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
          className="px-2 py-1 rounded hover:bg-gray-200 italic"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("underline")}
          className="px-2 py-1 rounded hover:bg-gray-200 underline"
        >
          U
        </button>
        <span className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<h2>")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<h3>")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          H3
        </button>
        <span className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          • List
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertOrderedList")}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          1. List
        </button>
        <span className="h-4 w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Link
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearFormat}
          className="px-2 py-1 rounded hover:bg-gray-200 text-[11px]"
        >
          Clear
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        className="min-h-[160px] max-h-[400px] overflow-y-auto px-3 py-2 text-sm focus:outline-none prose prose-sm prose-blue"
        // để trình duyệt hiểu đây là plain -> tránh paste style quá lố
        suppressContentEditableWarning
      />
    </div>
  );
}

// ===== Main component =====
export default function OwnerBlogsTab() {
  const [form, setForm] = useState<CreateForm>(defaultForm);

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroDragOver, setHeroDragOver] = useState(false);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryDragOver, setGalleryDragOver] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedBlogs | null>(null);

  const items: BlogPost[] = data?.items ?? [];

  // ========= LOAD LIST =========
  const loadBlogs = async (pageNum = 1) => {
    try {
      setLoadingList(true);
      const res = await BlogService.listMyBlogs({
        page: pageNum,
        limit: 20,
      });
      setData(res);
      setPage(res.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadBlogs(1);
  }, []);

  // ========= FORM HANDLERS =========
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========= HERO UPLOAD =========
  const heroPreviewUrl = useMemo(() => {
    if (!heroFile) return null;
    return URL.createObjectURL(heroFile);
  }, [heroFile]);

  const handleHeroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setHeroFile(file);
    }
  };

  const handleHeroDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setHeroDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setHeroFile(file);
    }
  };

  const handleHeroDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setHeroDragOver(true);
  };

  const handleHeroDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setHeroDragOver(false);
  };

  // ========= GALLERY UPLOAD =========
  const addGalleryFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;

    setGalleryItems((prev) => [
      ...prev,
      ...arr.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const handleGalleryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addGalleryFiles(e.target.files);
  };

  const handleGalleryDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDragOver(false);
    if (e.dataTransfer.files?.length) {
      addGalleryFiles(e.dataTransfer.files);
    }
  };

  const handleGalleryDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDragOver(true);
  };

  const handleGalleryDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setGalleryDragOver(false);
  };

  const handleGalleryItemRemove = (id: string) => {
    setGalleryItems((prev) => prev.filter((g) => g.id !== id));
  };

  const handleGalleryItemDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleGalleryItemDragEnter = (index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;
    setGalleryItems((prev) => {
      const arr = [...prev];
      const item = arr[draggingIndex];
      arr.splice(draggingIndex, 1);
      arr.splice(index, 0, item);
      return arr;
    });
    setDraggingIndex(index);
  };

  const handleGalleryItemDragEnd = () => {
    setDraggingIndex(null);
  };

  // ========= SUBMIT =========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      setSubmitting(true);

      const uploadFiles =
        heroFile || galleryItems.length
          ? {
              hero: heroFile ?? null,
              gallery: galleryItems.length
                ? galleryItems.map((g) => g.file)
                : null,
            }
          : undefined;

      await BlogService.create(
        {
          title: form.title.trim(),
          slug: form.slug.trim() || undefined,
          excerpt: form.excerpt.trim() || undefined,
          contentHtml: form.contentHtml.trim() || undefined,
          status: form.status,
        },
        uploadFiles
      );

      setForm(defaultForm);
      setHeroFile(null);
      setGalleryItems([]);

      await loadBlogs(1);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ========= DELETE =========
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá bài blog này?")) return;
    try {
      await BlogService.deleteMyBlog(id);
      await loadBlogs(page);
    } catch (err) {
      console.error(err);
    }
  };

  // ========= HELPER =========
  const getHeroUrl = (b: BlogPost): string | null => {
    if (b.heroImageUrlSigned) return b.heroImageUrlSigned;
    if (b.heroImageUrl) return b.heroImageUrl;
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Form tạo blog */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Đăng blog mới
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Viết bài giới thiệu món ăn, quán, tips ăn uống... và chia sẻ với
              khách của bạn.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left: meta + content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tiêu đề */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            {/* Slug + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Slug (tùy chọn)
                </label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="vd: mon-ngon-quan-1"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Nếu bỏ trống, hệ thống sẽ tự tạo từ tiêu đề.
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="DRAFT">Nháp</option>
                  <option value="PUBLISHED">Đăng ngay</option>
                  <option value="ARCHIVED">Lưu trữ</option>
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tóm tắt
              </label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[60px]"
                placeholder="Mô tả ngắn về bài viết"
              />
            </div>

            {/* Content HTML - Rich Editor */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nội dung (có thể định dạng chữ, list, tiêu đề...)
              </label>
              <RichTextEditor
                value={form.contentHtml}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, contentHtml: html }))
                }
              />
              {/* <p className="mt-1 text-[11px] text-gray-400">
                Nội dung sẽ được lưu dưới dạng HTML (contentHtml).
              </p> */}
            </div>
          </div>

          {/* Right: upload hero + gallery */}
          <div className="space-y-4">
            {/* Hero */}
            <div className="border border-dashed rounded-xl p-3 bg-gray-50/60">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Ảnh cover (hero)
              </label>

              <div
                onDrop={handleHeroDrop}
                onDragOver={handleHeroDragOver}
                onDragLeave={handleHeroDragLeave}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-5 text-center transition-all cursor-pointer ${
                  heroDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroInputChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl">
                    <i className="fa-regular fa-image" />
                  </div>
                  <p className="text-xs text-gray-700 font-medium">
                    Kéo thả ảnh vào đây, hoặc bấm để chọn
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Nên dùng ảnh ngang, rõ món ăn/quán
                  </p>
                </div>
              </div>

              {heroPreviewUrl && (
                <div className="mt-3">
                  <p className="text-[11px] text-gray-500 mb-1">
                    Preview ảnh cover:
                  </p>
                  <img
                    src={heroPreviewUrl}
                    alt="Hero preview"
                    className="h-32 w-full object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Gallery */}
            <div className="border border-dashed rounded-xl p-3 bg-gray-50/60">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Ảnh gallery (nhiều ảnh)
              </label>

              <div
                onDrop={handleGalleryDrop}
                onDragOver={handleGalleryDragOver}
                onDragLeave={handleGalleryDragLeave}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-4 text-center transition-all ${
                  galleryDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryInputChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xl">
                    <i className="fa-solid fa-images" />
                  </div>
                  <p className="text-xs text-gray-700 font-medium">
                    Kéo thả ảnh hoặc bấm để chọn nhiều ảnh
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Có thể kéo để thay đổi thứ tự hiển thị
                  </p>
                </div>
              </div>

              {!!galleryItems.length && (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {galleryItems.map((g, idx) => (
                      <div
                        key={g.id}
                        draggable
                        onDragStart={() => handleGalleryItemDragStart(idx)}
                        onDragEnter={() => handleGalleryItemDragEnter(idx)}
                        onDragEnd={handleGalleryItemDragEnd}
                        className={`group relative h-16 w-16 rounded-lg overflow-hidden border ${
                          draggingIndex === idx
                            ? "border-blue-500 ring-2 ring-blue-400"
                            : "border-gray-200"
                        } cursor-move`}
                      >
                        <img
                          src={g.previewUrl}
                          alt={`Gallery ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleGalleryItemRemove(g.id)}
                          className="absolute top-0 right-0 m-0.5 h-5 w-5 rounded-full bg-black/60 text-[10px] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {galleryItems.length} ảnh sẽ được upload theo thứ tự đang
                    hiển thị.
                  </p>
                </>
              )}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed w-full lg:w-auto justify-center"
              >
                <i className="fa-regular fa-paper-plane" />
                {submitting ? "Đang lưu..." : "Đăng blog"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Danh sách blog */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Blog của bạn
          </h2>
          {data && (
            <span className="text-xs text-gray-500">
              Tổng cộng {data.total} bài
            </span>
          )}
        </div>

        {loadingList && (
          <div className="py-8 text-center text-sm text-gray-500">
            Đang tải danh sách blog...
          </div>
        )}

        {!loadingList && items.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            Chưa có bài blog nào. Hãy đăng bài đầu tiên ở phía trên.
          </div>
        )}

        {!loadingList && items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Ảnh
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Tiêu đề
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Trạng thái
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Lượt xem
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      Ngày tạo
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((b) => {
                    const heroUrl = getHeroUrl(b);
                    return (
                      <tr
                        key={b._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2">
                          {heroUrl ? (
                            <img
                              src={heroUrl}
                              alt={b.title}
                              className="h-14 w-20 rounded-lg object-cover border border-gray-200 bg-gray-100"
                            />
                          ) : (
                            <div className="h-14 w-20 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400">
                              No image
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-900">
                            {b.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            /{b.slug}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              b.status === "PUBLISHED"
                                ? "bg-green-100 text-green-700"
                                : b.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {b.status === "PUBLISHED"
                              ? "Đã đăng"
                              : b.status === "DRAFT"
                              ? "Nháp"
                              : "Lưu trữ"}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-sm text-gray-700">
                            {b.viewCount ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700">
                          {b.createdAt
                            ? new Date(b.createdAt).toLocaleString("vi-VN")
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-right space-x-2">
                          {/* TODO: sau này có thể thêm nút Sửa */}
                          <button
                            onClick={() => handleDelete(b._id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Xoá
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {data && data.pages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-4 text-xs">
                <button
                  onClick={() => loadBlogs(page - 1)}
                  disabled={page <= 1}
                  className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trang trước
                </button>
                <span className="text-gray-600">
                  Trang {page}/{data.pages}
                </span>
                <button
                  onClick={() => loadBlogs(page + 1)}
                  disabled={page >= data.pages}
                  className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
