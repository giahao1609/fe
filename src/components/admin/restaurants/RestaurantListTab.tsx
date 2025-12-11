"use client";

import {
  useEffect,
  useState,
  MouseEvent,
} from "react";
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

import {
  MenuService,
  type MenuItem,
  type MenuItemPageResponse,
} from "@/services/menu.service";

import {
  PreOrderService,
  type PreOrder,
  type PreOrderStatus,
} from "@/services/pre-order.service";

/* ====== Config ====== */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.food-map.online";

// base GCS để fallback nếu imagesSigned không có URL đầy đủ
const GCS_PUBLIC_BASE =
  "https://storage.googleapis.com/khoaluaniuh";

const MENU_LIMIT = 20;

/* ====== Types cơ bản ====== */

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
  isVisible?: boolean;
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

/* Tab trong modal detail */
type DetailTab = "info" | "menu" | "orders";

export default function RestaurantListTab() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // modal detail
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("info");

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<RestaurantDetail | null>(null);

  // menu của nhà hàng trong modal
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [menuPage, setMenuPage] = useState<MenuItemPageResponse | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // pre-orders trong modal
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOwnerRestaurants();
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

  /* ====== Helpers ====== */

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

  // Ảnh món: ưu tiên imagesSigned.url, fallback images, và nếu images là path thì prepend GCS
  const getMenuItemImageUrl = (item: MenuItem): string => {
    const anyItem = item as any;

    const signed = anyItem.imagesSigned as
      | Array<string | { path: string; url: string }>
      | undefined;

    if (Array.isArray(signed) && signed.length > 0) {
      const first = signed[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object" && "url" in first) {
        return (first as { url: string }).url;
      }
    }

    if (Array.isArray(item.images) && item.images.length > 0) {
      const raw = item.images[0] as any;
      if (typeof raw !== "string") return "";
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        return raw;
      }
      // path tương đối trong GCS
      return `${GCS_PUBLIC_BASE}/${raw}`;
    }

    return "";
  };

  const formatPreOrderStatusLabel = (status: PreOrderStatus) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "AWAITING_PAYMENT":
        return "Chờ thanh toán cọc";
      case "PAID":
        return "Đã thanh toán cọc";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "REJECTED":
        return "Từ chối";
      case "CANCELLED":
        return "Khách hủy";
      default:
        return status;
    }
  };

  const preOrderStatusBadgeClass = (status: PreOrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "AWAITING_PAYMENT":
        return "bg-sky-50 text-sky-700 border border-sky-100";
      case "PAID":
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border border-rose-100";
      case "CANCELLED":
        return "bg-gray-100 text-gray-600 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-100";
    }
  };

  const buildPreOrderCode = (o: PreOrder) => {
    if (!o._id) return "—";
    const tail = o._id.slice(-6).toUpperCase();
    return `PO-${tail}`;
  };

  const buildItemsSummary = (o: PreOrder) => {
    const items = o.items || [];
    if (!items.length) return "";
    const parts = items.slice(0, 2).map((it) => `${it.menuItemName} x${it.quantity}`);
    const remain = items.length - parts.length;
    return parts.join(", ") + (remain > 0 ? ` +${remain} món` : "");
  };

  /* ====== Toggle hiển thị ====== */

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

  /* ====== Detail + Menu ====== */

  const loadMenuForRestaurant = async (restaurantId: string, page = 1) => {
    try {
      setMenuLoading(true);
      setMenuError(null);

      const res = await MenuService.listByRestaurant(restaurantId, {
        page,
        limit: MENU_LIMIT,
      });

      setMenuPage(res);
      setMenuItems(res.items || []);
    } catch (err: any) {
      console.error("Load restaurant menu error:", err);
      setMenuError("Không tải được thực đơn của quán.");
      setMenuPage(null);
      setMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  /* ====== Pre-orders (đơn đặt chỗ) ====== */

  const loadOrdersForRestaurant = async (restaurantId: string) => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);

      // dùng service đã khai báo
      const data = await PreOrderService.listForRestaurant(restaurantId);
      setOrders(data || []);
      setOrdersLoaded(true);
    } catch (err: any) {
      console.error("Load restaurant pre-orders error:", err);
      setOrdersError("Không tải được danh sách đơn hàng / đặt chỗ.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Lazy load orders khi user bấm sang tab "orders" lần đầu
  useEffect(() => {
    if (
      detailTab === "orders" &&
      detail?._id &&
      !ordersLoaded &&
      !ordersLoading
    ) {
      loadOrdersForRestaurant(detail._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailTab, detail?._id, ordersLoaded]);

  const handleViewClick = async (r: AdminRestaurant) => {
    setDetailOpen(true);
    setDetailTab("info");

    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);

    setMenuLoading(true);
    setMenuError(null);
    setMenuPage(null);
    setMenuItems([]);

    // reset orders state mỗi lần mở modal
    setOrdersLoading(false);
    setOrdersError(null);
    setOrders([]);
    setOrdersLoaded(false);

    try {
      // chạy song song detail + menu cho nhanh
      const [detailRes, menuRes] = await Promise.all([
        getRestaurantDetail(r._id),
        MenuService.listByRestaurant(r._id, { page: 1, limit: MENU_LIMIT }),
      ]);

      setDetail(detailRes as RestaurantDetail);

      setMenuPage(menuRes);
      setMenuItems(menuRes.items || []);
    } catch (err: any) {
      console.error("Load restaurant detail/menu error:", err);
      setDetailError("Không tải được thông tin chi tiết nhà hàng.");
      setMenuError("Không tải được thực đơn.");
    } finally {
      setDetailLoading(false);
      setMenuLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetail(null);
    setDetailError(null);

    setMenuError(null);
    setMenuPage(null);
    setMenuItems([]);

    setOrdersError(null);
    setOrders([]);
    setOrdersLoaded(false);
  };

  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  /* ====== Render ====== */

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
            className="max-h-[80vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-4 shadow-xl"
            onClick={stopPropagation}
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">
                  {detail ? detail.name : "Chi tiết nhà hàng"}
                </h2>
                <p className="text-xs text-gray-500">
                  Xem nhanh cấu hình, thực đơn và đơn hàng của quán.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeDetail}>
                ✕
              </Button>
            </div>

            {/* Tabs */}
            <div className="mb-3 flex gap-2 border-b pb-1 text-xs">
              <button
                className={`rounded-md px-3 py-1 font-medium ${
                  detailTab === "info"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setDetailTab("info")}
              >
                Thông tin quán
              </button>
              <button
                className={`rounded-md px-3 py-1 font-medium ${
                  detailTab === "menu"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setDetailTab("menu")}
              >
                Thực đơn
              </button>
              <button
                className={`rounded-md px-3 py-1 font-medium ${
                  detailTab === "orders"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setDetailTab("orders")}
              >
                Đơn hàng
              </button>
            </div>

            {/* Loading / error chung cho tab info */}
            {detailLoading && detailTab === "info" && (
              <p className="text-sm text-gray-500">Đang tải thông tin…</p>
            )}
            {detailError && detailTab === "info" && !detailLoading && (
              <p className="text-sm text-red-600">{detailError}</p>
            )}

            {/* TAB: THÔNG TIN QUÁN */}
            {detail &&
              !detailLoading &&
              !detailError &&
              detailTab === "info" && (
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
                        {detail.tags && detail.tags.length > 0 && (
                          <p>
                            <span className="text-gray-500">Tag: </span>
                            <span>{detail.tags.join(", ")}</span>
                          </p>
                        )}
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
                                  ),
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
                    <Button variant="outline" size="sm" onClick={closeDetail}>
                      Đóng
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!detail?._id) return;
                        router.push(`/categories/restaurants/${detail._id}`);
                      }}
                    >
                      Đi đến trang khách
                    </Button>
                  </div>
                </div>
              )}

            {/* TAB: THỰC ĐƠN (đẹp hơn, có ảnh) */}
            {detailTab === "menu" && (
              <div className="mt-1 space-y-3 text-sm">
                {menuLoading && (
                  <p className="text-xs text-gray-500">
                    Đang tải thực đơn…
                  </p>
                )}

                {menuError && !menuLoading && (
                  <p className="text-xs text-red-600">{menuError}</p>
                )}

                {!menuLoading && !menuError && (
                  <>
                    {menuItems.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        Chưa có món nào trong thực đơn.
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {menuItems.map((item) => {
                          const imgSrc = getMenuItemImageUrl(item);
                          const anyItem = item as any;

                          const hasDiscount =
                            typeof anyItem.discountPercent === "number" &&
                            anyItem.discountPercent > 0;

                          return (
                            <div
                              key={item._id}
                              className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                            >
                              {imgSrc && (
                                <div className="relative h-28 w-full">
                                  <Image
                                    src={imgSrc}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                  {hasDiscount && (
                                    <div className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow">
                                      -{anyItem.discountPercent}%
                                    </div>
                                  )}
                                  {!item.isAvailable && (
                                    <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] text-white">
                                      Tạm ngưng
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-1 flex-col gap-2 p-3">
                                {/* Name + type */}
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="line-clamp-2 text-sm font-semibold text-gray-900">
                                      {item.name}
                                    </div>
                                    {item.itemType && (
                                      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-gray-400">
                                        {item.itemType}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Description */}
                                {item.description && (
                                  <p className="line-clamp-3 text-xs text-gray-500">
                                    {item.description}
                                  </p>
                                )}

                                {/* Price */}
                                <div className="flex items-baseline gap-2">
                                  <div className="text-sm font-semibold text-emerald-700">
                                    {item.basePrice.amount.toLocaleString(
                                      "vi-VN",
                                    )}{" "}
                                    {item.basePrice.currency}
                                  </div>
                                  {(item as any).compareAtPrice && (
                                    <div className="text-[11px] text-gray-400 line-through">
                                      {(item as any).compareAtPrice.amount.toLocaleString(
                                        "vi-VN",
                                      )}{" "}
                                      {(item as any).compareAtPrice.currency}
                                    </div>
                                  )}
                                </div>

                                {/* Tags + flags */}
                                <div className="flex flex-wrap gap-1">
                                  {item.tags &&
                                    item.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  {item.spicyLevel > 0 && (
                                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] text-orange-700">
                                      🌶 {item.spicyLevel}
                                    </span>
                                  )}
                                  {item.vegetarian && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                                      Veg
                                    </span>
                                  )}
                                  {item.vegan && (
                                    <span className="rounded-full bg-lime-50 px-2 py-0.5 text-[11px] text-lime-700">
                                      Vegan
                                    </span>
                                  )}
                                  {item.halal && (
                                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">
                                      Halal
                                    </span>
                                  )}
                                  {item.glutenFree && (
                                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] text-purple-700">
                                      GF
                                    </span>
                                  )}
                                </div>

                                {/* UpdatedAt */}
                                <div className="mt-auto text-[11px] text-gray-400">
                                  Cập nhật:{" "}
                                  {item.updatedAt
                                    ? new Date(
                                        item.updatedAt,
                                      ).toLocaleString("vi-VN")
                                    : "—"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Pagination menu */}
                    {menuPage && menuPage.pages > 1 && (
                      <div className="flex items-center justify-between pt-2 text-xs">
                        <div>
                          Trang {menuPage.page}/{menuPage.pages} •{" "}
                          {menuPage.total} món
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={menuPage.page <= 1 || menuLoading}
                            onClick={() => {
                              if (!detail?._id) return;
                              loadMenuForRestaurant(
                                detail._id,
                                menuPage.page - 1,
                              );
                            }}
                          >
                            Trước
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              menuPage.page >= menuPage.pages || menuLoading
                            }
                            onClick={() => {
                              if (!detail?._id) return;
                              loadMenuForRestaurant(
                                detail._id,
                                menuPage.page + 1,
                              );
                            }}
                          >
                            Sau
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB: ĐƠN HÀNG (pre-orders) */}
            {detailTab === "orders" && (
              <div className="mt-1 space-y-3 text-sm">
                {ordersLoading && (
                  <p className="text-xs text-gray-500">
                    Đang tải đơn hàng / đặt chỗ…
                  </p>
                )}

                {ordersError && !ordersLoading && (
                  <p className="text-xs text-red-600">{ordersError}</p>
                )}

                {!ordersLoading && !ordersError && (
                  <>
                    {orders.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        Chưa có đơn hàng / đặt chỗ nào.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mã đơn</TableHead>
                              <TableHead>Khách / liên hệ</TableHead>
                              <TableHead>Thời gian đến</TableHead>
                              <TableHead>Số khách</TableHead>
                              <TableHead>Tổng tiền / cọc</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead>Món</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.map((o) => (
                              <TableRow key={o._id}>
                                {/* Mã đơn */}
                                <TableCell className="font-mono text-xs">
                                  {buildPreOrderCode(o)}
                                </TableCell>

                                {/* Khách */}
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span>{o.contactName}</span>
                                    {o.contactPhone && (
                                      <span className="text-[11px] text-gray-500">
                                        {o.contactPhone}
                                      </span>
                                    )}
                                  </div>
                                </TableCell>

                                {/* Thời gian đến */}
                                <TableCell className="text-xs text-gray-600">
                                  {o.arrivalTime
                                    ? new Date(
                                        o.arrivalTime,
                                      ).toLocaleString("vi-VN")
                                    : "—"}
                                </TableCell>

                                {/* Số khách */}
                                <TableCell className="text-xs">
                                  {o.guestCount ?? "—"}
                                </TableCell>

                                {/* Tổng tiền + cọc */}
                                <TableCell>
                                  <div className="font-medium text-emerald-700">
                                    {o.totalAmount
                                      ? `${o.totalAmount.amount.toLocaleString(
                                          "vi-VN",
                                        )} ${o.totalAmount.currency}`
                                      : "—"}
                                  </div>
                                  {o.requiredDepositAmount && (
                                    <div className="text-[11px] text-amber-700">
                                      Cọc:{" "}
                                      {o.requiredDepositAmount.amount.toLocaleString(
                                        "vi-VN",
                                      )}{" "}
                                      {o.requiredDepositAmount.currency}
                                      {typeof o.depositPercent === "number" &&
                                      o.depositPercent > 0
                                        ? ` (${o.depositPercent}%)`
                                        : ""}
                                    </div>
                                  )}
                                </TableCell>

                                {/* Trạng thái */}
                                <TableCell>
                                  <div className="flex flex-col gap-0.5">
                                    <span
                                      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${preOrderStatusBadgeClass(
                                        o.status,
                                      )}`}
                                    >
                                      {formatPreOrderStatusLabel(o.status)}
                                    </span>
                                    {o.paidAt && (
                                      <span className="text-[11px] text-emerald-700">
                                        Đã thanh toán:{" "}
                                        {new Date(
                                          o.paidAt,
                                        ).toLocaleString("vi-VN")}
                                      </span>
                                    )}
                                    {!o.paidAt &&
                                      o.paymentEmailSentAt && (
                                        <span className="text-[11px] text-sky-700">
                                          Đã gửi email cọc:{" "}
                                          {new Date(
                                            o.paymentEmailSentAt,
                                          ).toLocaleString("vi-VN")}
                                        </span>
                                      )}
                                  </div>
                                </TableCell>

                                {/* Món */}
                                <TableCell className="max-w-xs text-xs text-gray-600">
                                  {buildItemsSummary(o) || "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Footer chung nếu muốn luôn hiện */}
            {detailTab !== "info" && (
              <div className="mt-4 flex justify-between gap-2 border-t pt-3">
                <Button variant="outline" size="sm" onClick={closeDetail}>
                  Đóng
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!detail?._id) return;
                    router.push(`/categories/restaurants/${detail._id}`);
                  }}
                >
                  Đi đến trang khách
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
