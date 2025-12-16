// app/me/pre-orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiService } from "@/services/api.service";

// ===== TYPES =====

type Money = {
  currency?: string;
  amount?: number;
  value?: number; // fallback nếu backend dùng field này
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

type EWalletProvider = "MOMO" | "ZALOPAY" | "VIETTELPAY" | "VNPAY" | "OTHER";

type EWalletInfo = {
  provider?: EWalletProvider;
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

type Address = {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  locationType?: string;
  coordinates?: number[];
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

type Restaurant = {
  _id: string;
  id: string;
  ownerId: string;
  categoryId?: string;
  name: string;
  slug?: string;
  shortName?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  gallery?: string[];
  address?: Address;
  location?: {
    type?: string;
    coordinates?: number[];
  };
  cuisine?: string[];
  priceRange?: string;
  rating?: number | null;
  amenities?: string[];
  openingHours?: OpeningDay[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  tags?: string[];
  searchTerms?: string[];
  paymentConfig?: PaymentConfig;
  isActive?: boolean;
  isHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type MenuItem = {
  _id: string;
  id: string;
  restaurantId: string;
  name: string;
  slug?: string;
  description?: string;
  images?: string[];
  tags?: string[];
  cuisines?: string[];
  itemType?: "food" | "drink" | "dessert" | "other";
  basePrice: Money;
  compareAtPrice?: Money;
  discountPercent?: number;
  variants?: any[];
  optionGroups?: any[];
  promotions?: any[];
  vegetarian?: boolean;
  vegan?: boolean;
  halal?: boolean;
  glutenFree?: boolean;
  allergens?: string[];
  spicyLevel?: number;
  isAvailable?: boolean;
  sortIndex?: number;
  createdAt?: string;
  updatedAt?: string;
};

type PreOrderItem = {
  menuItemId: string;
  menuItemName?: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
  note?: string;
  menuItem?: MenuItem | null;
};

type PreOrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

type PreOrder = {
  id: string;
  restaurantId: string;
  restaurant?: Restaurant | null;
  items: PreOrderItem[];
  totalAmount: Money;
  depositPercent?: number;
  requiredDepositAmount?: Money;
  guestCount: number;
  arrivalTime: string;
  contactName: string;
  contactPhone: string;
  note?: string;
  status: PreOrderStatus;
  paymentEmailSentAt?: string;
  paidAt?: string;
  paymentReference?: string;
  ownerNote?: string;
  createdAt: string;
};

// ===== HELPERS =====

const formatMoney = (m?: Money) => {
  if (!m) return "—";
  const amount =
    typeof m.amount === "number"
      ? m.amount
      : typeof m.value === "number"
      ? m.value
      : 0;
  const currency = m.currency || "VND";
  return `${amount.toLocaleString("vi-VN")} ${currency}`;
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusLabel: Record<PreOrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  AWAITING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CONFIRMED: "Đã xác nhận",
  REJECTED: "Đã từ chối",
  CANCELLED: "Đã hủy",
};

const statusClass: Record<PreOrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  AWAITING_PAYMENT: "bg-blue-50 text-blue-700 border-blue-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-gray-50 text-gray-600 border-gray-200",
};

const formatAddress = (addr?: Address) => {
  if (!addr) return "";
  if (addr.formatted) return addr.formatted;
  const parts = [addr.street, addr.ward, addr.district, addr.city, addr.country]
    .filter(Boolean)
    .join(", ");
  return parts;
};

const providerLabel: Record<EWalletProvider, string> = {
  MOMO: "Momo",
  ZALOPAY: "ZaloPay",
  VIETTELPAY: "ViettelPay",
  VNPAY: "VNPAY",
  OTHER: "Ví khác",
};

// ===== PAGE =====

export default function MyPreOrdersPage() {
  const { user } = useAuth() as any;
  const router = useRouter();

  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // user === null: chắc chắn chưa login => redirect
    if (user === null) {
      router.push("/auth");
      return;
    }

    // user undefined: context chưa load xong => chưa fetch
    if (!user) {
      return;
    }

    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const list = await ApiService.get<PreOrder[]>("/pre-orders/me");

        if (!cancelled) {
          setOrders(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Fetch pre-orders error:", err);
        setError("Không tải được danh sách đơn hàng. Vui lòng thử lại.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  const handleCopyCode = async (code: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode((current) => (current === code ? null : current));
      }, 2000);
    } catch (err) {
      console.error("Copy failed", err);
      // fallback nhẹ nếu cần
      if (typeof window !== "undefined") {
        window.prompt("Copy mã đặt chỗ:", code);
      }
    }
  };

  if (user === null) {
    // đang redirect sang /auth
    return null;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Đơn đặt bàn của bạn
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Xem lại những đơn hàng đã đặt trước, trạng thái thanh toán và chi tiết món.
        </p>
      </section>

      {loading && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Đang tải danh sách đơn hàng…</p>
        </div>
      )}

      {error && !loading && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
          Bạn chưa có đơn đặt bàn nào. Hãy khám phá{" "}
          <span
            onClick={() => router.push("/categories/restaurants")}
            className="cursor-pointer font-semibold text-rose-600 hover:underline"
          >
            quán ăn
          </span>{" "}
          và đặt trước để giữ chỗ nhé!
        </div>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((order) => {
          const itemsPreview = order.items.slice(0, 3);
          const remainCount = order.items.length - itemsPreview.length;
          const restaurant = order.restaurant;

          const bookingCode = order.id; // Mã thanh toán/đặt chỗ

          return (
            <article
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
            >
              {/* Restaurant header */}
              {restaurant && (
                <div className="flex gap-3 border-b border-gray-100 pb-3">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                    {restaurant.logoUrl ? (
                      <img
                        src={restaurant.logoUrl}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : restaurant.coverImageUrl ? (
                      <img
                        src={restaurant.coverImageUrl}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
                        {restaurant.name}
                      </h2>
                      {restaurant.priceRange && (
                        <span className="text-xs text-gray-500">
                          {restaurant.priceRange}
                        </span>
                      )}
                    </div>
                    {formatAddress(restaurant.address) && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatAddress(restaurant.address)}
                      </p>
                    )}
                    {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        Ẩm thực: {restaurant.cuisine.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Top row: status + time */}
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass[order.status]}`}
                  >
                    {statusLabel[order.status]}
                  </span>
                  <span className="text-xs text-gray-500">
                    Đặt lúc: {formatDateTime(order.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-gray-700">
                    👥 {order.guestCount} khách
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-0.5 text-gray-700">
                    ⏰ {formatDateTime(order.arrivalTime)}
                  </span>
                </div>
              </div>

              {/* Booking code block */}
              <div className="mt-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50/70 px-3 py-2 text-xs text-gray-700 sm:flex sm:items-center sm:justify-between sm:gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                    Mã thanh toán / đặt chỗ của bạn
                  </p>
                  <p className="mt-1 font-mono text-sm text-gray-900">
                    {bookingCode}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Khi chuyển khoản, vui lòng ghi mã này vào phần{" "}
                    <span className="font-semibold">nội dung thanh toán</span>{" "}
                    để nhà hàng dễ đối chiếu.
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(bookingCode)}
                    className="inline-flex items-center justify-center rounded-full border border-rose-300 bg-white px-3 py-1 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-50"
                  >
                    Copy mã
                  </button>
                  {copiedCode === bookingCode && (
                    <span className="text-[11px] font-medium text-emerald-600">
                      Đã copy!
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: contact + items */}
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {/* Contact */}
                <div className="space-y-1 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">Thông tin liên hệ</p>
                  <p>
                    <span className="text-gray-500">Tên: </span>
                    {order.contactName}
                  </p>
                  <p>
                    <span className="text-gray-500">SĐT: </span>
                    {order.contactPhone}
                  </p>
                  {order.note && (
                    <p className="text-xs text-gray-500">
                      Ghi chú: {order.note}
                    </p>
                  )}
                  {restaurant?.openingHours && restaurant.openingHours.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-semibold text-gray-700">Giờ mở cửa</p>
                      <p>
                        {restaurant.openingHours
                          .map((d) => d.day)
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2 text-sm text-gray-700 sm:col-span-2">
                  <p className="font-semibold text-gray-900">Món đã đặt</p>
                  <ul className="space-y-2">
                    {itemsPreview.map((it) => {
                      const firstImage =
                        it.menuItem?.images && it.menuItem.images[0];

                      return (
                        <li
                          key={it.menuItemId + (it.menuItemName ?? "")}
                          className="flex items-center gap-3 text-xs sm:text-sm"
                        >
                          {/* Ảnh món */}
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={it.menuItemName || "Món ăn"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 items-center justify-between gap-2">
                            <div className="flex-1">
                              <span className="font-medium">
                                {it.menuItemName || it.menuItem?.name || "Món ăn"}
                              </span>
                              {it.menuItem?.description && (
                                <p className="line-clamp-1 text-[11px] text-gray-500">
                                  {it.menuItem.description}
                                </p>
                              )}
                              {it.note && (
                                <p className="text-[11px] text-gray-500">
                                  Ghi chú: {it.note}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-0.5 text-xs text-gray-600">
                              <span>x{it.quantity}</span>
                              <span className="font-medium">
                                {formatMoney(it.lineTotal)}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {remainCount > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      + {remainCount} món khác…
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom: total & payment (thanh toán to, dễ quét QR) */}
              <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Tổng tiền + đặt cọc */}
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    Tổng tiền:{" "}
                    <span className="font-semibold text-gray-900">
                      {formatMoney(order.totalAmount)}
                    </span>
                  </p>
                  {order.requiredDepositAmount && (
                    <p className="text-gray-600">
                      Cần thanh toán trước:{" "}
                      <span className="font-semibold text-rose-700">
                        {formatMoney(order.requiredDepositAmount)}
                      </span>
                      {typeof order.depositPercent === "number" && (
                        <span className="text-xs text-gray-500">
                          {" "}
                          ({order.depositPercent}%)
                        </span>
                      )}
                    </p>
                  )}
                  {order.paymentReference && (
                    <p className="text-xs text-gray-500">
                      Mã thanh toán (cổng): {order.paymentReference}
                    </p>
                  )}
                  {order.paymentEmailSentAt && (
                    <p className="text-xs text-gray-400">
                      Đã gửi hướng dẫn thanh toán lúc{" "}
                      {formatDateTime(order.paymentEmailSentAt)}
                    </p>
                  )}
                </div>

                {/* Thông tin thanh toán – card lớn để quét QR */}
                {restaurant?.paymentConfig && (
                  <div className="w-full rounded-2xl border border-rose-100 bg-rose-50/70 p-3 text-xs text-gray-700 shadow-sm sm:max-w-sm sm:p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
                      Thanh toán đặt cọc / giữ chỗ
                    </p>

                    {/* Ưu tiên QR ngân hàng đầu tiên */}
                    {restaurant.paymentConfig.allowBankTransfer &&
                      (restaurant.paymentConfig.bankTransfers?.length ?? 0) >
                        0 && (
                        <div className="mb-3 rounded-xl bg-white p-3 text-center shadow-sm">
                          <p className="text-[11px] font-medium text-gray-700">
                            Quét QR chuyển khoản
                          </p>
                          {restaurant.paymentConfig.bankTransfers![0].qr
                            ?.imageUrl && (
                            <div className="mt-2 flex justify-center">
                              <img
                                src={
                                  restaurant.paymentConfig.bankTransfers![0].qr!
                                    .imageUrl!
                                }
                                alt="QR chuyển khoản"
                                className="h-40 w-40 rounded-xl border border-gray-200 bg-white object-contain sm:h-48 sm:w-48"
                              />
                            </div>
                          )}
                          <div className="mt-2 space-y-0.5 text-left text-[11px] text-gray-600">
                            {restaurant.paymentConfig.bankTransfers![0]
                              .bankName && (
                              <p>
                                Ngân hàng:{" "}
                                <span className="font-semibold">
                                  {
                                    restaurant.paymentConfig.bankTransfers![0]
                                      .bankName
                                  }
                                </span>
                              </p>
                            )}
                            {restaurant.paymentConfig.bankTransfers![0]
                              .accountNumber && (
                              <p>
                                Số tài khoản:{" "}
                                <span className="font-mono font-semibold">
                                  {
                                    restaurant.paymentConfig.bankTransfers![0]
                                      .accountNumber
                                  }
                                </span>
                              </p>
                            )}
                            {restaurant.paymentConfig.bankTransfers![0]
                              .accountName && (
                              <p>
                                Chủ TK:{" "}
                                <span className="font-semibold">
                                  {
                                    restaurant.paymentConfig.bankTransfers![0]
                                      .accountName
                                  }
                                </span>
                              </p>
                            )}
                            {restaurant.paymentConfig.bankTransfers![0]
                              .branch && (
                              <p>
                                Chi nhánh:{" "}
                                {
                                  restaurant.paymentConfig.bankTransfers![0]
                                    .branch
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Các phương thức thanh toán khác (liệt kê nhỏ) */}
                    <div className="space-y-1">
                      {restaurant.paymentConfig.allowCash && (
                        <p>• Có thể thanh toán tiền mặt tại quán</p>
                      )}

                      {restaurant.paymentConfig.allowBankTransfer &&
                        (restaurant.paymentConfig.bankTransfers?.length ?? 0) >
                          1 && (
                          <div>
                            <p className="font-medium text-gray-800">
                              • Các tài khoản ngân hàng khác:
                            </p>
                            <ul className="mt-1 space-y-0.5 pl-3">
                              {restaurant.paymentConfig.bankTransfers!
                                .slice(1)
                                .map((b, idx) => (
                                  <li key={idx}>
                                    {(b.bankName || b.bankCode) && (
                                      <span className="font-semibold">
                                        {b.bankName || b.bankCode}:{" "}
                                      </span>
                                    )}
                                    {b.accountNumber && (
                                      <span className="font-mono">
                                        {b.accountNumber}
                                      </span>
                                    )}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                      {restaurant.paymentConfig.allowEWallet &&
                        (restaurant.paymentConfig.eWallets?.length ?? 0) >
                          0 && (
                          <div>
                            <p className="font-medium text-gray-800">
                              • Thanh toán ví điện tử:
                            </p>
                            <ul className="mt-1 space-y-0.5 pl-3">
                              {restaurant.paymentConfig.eWallets!.map(
                                (w, idx) => (
                                  <li key={idx}>
                                    {(w.displayName || w.provider) && (
                                      <span className="font-semibold">
                                        {w.displayName ||
                                          (w.provider
                                            ? providerLabel[w.provider]
                                            : "")}
                                      </span>
                                    )}
                                    {w.phoneNumber && (
                                      <span className="ml-1">
                                        ({w.phoneNumber})
                                      </span>
                                    )}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                    </div>

                    {restaurant.paymentConfig.generalNote && (
                      <p className="mt-2 text-[11px] text-gray-500">
                        {restaurant.paymentConfig.generalNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
