"use client";

import { useEffect, useState } from "react";
import {
  PreOrderService,
  type PreOrder,
  type PreOrderStatus,
  type PaginatedPreOrders,
} from "@/services/pre-order.service";
import { NotifyService } from "@/services/notify.service";

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<PreOrderStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  REJECTED: "Từ chối",
  CANCELLED: "Khách hủy",
  WAITING_DEPOSIT: "Chờ đặt cọc",
  DEPOSIT_PAID: "Đã cọc",
  DONE: "Hoàn tất",
};

const STATUS_BADGE_CLASS: Record<PreOrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  WAITING_DEPOSIT: "bg-sky-50 text-sky-700 border-sky-200",
  DEPOSIT_PAID: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface OwnerPreOrdersTabProps {
  restaurantId: string;
}

export default function OwnerPreOrdersTab({ restaurantId }: OwnerPreOrdersTabProps) {
  const [data, setData] = useState<PaginatedPreOrders | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PreOrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PreOrder | null>(null);

  const items = data?.items ?? [];
  const maxPage = data?.pages ?? 1;

  const loadData = async (pageNum = 1, status: PreOrderStatus | "ALL" = statusFilter) => {
    setLoading(true);
    try {
      const res = await PreOrderService.listForRestaurant(restaurantId, {
        page: pageNum,
        limit: PAGE_SIZE,
        status: status === "ALL" ? undefined : status,
      });
      setData(res);
      setPage(res.page);
    } catch (err: any) {
      console.error(err);
      NotifyService.error(err?.message || "Không tải được danh sách đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, statusFilter]);

  const handleUpdateStatus = async (order: PreOrder, status: PreOrderStatus) => {
    try {
      const ownerNote =
        status === "REJECTED"
          ? window.prompt("Lý do từ chối (hiện cho khách xem):", order.ownerNote || "")
          : order.ownerNote || undefined;

      const updated = await PreOrderService.updateStatus(order._id, {
        status,
        ownerNote: ownerNote || undefined,
      });

      NotifyService.success("Cập nhật trạng thái thành công");
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((o) => (o._id === order._id ? updated : o)),
            }
          : prev,
      );
      setSelected((prev) => (prev && prev._id === order._id ? updated : prev));
    } catch (err: any) {
      console.error(err);
      NotifyService.error(err?.message || "Không cập nhật được trạng thái");
    }
  };

  const handleRequestDeposit = async (order: PreOrder) => {
    try {
      const percentStr = window.prompt(
        "Phần trăm đặt cọc (0-100):",
        String(order.depositPercent ?? 30),
      );
      if (!percentStr) return;
      const depositPercent = Number(percentStr);
      if (Number.isNaN(depositPercent) || depositPercent <= 0 || depositPercent > 100) {
        NotifyService.warn("Phần trăm không hợp lệ");
        return;
      }

      const emailNote = window.prompt(
        "Ghi chú trong email (có thể để trống):",
        "Vui lòng thanh toán trong vòng 2 giờ để giữ chỗ.",
      );

      const updated = await PreOrderService.requestDeposit(order._id, {
        depositPercent,
        sendEmail: true,
        emailNote: emailNote || undefined,
      });

      NotifyService.success("Đã gửi yêu cầu đặt cọc cho khách");
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((o) => (o._id === order._id ? updated : o)),
            }
          : prev,
      );
      setSelected((prev) => (prev && prev._id === order._id ? updated : prev));
    } catch (err: any) {
      console.error(err);
      NotifyService.error(err?.message || "Không gửi được yêu cầu đặt cọc");
    }
  };

  const handleMarkPaid = async (order: PreOrder) => {
    try {
      const ref = window.prompt(
        "Mã tham chiếu thanh toán (VD: VNPAY_20251201_ABC123456):",
        order.paymentReference || "",
      );
      if (!ref) return;

      const updated = await PreOrderService.markPaid(order._id, {
        paymentReference: ref,
      });

      NotifyService.success("Đã đánh dấu khách đã thanh toán cọc");
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((o) => (o._id === order._id ? updated : o)),
            }
          : prev,
      );
      setSelected((prev) => (prev && prev._id === order._id ? updated : prev));
    } catch (err: any) {
      console.error(err);
      NotifyService.error(err?.message || "Không đánh dấu thanh toán được");
    }
  };

  const handleConfirmFinal = async (order: PreOrder) => {
    try {
      const updated = await PreOrderService.confirm(order._id);
      NotifyService.success("Đã xác nhận hoàn tất đơn đặt bàn");
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((o) => (o._id === order._id ? updated : o)),
            }
          : prev,
      );
      setSelected((prev) => (prev && prev._id === order._id ? updated : prev));
    } catch (err: any) {
      console.error(err);
      NotifyService.error(err?.message || "Không thể xác nhận hoàn tất");
    }
  };

  const renderActions = (order: PreOrder) => {
    return (
      <div className="flex flex-wrap gap-2 text-xs">
        {order.status === "PENDING" && (
          <>
            <button
              type="button"
              onClick={() => handleUpdateStatus(order, "CONFIRMED")}
              className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 hover:bg-emerald-100"
            >
              ✅ Xác nhận
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus(order, "REJECTED")}
              className="rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-700 hover:bg-rose-100"
            >
              ❌ Từ chối
            </button>
          </>
        )}

        {order.status === "CONFIRMED" && (
          <button
            type="button"
            onClick={() => handleRequestDeposit(order)}
            className="rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700 hover:bg-sky-100"
          >
            💳 Yêu cầu đặt cọc
          </button>
        )}

        {order.status === "WAITING_DEPOSIT" && (
          <button
            type="button"
            onClick={() => handleMarkPaid(order)}
            className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700 hover:bg-indigo-100"
          >
            💰 Đánh dấu đã cọc
          </button>
        )}

        {(order.status === "DEPOSIT_PAID" || order.status === "CONFIRMED") && (
          <button
            type="button"
            onClick={() => handleConfirmFinal(order)}
            className="rounded-full bg-emerald-600 px-2.5 py-1 font-medium text-white hover:bg-emerald-700"
          >
            ✅ Hoàn tất
          </button>
        )}
      </div>
    );
  };

  const shortInfo = (order: PreOrder) => {
    const timeStr = order.arrivalTime
      ? new Date(order.arrivalTime).toLocaleString("vi-VN")
      : "-";
    return `${order.guestCount ?? 0} khách · ${timeStr}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 p-[1px]">
        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Đơn đặt bàn (Pre-order) của quán
            </h1>
            <p className="mt-1 text-xs text-gray-600">
              Xem và xử lý các yêu cầu đặt bàn: xác nhận, yêu cầu đặt cọc, đánh dấu đã thanh toán...
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              Mỗi hành động sẽ được lưu lại trong lịch sử đơn đặt bàn.
            </span>
          </div>
        </div>
      </div>

      {/* Bộ lọc trạng thái */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-gray-500">Lọc theo trạng thái:</span>
        <button
          type="button"
          className={`rounded-full px-3 py-1 ${
            statusFilter === "ALL"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setStatusFilter("ALL")}
        >
          Tất cả
        </button>
        {(
          [
            "PENDING",
            "CONFIRMED",
            "WAITING_DEPOSIT",
            "DEPOSIT_PAID",
            "DONE",
            "REJECTED",
            "CANCELLED",
          ] as PreOrderStatus[]
        ).map((st) => (
          <button
            key={st}
            type="button"
            className={`rounded-full px-3 py-1 ${
              statusFilter === st
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setStatusFilter(st)}
          >
            {STATUS_LABEL[st]}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid gap-4 lg:grid-cols-[2.1fr,1.9fr]">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
            <span>
              Tổng:{" "}
              <span className="font-semibold text-gray-800">
                {data?.total ?? 0} đơn
              </span>
            </span>
            <button
              type="button"
              onClick={() => loadData(page, statusFilter)}
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
            >
              🔄 Làm mới
            </button>
          </div>

          {loading && (
            <div className="py-8 text-center text-sm text-gray-500">
              Đang tải danh sách đơn đặt bàn...
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              Chưa có đơn đặt bàn nào.
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="space-y-2">
              {items.map((order) => (
                <button
                  key={order._id}
                  type="button"
                  onClick={() => setSelected(order)}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs transition ${
                    selected?._id === order._id
                      ? "border-rose-300 bg-rose-50"
                      : "border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/40"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        #{order.code || order._id.slice(-6)}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 ${STATUS_BADGE_CLASS[order.status]}`}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600">
                      {order.contactName || order.customerName || "Khách"} ·{" "}
                      {order.contactPhone || order.customerPhone || "—"}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {shortInfo(order)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-2 text-right">
                    <span className="text-[11px] text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("vi-VN")
                        : ""}
                    </span>
                    {renderActions(order)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {maxPage > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => loadData(page - 1, statusFilter)}
                className="rounded-full border border-gray-200 px-3 py-1 disabled:opacity-40"
              >
                ← Trang trước
              </button>
              <span className="text-gray-600">
                Trang {page}/{maxPage}
              </span>
              <button
                type="button"
                disabled={page >= maxPage}
                onClick={() => loadData(page + 1, statusFilter)}
                className="rounded-full border border-gray-200 px-3 py-1 disabled:opacity-40"
              >
                Trang sau →
              </button>
            </div>
          )}
        </div>

        {/* Detail pane */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {!selected ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Chọn một đơn ở bên trái để xem chi tiết.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Đơn đặt bàn #{selected.code || selected._id.slice(-8)}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selected.contactName || selected.customerName || "Khách"}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {selected.contactPhone || selected.customerPhone || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${STATUS_BADGE_CLASS[selected.status]}`}
                  >
                    {STATUS_LABEL[selected.status]}
                  </span>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Tạo lúc:{" "}
                    {selected.createdAt
                      ? new Date(selected.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div>
                <p className="mb-1 text-xs font-semibold text-gray-800">
                  Thông tin khách & thời gian
                </p>
                <p className="text-[11px] text-gray-600">
                  Số khách:{" "}
                  <span className="font-semibold">
                    {selected.guestCount ?? "—"}
                  </span>
                </p>
                <p className="text-[11px] text-gray-600">
                  Giờ đến:{" "}
                  {selected.arrivalTime
                    ? new Date(selected.arrivalTime).toLocaleString("vi-VN")
                    : "—"}
                </p>
                {selected.note && (
                  <p className="mt-1 text-[11px] text-gray-600">
                    Ghi chú khách: {selected.note}
                  </p>
                )}
                {selected.ownerNote && (
                  <p className="mt-1 text-[11px] text-gray-600">
                    Ghi chú quán:{" "}
                    <span className="italic">{selected.ownerNote}</span>
                  </p>
                )}
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div>
                <p className="mb-1 text-xs font-semibold text-gray-800">
                  Món đã đặt
                </p>
                {selected.items?.length ? (
                  <ul className="space-y-1">
                    {selected.items.map((it, idx) => (
                      <li
                        key={it._id || idx}
                        className="flex items-center justify-between text-[11px]"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {it.menuItemName || it.menuItemId}
                          </span>
                          {it.note && (
                            <span className="text-[10px] text-gray-500">
                              Ghi chú: {it.note}
                            </span>
                          )}
                        </div>
                        <div className="text-right text-[11px] text-gray-700">
                          x{it.quantity}
                          {it.totalPrice != null && (
                            <span className="ml-1 text-gray-500">
                              · {it.totalPrice.toLocaleString("vi-VN")}₫
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-gray-500">
                    Không có món nào trong đơn.
                  </p>
                )}
              </div>

              {/* Deposit info */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

              <div>
                <p className="mb-1 text-xs font-semibold text-gray-800">
                  Thông tin đặt cọc
                </p>
                <p className="text-[11px] text-gray-600">
                  Yêu cầu cọc:{" "}
                  {selected.depositPercent != null
                    ? `${selected.depositPercent}%`
                    : "Chưa yêu cầu"}
                  {selected.depositAmount != null && (
                    <>
                      {" "}
                      (
                      {selected.depositAmount.toLocaleString("vi-VN")}{" "}
                      {selected.depositCurrency || "₫"})
                    </>
                  )}
                </p>
                <p className="text-[11px] text-gray-600">
                  Trạng thái cọc:{" "}
                  {selected.isDepositPaid
                    ? "Đã thanh toán"
                    : selected.depositPercent
                    ? "Chờ khách thanh toán"
                    : "Chưa yêu cầu"}
                </p>
                {selected.paymentReference && (
                  <p className="mt-1 text-[11px] text-gray-600">
                    Mã thanh toán:{" "}
                    <span className="font-mono">
                      {selected.paymentReference}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
