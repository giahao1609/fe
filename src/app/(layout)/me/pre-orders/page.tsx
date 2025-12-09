// app/me/pre-orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Money = {
  currency?: string;
  amount?: number;
  value?: number; // fallback nếu backend dùng field này
};

type PreOrderItem = {
  menuItemId: string;
  menuItemName?: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
  note?: string;
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

export default function MyPreOrdersPage() {
  const { user, accessToken } = useAuth() as any;
  const router = useRouter();

  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Nếu chưa đăng nhập thì chuyển về /auth
    if (user === null) {
      router.push("/auth");
      return;
    }

    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.food-map.online";
        const res = await fetch(`${baseUrl}/pre-orders/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {}),
          },
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();
        // Nếu backend trả thẳng array thì data chính là mảng
        const list: PreOrder[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setOrders(list);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Fetch pre-orders error:", err);
        setError("Không tải được danh sách đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, [user, accessToken, router]);

  if (user === null) {
    // đang redirect
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

          return (
            <article
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
            >
              {/* Top row: status + time */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                </div>

                {/* Items */}
                <div className="space-y-1 text-sm text-gray-700 sm:col-span-2">
                  <p className="font-semibold text-gray-900">Món đã đặt</p>
                  <ul className="space-y-1">
                    {itemsPreview.map((it) => (
                      <li
                        key={it.menuItemId + it.menuItemName}
                        className="flex items-center justify-between text-xs sm:text-sm"
                      >
                        <div className="flex-1">
                          <span className="font-medium">
                            {it.menuItemName || "Món ăn"}
                          </span>
                          {it.note && (
                            <span className="ml-1 text-[11px] text-gray-500">
                              ({it.note})
                            </span>
                          )}
                        </div>
                        <div className="ml-2 flex items-center gap-3 text-xs text-gray-600">
                          <span>x{it.quantity}</span>
                          <span className="font-medium">
                            {formatMoney(it.lineTotal)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {remainCount > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      + {remainCount} món khác…
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom: total & deposit */}
              <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-gray-600">
                    Tổng tiền:{" "}
                    <span className="font-semibold text-gray-900">
                      {formatMoney(order.totalAmount)}
                    </span>
                  </p>
                  {order.requiredDepositAmount && (
                    <p className="text-gray-600">
                      Yêu cầu thanh toán:{" "}
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
                </div>

                {order.paymentReference && (
                  <p className="text-xs text-gray-500">
                    Mã thanh toán: {order.paymentReference}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
