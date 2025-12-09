// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { createRestaurant, updateRestaurant } from "@/lib/api/restaurant";
// import { api } from "@/lib/api"; // axios instance dùng chung

// interface Props {
//   editing?: any;
//   onDone?: () => void;
// }

// export default function RestaurantFormTab({ editing, onDone }: Props) {
//   const [editId, setEditId] = useState<string | null>(null);

//   const [form, setForm] = useState({
//     name: "",
//     address: "",
//     district: "",
//     category: "",
//     priceRange: "",
//     latitude: "",
//     longitude: "",
//     description: "",
//     directions: "",
//     scheduleText: "",
//   });

//   const [banner, setBanner] = useState<File | null>(null);
//   const [gallery, setGallery] = useState<File[]>([]);
//   const [menu, setMenu] = useState<File[]>([]);

//   // 🖼️ Ảnh hiện có từ DB (signed URL)
//   const [existing, setExisting] = useState({
//     banner: [] as string[],
//     gallery: [] as string[],
//     menu: [] as string[],
//   });

//   // 🖼️ Ảnh mới (preview local)
//   const [preview, setPreview] = useState({
//     banner: "",
//     gallery: [] as string[],
//     menu: [] as string[],
//   });

//  //  Hàm tải signed URLs từ path thô
// const loadSignedUrls = async (paths: string[] = []) => {
//   if (!paths.length) return [];

//   return Promise.all(
//     paths.map(async (p) => {
//       //  Nếu đã là link GCS signed URL, không cần gọi refresh-link nữa
//       if (p.startsWith("http")) return p;

//       try {
//         const res = await api.get(
//           `/restaurants/refresh-link/${encodeURIComponent(p)}`
//         );
//         return res.data.url || p;
//       } catch (e) {
//         console.warn("⚠️ Lỗi signed URL:", p);
//         return p;
//       }
//     })
//   );
// };

//   //  Khi click “Sửa” → load form và signed URLs
//   useEffect(() => {
//     if (editing) {
//       setEditId(editing._id);
//       setForm({
//         name: editing.name || "",
//         address: editing.address || "",
//         district: editing.district || "",
//         category: editing.category || "",
//         priceRange: editing.priceRange || "",
//         latitude: editing.latitude?.toString() || "",
//         longitude: editing.longitude?.toString() || "",
//         description: editing.description || "",
//         directions: editing.directions || "",
//         scheduleText: editing.scheduleText || "",
//       });

//       (async () => {
//         const bannerUrls = editing.banner?.length
//           ? await loadSignedUrls(editing.banner)
//           : [];
//         const galleryUrls = editing.gallery?.length
//           ? await loadSignedUrls(editing.gallery)
//           : [];
//         const menuUrls = editing.menuImages?.length
//           ? await loadSignedUrls(editing.menuImages)
//           : [];

//         setExisting({
//           banner: bannerUrls,
//           gallery: galleryUrls,
//           menu: menuUrls,
//         });
//       })();
//     } else {
//       // reset form khi thêm mới
//       setEditId(null);
//       setForm({
//         name: "",
//         address: "",
//         district: "",
//         category: "",
//         priceRange: "",
//         latitude: "",
//         longitude: "",
//         description: "",
//         directions: "",
//         scheduleText: "",
//       });
//       setExisting({ banner: [], gallery: [], menu: [] });
//       setPreview({ banner: "", gallery: [], menu: [] });
//     }
//   }, [editing]);

//   //  Input handler
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   //  Upload ảnh mới (preview local)
//   const handleFileChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: "banner" | "gallery" | "menu"
//   ) => {
//     const files = Array.from(e.target.files || []);
//     if (type === "banner" && files[0]) {
//       setBanner(files[0]);
//       setPreview((p) => ({ ...p, banner: URL.createObjectURL(files[0]) }));
//     } else if (type === "gallery") {
//       setGallery(files);
//       setPreview((p) => ({
//         ...p,
//         gallery: files.map((f) => URL.createObjectURL(f)),
//       }));
//     } else if (type === "menu") {
//       setMenu(files);
//       setPreview((p) => ({
//         ...p,
//         menu: files.map((f) => URL.createObjectURL(f)),
//       }));
//     }
//   };

//   //  Xóa ảnh (trên GCS + DB)
//   const handleRemoveImage = async (
//     type: "banner" | "gallery" | "menu",
//     index: number,
//     fromNew = false
//   ) => {
//     try {
//       //  Nếu chỉ là ảnh mới chọn → xoá local preview
//       if (fromNew) {
//         if (type === "banner") setPreview((p) => ({ ...p, banner: "" }));
//         else
//           setPreview((p) => ({
//             ...p,
//             [type]: (p as any)[type].filter((_: any, i: number) => i !== index),
//           }));
//         return;
//       }

//       if (!editId) return;

//       const removedPath = existing[type][index];
//       if (!removedPath) return;

//       const filename = removedPath.split("/").pop();
//       await api.delete(`/restaurants/${editId}/${type}/${filename}`);

//       setExisting((p) => ({
//         ...p,
//         [type]: (p as any)[type].filter((_: any, i: number) => i !== index),
//       }));

//       console.log(" Đã xoá ảnh:", removedPath);
//     } catch (err) {
//       console.error(" Lỗi xoá ảnh:", err);
//       alert("Không thể xoá ảnh!");
//     }
//   };

