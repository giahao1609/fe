"use client";

import { useEffect, useState, MouseEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  getOwnerRestaurants,
  toggleRestaurantVisibility,
  getRestaurantDetail, 
} from "@/lib/api/restaurant";

type Address = {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  formatted?: string;
};

type OpeningPeriod = {
  opens: string;
  closes: string;
};

type OpeningDay = {
  day?: string;
  periods: OpeningPeriod[];
  closed: boolean;
  is24h: boolean;
};

type PaymentQr = {
  imageUrl?: string;
  rawContent?: string;
  description?: string;
};

type BankTransferInfo = {
  bankCode?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branch?: string;
  qr?: PaymentQr;
  note?: string;
};

type EWalletInfo = {
  provider?: "MOMO" | "ZALOPAY" | "VIETTELPAY" | "VNPAY" | "OTHER";
  displayName?: string;
  phoneNumber?: string;
  accountId?: string;
  qr?: PaymentQr;
  note?: string;
};

type PaymentConfig = {
  allowCash?: boolean;
  allowBankTransfer?: boolean;
  allowEWallet?: boolean;
  bankTransfers?: BankTransferInfo[];
  eWallets?: EWalletInfo[];
  generalNote?: string;
};

type AdminRestaurant = {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address?: Address;
  priceRange?: string;
  rating?: number | null;
  categoryName?: string | null;
  isActive?: boolean;
  isVisible?: boolean; // nếu sau này có field riêng
};

type RestaurantDetail = AdminRestaurant & {
  shortName?: string;
  phone?: string;
  website?: string;
  email?: string;
  cuisine?: string[];
  amenities?: string[];
  openingHours?: OpeningDay[];
  paymentConfig?: PaymentConfig;
  coordinates?: { lat: number | null; lng: number | null };
  distanceText?: string | null;
  tags?: string[];
};

