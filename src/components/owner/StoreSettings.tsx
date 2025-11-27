"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoreProfile, updateStoreProfile } from "@/lib/api/owner";
import type { StoreProfile, Weekday, OpeningHours } from "@/types/owner";

const DAYS: { key: Weekday; label: string }[] = [
  { key: "monday", label: "Thứ 2" },
  { key: "tuesday", label: "Thứ 3" },
  { key: "wednesday", label: "Thứ 4" },
  { key: "thursday", label: "Thứ 5" },
  { key: "friday", label: "Thứ 6" },
  { key: "saturday", label: "Thứ 7" },
  { key: "sunday", label: "Chủ nhật" },
];

export default function StoreSettings() {
  const [data, setData] = useState<StoreProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStoreProfile().then(setData);
  }, []);

  const opening = useMemo<OpeningHours>(() => {
    if (!data) {
      // default cấu trúc rỗng
      return {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      };
    }
    return data.openingHours;
  }, [data]);

  if (!data) return <p className="text-gray-500">Đang tải…</p>;

  const updateField = <K extends keyof StoreProfile>(key: K, value: StoreProfile[K]) => {
    setData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const addRange = (day: Weekday) => {
    const next = { ...opening };
    next[day] = [...next[day], { open: "06:00", close: "14:00" }];
    updateField("openingHours", next);
  };

  const updateRange = (day: Weekday, idx: number, field: "open" | "close", value: string) => {
    const next = { ...opening };
    next[day] = next[day].map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    updateField("openingHours", next);
  };

  const removeRange = (day: Weekday, idx: number) => {
    const next = { ...opening };
    next[day] = next[day].filter((_, i) => i !== idx);
    updateField("openingHours", next);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const cleaned: StoreProfile = {
        ...data,
        name: data.name.trim(),
        address: data.address.trim(),
        district: data.district.trim(),
        phone: data.phone?.trim(),
        email: data.email?.trim(),
        website: data.website?.trim(),
        description: data.description?.trim(),
        tags: data.tags.map((t) => t.trim()).filter(Boolean),
      };
      const updated = await updateStoreProfile(cleaned);
      setData(updated);
      alert("Đã lưu cấu hình cửa hàng!");
    } catch (e) {
      console.error(e);
      alert("Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cấu hình cửa hàng</h1>

      {/* Thông tin cơ bản */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Tên cửa hàng">
            <input className="input" value={data.name} onChange={(e) => updateField("name", e.target.value)} />
          </Field>
          <Field label="Khoảng giá">
            <input className="input" value={data.priceRange ?? ""} onChange={(e) => updateField("priceRange", e.target.value)} />
          </Field>
          <Field label="Địa chỉ">
            <input className="input" value={data.address} onChange={(e) => updateField("address", e.target.value)} />
          </Field>
          <Field label="Quận/Huyện">
            <input className="input" value={data.district} onChange={(e) => updateField("district", e.target.value)} />
          </Field>
          <Field label="Điện thoại">
            <input className="input" value={data.phone ?? ""} onChange={(e) => updateField("phone", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className="input" value={data.email ?? ""} onChange={(e) => updateField("email", e.target.value)} />
          </Field>
          <Field label="Website">
            <input className="input" value={data.website ?? ""} onChange={(e) => updateField("website", e.target.value)} />
          </Field>
          <Field label="Trạng thái">
            <select
              className="input"
              value={data.status}
              onChange={(e) => updateField("status", e.target.value as StoreProfile["status"])}
            >
              <option value="draft">Nháp</option>
              <option value="published">Công khai</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </Field>
        </div>

        <Field label="Mô tả">
          <textarea
            className="input min-h-24"
            value={data.description ?? ""}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </Field>

        <Field label="Thẻ (tags)">
          <input
            className="input"
            value={data.tags.join(", ")}
            onChange={(e) =>
              updateField(
                "tags",
                e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              )
            }
            placeholder="Ví dụ: bún bò, gia đình, lẩu…"
          />
        </Field>

        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 text-white px-4 py-2 shadow hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Đang lưu…" : "Lưu cấu hình"}
          </button>
        </div>
      </div>

      {/* Giờ mở cửa */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold">Giờ mở cửa</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {DAYS.map((d) => (
            <div key={d.key} className="rounded-xl border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{d.label}</div>
                <button
                  onClick={() => addRange(d.key)}
                  className="text-sm rounded-lg border px-2 py-1 hover:bg-gray-50"
                >
                  + khung giờ
                </button>
              </div>
              <div className="space-y-2">
                {opening[d.key].length === 0 && (
                  <div className="text-sm text-gray-500">Nghỉ</div>
                )}
                {opening[d.key].map((r, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      className="input"
                      value={r.open}
                      onChange={(e) => updateRange(d.key, idx, "open", e.target.value)}
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="time"
                      className="input"
                      value={r.close}
                      onChange={(e) => updateRange(d.key, idx, "close", e.target.value)}
                    />
                    <button
                      className="text-rose-600 hover:text-rose-700 text-sm"
                      onClick={() => removeRange(d.key, idx)}
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media đơn giản */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold">Hình ảnh</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Banner</div>
            {data.bannerUrl ? (
              <img src={data.bannerUrl} alt="banner" className="rounded-xl border" />
            ) : (
              <div className="rounded-xl border p-6 text-sm text-gray-500">Chưa có banner</div>
            )}
          </div>
          <div className="md:col-span-2 space-y-2">
            <div className="text-sm text-gray-600">Gallery</div>
            {data.gallery.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.gallery.map((g) => (
                  <img key={g} src={g} alt="gallery" className="rounded-xl border" />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border p-6 text-sm text-gray-500">Chưa có ảnh</div>
            )}
          </div>
        </div>
        
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