//   //  Submit
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     let id = editId;

//     const dto = {
//       ...form,
//       latitude: Number(form.latitude),
//       longitude: Number(form.longitude),
//     };

//     try {
//       //  Cập nhật hoặc tạo mới
//       if (id) await updateRestaurant(id, dto);
//       else {
//         const newRes = await createRestaurant(dto);
//         id = newRes._id;
//       }

//       if (id) {
//         const upload = async (path: string, files: File[]) => {
//           if (files.length === 0) return;
//           const fd = new FormData();
//           files.forEach((f) => fd.append("files", f));
//           await api.post(`/restaurants/${id}/${path}`, fd, {
//             headers: { "Content-Type": "multipart/form-data" },
//           });
//         };

//         if (banner) await upload("banner", [banner]);
//         if (gallery.length > 0) await upload("gallery", gallery);
//         if (menu.length > 0) await upload("menu", menu);

//         //  Sau upload → refresh lại signed URLs
//         const updated = await api.get(`/restaurants/${id}`);
//         const newBanner = await loadSignedUrls(updated.data.banner || []);
//         const newGallery = await loadSignedUrls(updated.data.gallery || []);
//         const newMenu = await loadSignedUrls(updated.data.menuImages || []);
//         setExisting({ banner: newBanner, gallery: newGallery, menu: newMenu });
//         setPreview({ banner: "", gallery: [], menu: [] });
//       }

//       alert(" Lưu thành công!");
//       onDone?.();
//     } catch (err) {
//       console.error(" Lỗi lưu:", err);
//       alert(" Lưu thất bại!");
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="space-y-4 border p-4 rounded-md shadow"
//     >
//       <h2 className="text-lg font-semibold mb-3">
//         {editId ? " Sửa nhà hàng" : " Thêm nhà hàng mới"}
//       </h2>

//       {/* Thông tin cơ bản */}
//       {Object.keys(form).map((key) => (
//         <div key={key}>
//           <label className="block text-sm font-medium capitalize mb-1">
//             {key}
//           </label>
//           {["description", "directions", "scheduleText"].includes(key) ? (
//             <textarea
//               name={key}
//               placeholder={
//                 key === "scheduleText"
//                   ? "VD: 06:00 – 14:00 và 15:30 – 20:00, riêng Chủ nhật mở từ 06:00 – 14:00"
//                   : ""
//               }
//               value={(form as any)[key]}
//               onChange={handleChange}
//               className="border px-3 py-2 w-full rounded text-sm"
//               rows={key === "scheduleText" ? 2 : 3}
//             />
//           ) : (
//             <input
//               name={key}
//               value={(form as any)[key]}
//               onChange={handleChange}
//               className="border px-3 py-2 w-full rounded"
//               required={["name", "address", "district"].includes(key)}
//             />
//           )}
//         </div>
//       ))}

//       {/* Ảnh Banner */}
//       <ImageUploadSection
//         label="Ảnh Banner"
//         type="banner"
//         existing={existing}
//         preview={preview}
//         onRemove={handleRemoveImage}
//         onChange={handleFileChange}
//       />

//       {/* Gallery */}
//       <ImageUploadSection
//         label="Gallery"
//         type="gallery"
//         existing={existing}
//         preview={preview}
//         onRemove={handleRemoveImage}
//         onChange={handleFileChange}
//       />

//       {/* Menu */}
//       <ImageUploadSection
//         label="Menu"
//         type="menu"
//         existing={existing}
//         preview={preview}
//         onRemove={handleRemoveImage}
//         onChange={handleFileChange}
//       />

//       <Button
//         type="submit"
//         className="bg-green-600 text-white px-4 py-2 hover:bg-green-700"
//       >
//         {editId ? " Lưu thay đổi" : " Thêm nhà hàng"}
//       </Button>
//     </form>
//   );
// }

// /**  Component con hiển thị danh sách ảnh */
// function ImageUploadSection({
//   label,
//   type,
//   existing,
//   preview,
//   onRemove,
//   onChange,
// }: {
//   label: string;
//   type: "banner" | "gallery" | "menu";
//   existing: any;
//   preview: any;
//   onRemove: any;
//   onChange: any;
// }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium mb-1">{label}</label>
//       <div className="flex flex-wrap gap-2 mt-2">
//         {[...(existing[type] || []), ...(preview[type] || [])].map(
//           (src: string, i: number) => (
//             <div key={`${type}-${i}`} className="relative inline-block">
//               <img
//                 src={src}
//                 className={
//                   type === "banner"
//                     ? "w-40 h-40 object-cover rounded border"
//                     : "w-20 h-20 object-cover rounded border"
//                 }
//                 alt={`${type}-${i}`}
//               />
//               <button
//                 type="button"
//                 onClick={() =>
//                   onRemove(type, i, i >= existing[type].length /* fromNew */)
//                 }
//                 className="absolute top-0 right-0 bg-black/60 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
//               >
//                 ✕
//               </button>
//             </div>
//           )
//         )}
//       </div>
//       <input
//         type="file"
//         multiple={type !== "banner"}
//         accept="image/*"
//         onChange={(e) => onChange(e, type)}
//         className="mt-2"
//       />
//     </div>
//   );
// }