export default function RestaurantListTab() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<RestaurantDetail | null>(null);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOwnerRestaurants();
      console.log("res", res);
      setRestaurants(res);
    } catch (err: any) {
      console.error("Fetch restaurants error:", err);
      setError("Không tải được danh sách nhà hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const formatShortAddress = (addr?: Address) => {
    if (!addr) return "—";
    const parts = [addr.street, addr.ward, addr.district, addr.city]
      .filter(Boolean)
      .join(", ");
    return parts || "—";
  };

  const formatFullAddress = (addr?: Address) => {
    if (!addr) return "—";
    if (addr.formatted) return addr.formatted;
    const parts = [
      addr.street,
      addr.ward,
      addr.district,
      addr.city,
      addr.country,
    ]
      .filter(Boolean)
      .join(", ");
    return parts || "—";
  };

  const formatRating = (rating?: number | null) => {
    if (!rating && rating !== 0) return "Chưa có";
    return `${rating.toFixed(1)} ⭐`;
  };

  const dayLabel = (d?: string) => {
    if (!d) return "—";
    const map: Record<string, string> = {
      Mon: "Thứ 2",
      Tue: "Thứ 3",
      Wed: "Thứ 4",
      Thu: "Thứ 5",
      Fri: "Thứ 6",
      Sat: "Thứ 7",
      Sun: "Chủ nhật",
    };
    return map[d] || d;
  };

  const handleToggleVisibility = async (r: AdminRestaurant) => {
    const currentVisible = (r.isVisible ?? r.isActive ?? true) as boolean;
    const nextVisible = !currentVisible;

    const confirmText = nextVisible
      ? "Bạn có chắc muốn HIỆN nhà hàng này cho người dùng?"
      : "Bạn có chắc muốn ẨN nhà hàng này khỏi người dùng?";

    if (!confirm(confirmText)) return;

    try {
      setTogglingId(r._id);
      await toggleRestaurantVisibility(r._id, nextVisible);
      await fetchRestaurants();
    } catch (err: any) {
      console.error("Toggle visibility error:", err);
      alert("Không cập nhật được trạng thái hiển thị, vui lòng thử lại.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleViewClick = async (r: AdminRestaurant) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);

    try {
      // dùng _id, BE findDetail hỗ trợ ObjectId
      const data = await getRestaurantDetail(r._id);
      setDetail(data);
    } catch (err: any) {
      console.error("Load restaurant detail error:", err);
      setDetailError("Không tải được thông tin chi tiết.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetail(null);
    setDetailError(null);
  };

  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <>
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Danh sách nhà hàng</h3>
          {loading && (
            <span className="text-xs text-gray-500">Đang tải dữ liệu…</span>
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quán</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Khoảng giá</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {restaurants.length > 0 ? (
              restaurants.map((r) => {
                const isVisible = (r.isVisible ?? r.isActive ?? true) as boolean;

                return (
                  <TableRow key={r._id}>
                    {/* Quán (logo + tên + slug) */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                          {r.logoUrl ? (
                            <Image
                              src={r.logoUrl}
                              alt={r.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              No logo
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {r.name}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            slug: <span className="font-mono">{r.slug}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Địa chỉ */}
                    <TableCell className="max-w-xs text-sm text-gray-700">
                      {formatShortAddress(r.address)}
                    </TableCell>

                    {/* Category */}
                    <TableCell className="text-sm">
                      {r.categoryName || "—"}
                    </TableCell>

                    {/* Price range */}
                    <TableCell className="text-sm">
                      {r.priceRange || "—"}
                    </TableCell>

                    {/* Rating */}
                    <TableCell className="text-sm">
                      {formatRating(r.rating ?? null)}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          isVisible
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isVisible ? "Đang hiển thị" : "Đang ẩn"}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClick(r)}
                      >
                        Xem
                      </Button>

                      <Button
                        variant={isVisible ? "destructive" : "outline"}
                        size="sm"
                        className={
                          isVisible ? "" : "border-emerald-500 text-emerald-700"
                        }
                        disabled={togglingId === r._id}
                        onClick={() => handleToggleVisibility(r)}
                      >
                        {togglingId === r._id
                          ? "Đang cập nhật..."
                          : isVisible
                          ? "Ẩn"
                          : "Hiện"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400">
                  Chưa có nhà hàng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL DETAIL */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2"
          onClick={closeDetail}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-4 shadow-xl"
            onClick={stopPropagation}
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">
                  {detail ? detail.name : "Chi tiết nhà hàng"}
                </h2>
                <p className="text-xs text-gray-500">
                  Xem nhanh thông tin cấu hình của quán.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeDetail}>
                ✕
              </Button>
            </div>

            {detailLoading && (
              <p className="text-sm text-gray-500">Đang tải thông tin…</p>
            )}

            {detailError && !detailLoading && (
              <p className="text-sm text-red-600">{detailError}</p>
            )}

            {detail && !detailLoading && !detailError && (
              <div className="space-y-4 text-sm">
                {/* Cover + basic */}
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                  {detail.coverImageUrl && (
                    <div className="relative h-32 w-full">
                      <Image
                        src={detail.coverImageUrl}
                        alt={detail.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 left-2 flex items-center gap-2">
                        {detail.logoUrl && (
                          <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white bg-white">
                            <Image
                              src={detail.logoUrl}
                              alt={detail.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="text-white drop-shadow">
                          <div className="text-sm font-semibold">
                            {detail.name}
                          </div>
                          {detail.categoryName && (
                            <div className="text-xs">
                              {detail.categoryName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 p-3 sm:grid-cols-2">
                    {/* Basic info */}
                    <div className="space-y-1">
                      <p>
                        <span className="text-gray-500">Tên quán: </span>
                        <span className="font-medium">{detail.name}</span>
                      </p>
                      {detail.slug && (
                        <p>
                          <span className="text-gray-500">Slug: </span>
                          <span className="font-mono text-xs">
                            {detail.slug}
                          </span>
                        </p>
                      )}
                      <p>
                        <span className="text-gray-500">Khoảng giá: </span>
                        {detail.priceRange || "—"}
                      </p>
                      <p>
                        <span className="text-gray-500">Đánh giá: </span>
                        {formatRating(detail.rating ?? null)}
                      </p>
                    </div>

                    {/* Contact & address */}
                    <div className="space-y-1">
                      <p>
                        <span className="text-gray-500">SĐT: </span>
                        {detail.phone || "—"}
                      </p>
                      <p>
                        <span className="text-gray-500">Email: </span>
                        {detail.email || "—"}
                      </p>
                      <p>
                        <span className="text-gray-500">Website: </span>
                        {detail.website || "—"}
                      </p>
                      <p>
                        <span className="text-gray-500">Địa chỉ: </span>
                        {formatFullAddress(detail.address)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opening hours */}
                <div>
                  <h4 className="mb-1 text-xs font-semibold text-gray-800">
                    Giờ mở cửa
                  </h4>
                  {detail.openingHours && detail.openingHours.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {detail.openingHours.map((d, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs"
                        >
                          <div className="mb-1 font-semibold">
                            {dayLabel(d.day)}
                          </div>
                          {d.closed ? (
                            <div className="text-red-500">Đóng cửa</div>
                          ) : d.is24h ? (
                            <div>Mở cửa 24/7</div>
                          ) : d.periods && d.periods.length > 0 ? (
                            d.periods.map((p, i2) => (
                              <div key={i2}>
                                {p.opens} – {p.closes}
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-400">
                              Không có dữ liệu
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Chưa cấu hình giờ mở cửa.
                    </p>
                  )}
                </div>

                {/* Payment config */}
                <div>
                  <h4 className="mb-1 text-xs font-semibold text-gray-800">
                    Cấu hình thanh toán
                  </h4>
                  {detail.paymentConfig ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                            detail.paymentConfig.allowCash
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          💵 Tiền mặt
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                            detail.paymentConfig.allowBankTransfer
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          🏦 Chuyển khoản
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                            detail.paymentConfig.allowEWallet
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          📱 Ví điện tử
                        </span>
                      </div>

                      {detail.paymentConfig.bankTransfers &&
                        detail.paymentConfig.bankTransfers.length > 0 && (
                          <div>
                            <div className="font-semibold">
                              Tài khoản ngân hàng
                            </div>
                            <div className="space-y-1">
                              {detail.paymentConfig.bankTransfers.map(
                                (b, i) => (
                                  <div
                                    key={i}
                                    className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                                  >
                                    <div className="font-medium">
                                      {b.bankName || b.bankCode || "Ngân hàng"}
                                    </div>
                                    <div>
                                      {b.accountName} • {b.accountNumber}
                                    </div>
                                    {b.branch && (
                                      <div className="text-gray-500">
                                        Chi nhánh: {b.branch}
                                      </div>
                                    )}
                                    {b.note && (
                                      <div className="text-gray-500">
                                        Ghi chú: {b.note}
                                      </div>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {detail.paymentConfig.eWallets &&
                        detail.paymentConfig.eWallets.length > 0 && (
                          <div>
                            <div className="font-semibold">Ví điện tử</div>
                            <div className="space-y-1">
                              {detail.paymentConfig.eWallets.map((w, i) => (
                                <div
                                  key={i}
                                  className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                                >
                                  <div className="font-medium">
                                    {w.displayName || w.provider || "Ví điện tử"}
                                  </div>
                                  {w.phoneNumber && (
                                    <div>SĐT: {w.phoneNumber}</div>
                                  )}
                                  {w.accountId && (
                                    <div>ID: {w.accountId}</div>
                                  )}
                                  {w.note && (
                                    <div className="text-gray-500">
                                      Ghi chú: {w.note}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {detail.paymentConfig.generalNote && (
                        <div className="text-gray-600">
                          Ghi chú chung: {detail.paymentConfig.generalNote}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Chưa cấu hình thanh toán.
                    </p>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="mt-3 flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeDetail}
                  >
                    Đóng
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!detail?._id) return;
                      router.push(
                        `/categories/restaurants/${detail._id}`
                      );
                    }}
                  >
                    Đi đến trang khách
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
