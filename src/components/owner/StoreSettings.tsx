"use client";

import { useEffect, useState, DragEvent } from "react";
import {
  RestaurantService,
  type Restaurant,
} from "@/services/restaurant.service";

type BankTransferForm = {
  bankCode: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  note?: string;
};

type EWalletForm = {
  provider: string;
  displayName: string;
  phoneNumber: string;
  note?: string;
};

export default function OverviewTab() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // ==== BASIC INFO (edit nhẹ) ====
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState<"$" | "$$" | "$$$" | "$$$$">("$$");

  // ==== PAYMENT CONFIG ====
  const [allowCash, setAllowCash] = useState(true);
  const [allowBankTransfer, setAllowBankTransfer] = useState(true);
  const [allowEWallet, setAllowEWallet] = useState(true);
  const [generalNote, setGeneralNote] = useState("");

  const [bankTransfers, setBankTransfers] = useState<BankTransferForm[]>([
    { bankCode: "", bankName: "", accountName: "", accountNumber: "" },
  ]);
  const [eWallets, setEWallets] = useState<EWalletForm[]>([
    { provider: "", displayName: "", phoneNumber: "" },
  ]);

  // ==== QR FILES ====
  const [bankQrFiles, setBankQrFiles] = useState<File[]>([]);
  const [ewalletQrFiles, setEwalletQrFiles] = useState<File[]>([]);
  const [bankQrPreviews, setBankQrPreviews] = useState<string[]>([]);
  const [ewalletQrPreviews, setEwalletQrPreviews] = useState<string[]>([]);
  const [bankQrDragging, setBankQrDragging] = useState(false);
  const [ewalletQrDragging, setEwalletQrDragging] = useState(false);

  // ====== LOAD LIST NHÀ HÀNG CỦA OWNER ======
  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      setListError(null);
      try {
        const res = (await RestaurantService.getByOwner()) as any;
        const items: Restaurant[] = Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res)
          ? res
          : [];

        if (!items.length) {
          setListError("Bạn chưa có nhà hàng nào. Hãy tạo quán ở tab Đăng quán trước.");
        } else {
          console.log("item", items)
          setRestaurants(items);
          setSelectedId(items[0]._id);
          setSelectedRestaurant(items[0]);
          hydrateFormFromRestaurant(items[0]);
        }
      } catch (err: any) {
        console.error(err);
        setListError(err?.message || "Không tải được danh sách nhà hàng.");
      } finally {
        setLoadingList(false);
      }
    };

    load();
  }, []);

  // Khi đổi selectedId → tìm restaurant tương ứng rồi hydrate form
  useEffect(() => {
    if (!selectedId) return;
    const r = restaurants.find((x) => x._id === selectedId);
    if (r) {
      setSelectedRestaurant(r);
      hydrateFormFromRestaurant(r);
    }
  }, [selectedId, restaurants]);

  // ==== ĐỔ DATA FORM TỪ RESTAURANT ====
  const hydrateFormFromRestaurant = (r: Restaurant) => {
    setError(null);
    setMsg(null);

    setName(r.name || "");
    setPriceRange((r.priceRange as any) || "$$");
    setPhone(((r as any).phone as string) || "");
    setEmail(((r as any).email as string) || "");
    setWebsite(((r as any).website as string) || "");
    setDescription(((r as any).description as string) || "");

    const pc = (r as any).paymentConfig || {};
    setAllowCash(pc.allowCash ?? true);
    setAllowBankTransfer(pc.allowBankTransfer ?? true);
    setAllowEWallet(pc.allowEWallet ?? true);
    setGeneralNote(pc.generalNote ?? "");

    const banks: BankTransferForm[] =
      Array.isArray(pc.bankTransfers) && pc.bankTransfers.length > 0
        ? pc.bankTransfers.map((b: any) => ({
            bankCode: b.bankCode || "",
            bankName: b.bankName || "",
            accountName: b.accountName || "",
            accountNumber: b.accountNumber || "",
            branch: b.branch || "",
            note: b.note || "",
          }))
        : [{ bankCode: "", bankName: "", accountName: "", accountNumber: "" }];

    const wallets: EWalletForm[] =
      Array.isArray(pc.eWallets) && pc.eWallets.length > 0
        ? pc.eWallets.map((w: any) => ({
            provider: w.provider || "",
            displayName: w.displayName || "",
            phoneNumber: w.phoneNumber || "",
            note: w.note || "",
          }))
        : [{ provider: "", displayName: "", phoneNumber: "" }];

    setBankTransfers(banks);
    setEWallets(wallets);

    // clear file mới
    setBankQrFiles([]);
    setEwalletQrFiles([]);
    setBankQrPreviews([]);
    setEwalletQrPreviews([]);
  };

  // ==== Drag helpers cho QR ====
  const onDragOver =
    (setDragging: (b: boolean) => void) =>
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(true);
    };

  const onDragLeave =
    (setDragging: (b: boolean) => void) =>
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
    };

  const handleBankQrDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setBankQrDragging(false);
    const files = e.dataTransfer.files
      ? Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
      : [];
    if (files.length) {
      setBankQrFiles((prev) => [...prev, ...files]);
      setBankQrPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
  };

  const handleEwalletQrDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setEwalletQrDragging(false);
    const files = e.dataTransfer.files
      ? Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
      : [];
    if (files.length) {
      setEwalletQrFiles((prev) => [...prev, ...files]);
      setEwalletQrPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
  };

  const handleBankQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) {
      setBankQrFiles((prev) => [...prev, ...files]);
      setBankQrPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
  };

  const handleEwalletQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) {
      setEwalletQrFiles((prev) => [...prev, ...files]);
      setEwalletQrPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
  };

  // ==== helpers edit list bank/ewallet ====
  const updateBankTransfer = (i: number, key: keyof BankTransferForm, v: string) => {
    setBankTransfers((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: v };
      return next;
    });
  };

  const addBankTransfer = () =>
    setBankTransfers((prev) => [...prev, { bankCode: "", bankName: "", accountName: "", accountNumber: "" }]);

  const removeBankTransfer = (i: number) =>
    setBankTransfers((prev) => prev.filter((_, idx) => idx !== i));

  const updateEWallet = (i: number, key: keyof EWalletForm, v: string) => {
    setEWallets((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: v };
      return next;
    });
  };

  const addEWallet = () =>
    setEWallets((prev) => [...prev, { provider: "", displayName: "", phoneNumber: "" }]);

  const removeEWallet = (i: number) =>
    setEWallets((prev) => prev.filter((_, idx) => idx !== i));

  // ==== SUBMIT UPDATE ====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant?._id) return;

    setSaving(true);
    setError(null);
    setMsg(null);

    const payload: any = {
      name: name.trim(),
      priceRange,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      description: description.trim() || undefined,
      paymentConfig: {
        allowCash,
        allowBankTransfer,
        allowEWallet,
        generalNote: generalNote.trim() || undefined,
        bankTransfers: bankTransfers
          .filter((b) => b.bankCode || b.bankName || b.accountName || b.accountNumber)
          .map((b) => ({
            bankCode: b.bankCode.trim(),
            bankName: b.bankName.trim(),
            accountName: b.accountName.trim(),
            accountNumber: b.accountNumber.trim(),
            branch: b.branch?.trim() || undefined,
            note: b.note?.trim() || undefined,
          })),
        eWallets: eWallets
          .filter((w) => w.provider || w.displayName || w.phoneNumber)
          .map((w) => ({
            provider: w.provider.trim(),
            displayName: w.displayName.trim(),
            phoneNumber: w.phoneNumber.trim(),
            note: w.note?.trim() || undefined,
          })),
      },
      bankQrs: bankQrFiles,
      ewalletQrs: ewalletQrFiles,
    };

    try {
      const updated = await (RestaurantService as any).updateOwnerRestaurant(
        selectedRestaurant._id,
        payload,
      );

      // cập nhật vào list
      setRestaurants((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r)),
      );
      setSelectedRestaurant(updated);
      hydrateFormFromRestaurant(updated);
      setMsg("✅ Đã cập nhật thông tin và cấu hình thanh toán.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "❌ Không thể cập nhật nhà hàng. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ====== RENDER ======
  if (loadingList) {
    return <p className="text-sm text-gray-500">Đang tải danh sách nhà hàng…</p>;
  }

  if (listError && !restaurants.length) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {listError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 p-[1px]">
        <div className="flex h-full flex-col justify-between gap-4 rounded-2xl bg-white/90 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý nhà hàng của bạn</h1>
            <p className="mt-1 text-sm text-gray-600">
              Chọn 1 quán ở danh sách bên trái để chỉnh sửa thông tin cơ bản và cấu hình thanh toán.
            </p>
          </div>
          <div className="space-y-1 text-right text-xs text-gray-500">
            <p>Tổng số nhà hàng: <span className="font-semibold text-gray-800">{restaurants.length}</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,2.5fr]">
        {/* LEFT: LIST RESTAURANTS */}
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Danh sách nhà hàng
          </h2>
          {listError && (
            <p className="text-xs text-rose-500">{listError}</p>
          )}

          <div className="mt-2 space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {restaurants.map((r) => {
              const active = selectedId === r._id;
              const pc = (r as any).paymentConfig || {};
              const addr = r.address;
              const addrText = addr
                ? `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`
                : "";

              const paymentSummary = [
                pc.allowCash ? "Tiền mặt" : null,
                pc.allowBankTransfer ? "Chuyển khoản" : null,
                pc.allowEWallet ? "Ví điện tử" : null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <button
                  key={r._id}
                  type="button"
                  onClick={() => setSelectedId(r._id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left text-xs transition ${
                    active
                      ? "border-rose-400 bg-rose-50"
                      : "border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {r.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-500 line-clamp-2">
                        {addrText || "Chưa có địa chỉ chi tiết"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {r.priceRange && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                          {r.priceRange}
                        </span>
                      )}
                      {"isActive" in r && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]">
                          {(r as any).isActive ? (
                            <span className="bg-emerald-50 text-emerald-700 rounded-full px-2 py-[1px]">
                              Hoạt động
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-[1px]">
                              Tạm ẩn
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-600">
                    <span>
                      Thanh toán:{" "}
                      {paymentSummary || (
                        <span className="text-gray-400">Chưa cấu hình</span>
                      )}
                    </span>
                    {"rating" in r && (
                      <span>
                        ⭐{" "}
                        {(r as any).rating != null
                          ? (r as any).rating.toFixed
                            ? (r as any).rating.toFixed(1)
                            : (r as any).rating
                          : "Chưa có"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: EDIT PANEL */}
        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          {!selectedRestaurant ? (
            <p className="text-sm text-gray-500">
              Chọn 1 nhà hàng bên trái để chỉnh sửa.
            </p>
          ) : (
            <>
              {/* Info top */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Chỉnh sửa: {selectedRestaurant.name}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Cập nhật thông tin cơ bản và cấu hình thanh toán cho nhà hàng này.
                  </p>
                </div>
                <div className="text-right text-[11px] text-gray-500">
                  {"createdAt" in selectedRestaurant && (
                    <p>
                      Tạo:{" "}
                      {new Date(
                        (selectedRestaurant as any).createdAt as string,
                      ).toLocaleString()}
                    </p>
                  )}
                  {"updatedAt" in selectedRestaurant && (
                    <p>
                      Sửa lần cuối:{" "}
                      {new Date(
                        (selectedRestaurant as any).updatedAt as string,
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* THÔNG TIN CƠ BẢN */}
                <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    01 · Thông tin cơ bản
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Tên nhà hàng
                    </label>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Khoảng giá
                      </label>
                      <select
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        value={priceRange}
                        onChange={(e) =>
                          setPriceRange(
                            e.target.value as "$" | "$$" | "$$$" | "$$$$",
                          )
                        }
                      >
                        <option value="$">$ – Bình dân</option>
                        <option value="$$">$$ – Vừa phải</option>
                        <option value="$$$">$$$ – Hơi cao</option>
                        <option value="$$$$">$$$$ – Cao cấp</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Số điện thoại
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="SĐT liên hệ"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email liên hệ"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">
                        Website / Fanpage
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Mô tả ngắn
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Giới thiệu ngắn về quán, món nổi bật..."
                    />
                  </div>
                </div>

                {/* CẤU HÌNH THANH TOÁN */}
                <div className="space-y-3 rounded-xl bg-emerald-50/60 p-4">
                  <div className="mb-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      02 · Cấu hình thanh toán
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Bật/tắt phương thức & nhập thông tin nhận tiền cho nhà hàng này.
                    </p>
                  </div>

                  {/* toggles */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={allowCash}
                        onChange={(e) => setAllowCash(e.target.checked)}
                      />
                      Tiền mặt
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={allowBankTransfer}
                        onChange={(e) => setAllowBankTransfer(e.target.checked)}
                      />
                      Chuyển khoản ngân hàng
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={allowEWallet}
                        onChange={(e) => setAllowEWallet(e.target.checked)}
                      />
                      Ví điện tử
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Ghi chú chung (hiển thị cho khách)
                    </label>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      value={generalNote}
                      onChange={(e) => setGeneralNote(e.target.value)}
                      placeholder="VD: Vui lòng ghi mã đơn ở phần nội dung chuyển khoản…"
                    />
                  </div>

                  {/* Ngân hàng */}
                  {allowBankTransfer && (
                    <div className="space-y-2 rounded-xl border border-emerald-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-emerald-700">
                          Tài khoản ngân hàng
                        </p>
                        <button
                          type="button"
                          onClick={addBankTransfer}
                          className="text-xs font-medium text-emerald-700 hover:underline"
                        >
                          + Thêm tài khoản
                        </button>
                      </div>
                      <div className="space-y-3">
                        {bankTransfers.map((b, idx) => (
                          <div key={idx} className="grid gap-2 sm:grid-cols-2">
                            <input
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                              placeholder="Mã NH (VD: VCB)"
                              value={b.bankCode}
                              onChange={(e) =>
                                updateBankTransfer(idx, "bankCode", e.target.value)
                              }
                            />
                            <input
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                              placeholder="Tên ngân hàng"
                              value={b.bankName}
                              onChange={(e) =>
                                updateBankTransfer(idx, "bankName", e.target.value)
                              }
                            />
                            <input
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                              placeholder="Tên chủ tài khoản"
                              value={b.accountName}
                              onChange={(e) =>
                                updateBankTransfer(idx, "accountName", e.target.value)
                              }
                            />
                            <div className="flex items-center gap-2">
                              <input
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                                placeholder="Số tài khoản"
                                value={b.accountNumber}
                                onChange={(e) =>
                                  updateBankTransfer(idx, "accountNumber", e.target.value)
                                }
                              />
                              {bankTransfers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeBankTransfer(idx)}
                                  className="text-xs text-rose-600 hover:underline"
                                >
                                  Xóa
                                </button>
                              )}
                            </div>
                            <input
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                              placeholder="Chi nhánh (tùy chọn)"
                              value={b.branch || ""}
                              onChange={(e) =>
                                updateBankTransfer(idx, "branch", e.target.value)
                              }
                            />
                            <input
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                              placeholder="Ghi chú (tùy chọn)"
                              value={b.note || ""}
                              onChange={(e) =>
                                updateBankTransfer(idx, "note", e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>

                      {/* Bank QRs */}
                      <div className="mt-3 space-y-1">
                        <label className="text-xs font-medium text-gray-700">
                          QR chuyển khoản (ảnh mới)
                        </label>
                        <div
                          onDragOver={onDragOver(setBankQrDragging)}
                          onDragLeave={onDragLeave(setBankQrDragging)}
                          onDrop={handleBankQrDrop}
                          className={`flex cursor-pointer flex-col gap-1 rounded-xl border border-dashed px-3 py-3 text-xs transition ${
                            bankQrDragging
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-300 bg-white hover:border-emerald-300"
                          }`}
                          onClick={() =>
                            document.getElementById("bankqr-input")?.click()
                          }
                        >
                          <p className="font-medium text-gray-700">
                            Kéo thả ảnh QR ngân hàng vào đây
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Có thể chọn nhiều file.
                          </p>
                          {bankQrFiles.length > 0 && (
                            <p className="text-[11px] text-emerald-600">
                              Đã chọn {bankQrFiles.length} ảnh.
                            </p>
                          )}
                        </div>
                        <input
                          id="bankqr-input"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleBankQrChange}
                        />
                        {bankQrPreviews.length > 0 && (
                          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                            {bankQrPreviews.map((src, idx) => (
                              <div
                                key={idx}
                                className="relative h-20 overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src}
                                  alt={`Bank QR ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ví điện tử */}
                  {allowEWallet && (
                    <div className="space-y-2 rounded-xl border border-emerald-200 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-emerald-700">
                          Ví điện tử
                        </p>
                        <button
                          type="button"
                          onClick={addEWallet}
                          className="text-xs font-medium text-emerald-700 hover:underline"
                        >
                          + Thêm ví
                        </button>
                      </div>
                      <div className="space-y-3">
                        {eWallets.map((w, idx) => (
                          <div key={idx} className="grid gap-2 sm:grid-cols-2">
                            <input
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                              placeholder="Nhà cung cấp (VD: MOMO, ZaloPay)"
                              value={w.provider}
                              onChange={(e) =>
                                updateEWallet(idx, "provider", e.target.value)
                              }
                            />
                            <input
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                              placeholder="Tên hiển thị"
                              value={w.displayName}
                              onChange={(e) =>
                                updateEWallet(idx, "displayName", e.target.value)
                              }
                            />
                            <div className="flex items-center gap-2">
                              <input
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                                placeholder="Số điện thoại"
                                value={w.phoneNumber}
                                onChange={(e) =>
                                  updateEWallet(idx, "phoneNumber", e.target.value)
                                }
                              />
                              {eWallets.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeEWallet(idx)}
                                  className="text-xs text-rose-600 hover:underline"
                                >
                                  Xóa
                                </button>
                              )}
                            </div>
                            <input
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                              placeholder="Ghi chú (tùy chọn)"
                              value={w.note || ""}
                              onChange={(e) =>
                                updateEWallet(idx, "note", e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>

                      {/* Ewallet QRs */}
                      <div className="mt-3 space-y-1">
                        <label className="text-xs font-medium text-gray-700">
                          QR ví điện tử (ảnh mới)
                        </label>
                        <div
                          onDragOver={onDragOver(setEwalletQrDragging)}
                          onDragLeave={onDragLeave(setEwalletQrDragging)}
                          onDrop={handleEwalletQrDrop}
                          className={`flex cursor-pointer flex-col gap-1 rounded-xl border border-dashed px-3 py-3 text-xs transition ${
                            ewalletQrDragging
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-300 bg-white hover:border-emerald-300"
                          }`}
                          onClick={() =>
                            document.getElementById("ewalletqr-input")?.click()
                          }
                        >
                          <p className="font-medium text-gray-700">
                            Kéo thả ảnh QR ví điện tử vào đây
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Có thể chọn nhiều file.
                          </p>
                          {ewalletQrFiles.length > 0 && (
                            <p className="text-[11px] text-emerald-600">
                              Đã chọn {ewalletQrFiles.length} ảnh.
                            </p>
                          )}
                        </div>
                        <input
                          id="ewalletqr-input"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleEwalletQrChange}
                        />
                        {ewalletQrPreviews.length > 0 && (
                          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                            {ewalletQrPreviews.map((src, idx) => (
                              <div
                                key={idx}
                                className="relative h-20 overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src}
                                  alt={`Ewallet QR ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* SUBMIT */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                      saving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                  >
                    {saving ? "Đang lưu thay đổi..." : "Lưu thay đổi cho nhà hàng này"}
                  </button>
                </div>
              </form>

              {(msg || error) && (
                <div className="rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm">
                  {msg && <p className="text-emerald-700">{msg}</p>}
                  {error && <p className="text-rose-600">{error}</p>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
