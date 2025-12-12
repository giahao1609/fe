"use client";

import { useEffect, useMemo, useState } from "react";

import {
  PreOrder,
  PreOrderService,
  PreOrderStatus,
} from "@/services/pre-order.service";
import { RestaurantService } from "@/services/restaurant.service";
import { NotifyService } from "@/services/notify.service";

// ================== TYPES ==================
type StatusFilter = "ALL" | PreOrderStatus;

const STATUS_LABEL: Record<PreOrderStatus, string> = {
  PENDING: "Chờ xử lý",
  AWAITING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CONFIRMED: "Đã xác nhận",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã huỷ",
};

const STATUS_COLOR: Record<PreOrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  AWAITING_PAYMENT: "bg-orange-50 text-orange-700 border-orange-100",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-100",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
  CANCELLED: "bg-gray-50 text-gray-500 border-gray-200",
};

type OwnerRestaurant = {
  _id: string;
  ownerId: string;
  categoryId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverImageUrl?: string;
  categoryName?: string;
  categorySlug?: string;
  categoryIcon?: string;
  priceRange?: string;
  rating?: number | null;
  isActive?: boolean;
  address?: {
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
    country?: string;
  };
};

function formatMoney(
  amount?: { currency?: string; amount?: number } | null
): string {
  if (!amount) return "-";
  const currency = amount.currency || "VND";
  const value = amount.amount ?? 0;

  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString("vi-VN")} ${currency}`;
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRestaurantAddress(r?: OwnerRestaurant | null) {
  if (!r?.address) return "";
  const { street, ward, district, city } = r.address;
  return [street, ward, district, city].filter(Boolean).join(", ");
}

// ================== COMPONENT ==================
export function OwnerPreOrder() {
  // ===== RESTAURANTS =====
  const [restaurants, setRestaurants] = useState<OwnerRestaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurantError, setRestaurantError] = useState<string | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    null
  );

  // ===== ORDERS =====
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PreOrder | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // form yêu cầu cọc
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositPercent, setDepositPercent] = useState<number>(30);
  const [sendEmail, setSendEmail] = useState(true);
  const [emailNote, setEmailNote] = useState(
    "Vui lòng thanh toán trong vòng 2 giờ để giữ chỗ."
  );
  const [overrideEmail, setOverrideEmail] = useState("");

  const [actionLoading, setActionLoading] = useState<null | {
    id: string;
    type: string;
  }>(null);

  // ===== SELECTED RESTAURANT =====
  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r._id === selectedRestaurantId) || null,
    [restaurants, selectedRestaurantId]
  );

  // ================== LOAD RESTAURANTS (BY OWNER) ==================
  useEffect(() => {
    let cancelled = false;

    const loadRestaurants = async () => {
      setLoadingRestaurants(true);
      setRestaurantError(null);

      try {
        const res = await RestaurantService.getByOwner();

        const payload =
          (res as any)?.data !== undefined ? (res as any).data : res;

        const raw =
          Array.isArray(payload)
            ? payload
            : (payload as any)?.items ??
              (payload as any)?.results ??
              (payload as any)?.restaurants ??
              payload;

        console.log("[OwnerPreOrder] getByOwner raw =", raw);

        const arr: any[] = Array.isArray(raw) ? raw : [];
        const mapped: OwnerRestaurant[] = arr.map((r: any) => ({
          _id: r._id,
          ownerId: r.ownerId,
          categoryId: r.categoryId,
          name: r.name,
          slug: r.slug,
          logoUrl: r.logoUrl,
          coverImageUrl: r.coverImageUrl,
          categoryName: r.categoryName ?? r.category?.name,
          categorySlug: r.categorySlug ?? r.category?.slug,
          categoryIcon: r.categoryIcon ?? r.category?.extra?.icon,
          priceRange: r.priceRange,
          rating: r.rating,
          isActive: r.isActive,
          address: r.address
            ? {
                street: r.address.street,
                ward: r.address.ward,
                district: r.address.district,
                city: r.address.city,
                country: r.address.country,
              }
            : undefined,
        }));

        const activeRestaurants = mapped.filter((r) => r.isActive !== false);

        if (!cancelled) {
          setRestaurants(activeRestaurants);

          if (activeRestaurants.length > 0) {
            setSelectedRestaurantId((prev) => prev || activeRestaurants[0]._id);
          } else {
            setSelectedRestaurantId(null);
          }
        }
      } catch (e: any) {
        console.error("[OwnerPreOrder] load restaurants error:", e);
        if (!cancelled) {
          setRestaurantError(e?.message || "Không thể tải danh sách nhà hàng.");
        }
      } finally {
        if (!cancelled) setLoadingRestaurants(false);
      }
    };

    loadRestaurants();

    return () => {
      cancelled = true;
    };
  }, []);

  // ================== LOAD ORDER LIST (BY RESTAURANT) ==================
  useEffect(() => {
    if (!selectedRestaurantId) {
      setOrders([]);
      setSelectedOrderId(null);
      setSelectedOrder(null);
      return;
    }

    let cancelled = false;

    const loadList = async () => {
      setLoadingList(true);
      setListError(null);
      try {
        const data = await PreOrderService.listForRestaurant(selectedRestaurantId);
        if (!cancelled) {
          setOrders(data || []);
          console.log("data",data)
          if (!data || data.length === 0) {
            setSelectedOrderId(null);
            setSelectedOrder(null);
            return;
          }

          // Nếu chưa chọn order nào => auto chọn cái đầu
          if (!selectedOrderId) {
            setSelectedOrderId(data[0]._id);
            setSelectedOrder(data[0]); // <- quan trọng
          } else {
            // Nếu đang chọn 1 order, tìm lại trong list mới
            const stillExist = data.find((o) => o._id === selectedOrderId);
            if (stillExist) {
              setSelectedOrder(stillExist); // sync lại selectedOrder từ list
            } else {
              setSelectedOrderId(data[0]._id);
              
              setSelectedOrder(data[0]);
            }
          }
        }
      } catch (e: any) {
        console.error("[OwnerPreOrder] load list error:", e);
        if (!cancelled) {
          setListError(e?.message || "Không thể tải danh sách đặt bàn.");
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };

    loadList();

    return () => {
      cancelled = true;
    };
  }, [selectedRestaurantId]);

  // ================== LOAD ORDER DETAIL (OPTIONAL REFRESH) ==================
  // useEffect(() => {
  //   if (!selectedOrderId) {
  //     setSelectedOrder(null);
  //     return;
  //   }

  //   let cancelled = false;

  //   const loadDetail = async () => {
  //     setLoadingDetail(true);
  //     try {
  //       const data = await PreOrderService.getById(selectedOrderId) as any;
  //       console.log("1data", data)
  //       if (!cancelled && data) {
  //         // refresh lại detail nếu API trả thêm field (items, notes, deposit,...)
  //         setSelectedOrder(data[0]);
  //       }
  //     } catch (e: any) {
  //       console.error("[OwnerPreOrder] load detail error:", e);
  //       if (!cancelled) {
  //         // Không clear selectedOrder, vẫn dùng data từ list
  //         NotifyService.error(e?.message || "Không thể tải chi tiết đơn.");
  //       }
  //     } finally {
  //       if (!cancelled) setLoadingDetail(false);
  //     }
  //   };

  //   // tùy ông: có thể bỏ luôn call này nếu list đã đủ detail
  //   loadDetail();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [selectedOrderId]);

  // ================== FILTERED ORDERS ==================
  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  // ================== REFRESH AFTER ACTION ==================
  const refreshAfterAction = async (keepSelected = true) => {
    if (!selectedRestaurantId) return;
    try {
      const data = await PreOrderService.listForRestaurant(selectedRestaurantId);
      setOrders(data || []);

      if (!data || data.length === 0) {
        setSelectedOrderId(null);
        setSelectedOrder(null);
        return;
      }

      if (keepSelected && selectedOrderId) {
        const found = data.find((o) => o._id === selectedOrderId);
        if (found) {
          setSelectedOrder(found);
        } else {
          setSelectedOrderId(data[0]._id);
          setSelectedOrder(data[0]);
        }
      } else {
        setSelectedOrderId(data[0]._id);
        setSelectedOrder(data[0]);
      }
    } catch (e) {
      console.error("[OwnerPreOrder] refresh error:", e);
    }
  };

  // ================== ACTIONS ==================
  const handleOpenDepositForm = () => {
    if (!selectedOrder) return;
    setDepositPercent(selectedOrder.depositPercent ?? 30);
    setSendEmail(true);
    setEmailNote("Vui lòng thanh toán trong vòng 2 giờ để giữ chỗ.");
    setOverrideEmail("");
    setShowDepositForm(true);
  };

  const handleSubmitDeposit = async () => {
    if (!selectedOrder) return;
    if (depositPercent < 0 || depositPercent > 100) {
      NotifyService.warn("Tỉ lệ cọc phải trong khoảng 0–100%.");
      return;
    }

    setActionLoading({ id: selectedOrder._id, type: "requestDeposit" });

    try {
      await PreOrderService.requestDeposit(selectedOrder._id, {
        depositPercent,
        sendEmail,
        emailNote: emailNote.trim() || undefined,
        overrideEmail: overrideEmail.trim() || undefined,
      });

      NotifyService.success(
        depositPercent > 0
          ? "Đã gửi yêu cầu cọc cho khách."
          : "Đã xác nhận đơn không cần cọc."
      );
      setShowDepositForm(false);
      await refreshAfterAction();
    } catch (e: any) {
      console.error("[OwnerPreOrder] requestDeposit error:", e);
      NotifyService.error(e?.message || "Không gửi được yêu cầu cọc.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedOrder) return;

    const ok = window.confirm("Xác nhận đánh dấu đơn này đã thanh toán?");
    if (!ok) return;

    setActionLoading({ id: selectedOrder._id, type: "markPaid" });

    try {
      await PreOrderService.markPaid(selectedOrder._id, {});
      NotifyService.success("Đã cập nhật trạng thái: ĐÃ THANH TOÁN.");
      await refreshAfterAction();
    } catch (e: any) {
      console.error("[OwnerPreOrder] markPaid error:", e);
      NotifyService.error(
        e?.message || "Không cập nhật được trạng thái thanh toán."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;

    const ok = window.confirm("Xác nhận đơn đặt chỗ này?");
    if (!ok) return;

    setActionLoading({ id: selectedOrder._id, type: "confirm" });

    try {
      await PreOrderService.confirm(selectedOrder._id);
      NotifyService.success("Đã xác nhận đơn đặt chỗ.");
      await refreshAfterAction();
    } catch (e: any) {
      console.error("[OwnerPreOrder] confirm error:", e);
      NotifyService.error(e?.message || "Không xác nhận được đơn.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (status: "CANCELLED" | "REJECTED") => {
    if (!selectedOrder) return;

    const label = status === "CANCELLED" ? "huỷ" : "từ chối";
    const ok = window.confirm(`Xác nhận ${label} đơn này?`);
    if (!ok) return;

    const ownerNote = window.prompt(
      "Ghi chú thêm cho khách (có thể bỏ qua):",
      ""
    );

    setActionLoading({ id: selectedOrder._id, type: status });

    try {
      await PreOrderService.updateStatus(selectedOrder._id, {
        status,
        ownerNote: ownerNote?.trim() || undefined,
      });
      NotifyService.success(`Đã ${label} đơn và gửi email cho khách (nếu có).`);
      await refreshAfterAction(false);
    } catch (e: any) {
      console.error("[OwnerPreOrder] updateStatus error:", e);
      NotifyService.error(e?.message || "Không cập nhật được trạng thái.");
    } finally {
      setActionLoading(null);
    }
  };

  const isDoingAction =
    !!actionLoading && !!selectedOrder && actionLoading.id === selectedOrder._id;

  // ================== RENDER ==================
  if (loadingRestaurants) {
    return (
      <div className="mt-6 space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (restaurantError) {
    return (
      <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {restaurantError}
      </div>
    );
  }

  if (!restaurants.length) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-600">
        Bạn chưa có nhà hàng nào. Hãy tạo nhà hàng trước để quản lý đơn đặt bàn.
      </div>
    );
  }

  const restaurantAddress = formatRestaurantAddress(selectedRestaurant);

  return (
    <div className="mt-6 space-y-4">
      {/* Header + Restaurant selector */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 p-3 sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Đơn đặt bàn trước
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Chọn nhà hàng bên dưới để xem và duyệt các đơn đặt bàn.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <p className="text-[11px] text-gray-500">Nhà hàng của bạn:</p>
            <div className="flex flex-wrap justify-end gap-2">
              {restaurants.map((r) => {
                const isActive = r._id === selectedRestaurantId;
                return (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => {
                      setSelectedRestaurantId(r._id);
                      setSelectedOrderId(null);
                      setSelectedOrder(null);
                    }}
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? "border-rose-400 bg-rose-50 text-rose-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-rose-200 hover:bg-rose-50"
                    }`}
                  >
                    <span className="mr-1">
                      {r.categoryIcon || "🍽"}
                    </span>
                    <span className="max-w-[140px] truncate sm:max-w-[180px]">
                      {r.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedRestaurant && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1">
              <span className="text-rose-500">🏷</span>
              <span>{selectedRestaurant.name}</span>
            </span>
            {restaurantAddress && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1">
                <span className="text-rose-500">📍</span>
                <span className="line-clamp-1 max-w-[260px] sm:max-w-[340px]">
                  {restaurantAddress}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Layout 2 columns: list + detail */}
      <div className="grid gap-4 lg:grid-cols-[1.3fr,1.8fr]">
        {/* LEFT: ORDER LIST */}
        <section className="rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:p-4">
          {/* Filter status */}
          <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
            {(
              [
                { key: "ALL", label: "Tất cả" },
                { key: "PENDING", label: "Chờ xử lý" },
                { key: "AWAITING_PAYMENT", label: "Chờ thanh toán" },
                { key: "PAID", label: "Đã thanh toán" },
                { key: "CONFIRMED", label: "Đã xác nhận" },
                { key: "REJECTED", label: "Từ chối / Huỷ" },
              ] as { key: StatusFilter; label: string }[]
            ).map((f) => {
              const isActive = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`rounded-full border px-2.5 py-1 transition ${
                    isActive
                      ? "border-rose-400 bg-rose-50 text-rose-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mb-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>
              Tổng đơn của{" "}
              <span className="font-semibold text-gray-800">
                {selectedRestaurant?.name || "nhà hàng"}
              </span>
              :{" "}
              <span className="font-semibold text-gray-800">
                {orders.length}
              </span>
            </span>
          </div>

          {/* List */}
          {loadingList && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          )}

          {!loadingList && listError && (
            <p className="rounded-xl bg-rose-50 px-3 py-3 text-xs text-rose-700">
              {listError}
            </p>
          )}

          {!loadingList && !listError && filteredOrders.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-500">
              Chưa có đơn đặt bàn nào cho nhà hàng này.
            </p>
          )}

          {!loadingList && !listError && filteredOrders.length > 0 && (
            <div className="space-y-2">
              {filteredOrders.map((o) => {
                const isActive = selectedOrderId === o._id;
                const total = formatMoney(o.totalAmount);
                const time = formatDateTime(o.arrivalTime);

                return (
                  <button
                    key={o._id}
                    type="button"
                    onClick={() => {
                      setSelectedOrderId(o._id);
                      setSelectedOrder(o); // <- CLICK LÀ CÓ DETAIL NGAY
                    }}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs transition sm:text-sm ${
                      isActive
                        ? "border-rose-400 bg-rose-50 shadow-sm"
                        : "border-gray-100 bg-white hover:border-rose-200 hover:bg-rose-50/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {o.contactName} ·{" "}
                          <span className="text-gray-600">
                            {o.contactPhone}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          {time} · {o.guestCount} khách
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-600">
                          Tổng dự kiến:{" "}
                          <span className="font-semibold text-gray-900">
                            {total}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          STATUS_COLOR[o.status]
                        }`}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* RIGHT: ORDER DETAIL */}
        <section className="rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-sm sm:p-5">
          {!selectedOrder && (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Chọn một đơn bên trái để xem chi tiết.
            </div>
          )}

          {selectedOrder && (
            <div className="space-y-4">
              {/* Top info + actions */}
              <div className="flex flex-col gap-3 border-b border-gray-100 pb-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      Đơn #{selectedOrder._id?.slice(-6)}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        STATUS_COLOR[selectedOrder.status]
                      }`}
                    >
                      {STATUS_LABEL[selectedOrder.status]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Khách:{" "}
                    <span className="font-medium text-gray-900">
                      {selectedOrder.contactName}
                    </span>{" "}
                    · <span>{selectedOrder.contactPhone}</span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Thời gian đến dự kiến:{" "}
                    <span className="font-medium">
                      {formatDateTime(selectedOrder.arrivalTime)}
                    </span>{" "}
                    · {selectedOrder.guestCount} khách
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Tạo lúc: {formatDateTime(selectedOrder.createdAt)}
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap justify-end gap-2 text-xs">
                  {selectedOrder.status === "PENDING" && (
                    <>
                      <button
                        type="button"
                        onClick={handleOpenDepositForm}
                        disabled={isDoingAction}
                        className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        Yêu cầu cọc / gửi email
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmOrder}
                        disabled={isDoingAction}
                        className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                      >
                        Xác nhận không cần cọc
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus("REJECTED")}
                        disabled={isDoingAction}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed"
                      >
                        Từ chối đơn
                      </button>
                    </>
                  )}

                  {selectedOrder.status === "AWAITING_PAYMENT" && (
                    <>
                      <button
                        type="button"
                        onClick={handleMarkPaid}
                        disabled={isDoingAction}
                        className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        Đánh dấu đã thanh toán
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus("CANCELLED")}
                        disabled={isDoingAction}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed"
                      >
                        Huỷ đơn
                      </button>
                    </>
                  )}

                  {selectedOrder.status === "PAID" && (
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      disabled={isDoingAction}
                      className="inline-flex items-center rounded-full bg-sky-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      Xác nhận đặt chỗ
                    </button>
                  )}

                  {selectedOrder.status === "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("CANCELLED")}
                      disabled={isDoingAction}
                      className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:border-rose-200 hover:bg-rose-50 disabled:cursor-not-allowed"
                    >
                      Huỷ đơn
                    </button>
                  )}
                </div>
              </div>

              {/* Deposit form */}
              {showDepositForm && (
                <div className="space-y-3 rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-rose-800">
                      Thiết lập yêu cầu cọc / email thanh toán
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDepositForm(false)}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Đóng
                    </button>
                  </div>

                  <p className="text-[11px] text-rose-700">
                    Nếu đặt cọc = 0% → đơn sẽ được xác nhận ngay, khách thanh
                    toán toàn bộ tại quán.
                  </p>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        Tỉ lệ cọc (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={depositPercent}
                        onChange={(e) =>
                          setDepositPercent(Number(e.target.value || 0))
                        }
                        className="w-full rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        Gửi email cho khách
                      </label>
                      <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-2 py-1.5">
                        <input
                          id="depositSendEmail"
                          type="checkbox"
                          checked={sendEmail}
                          onChange={(e) => setSendEmail(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
                        />
                        <label
                          htmlFor="depositSendEmail"
                          className="text-[11px] text-gray-700"
                        >
                          Gửi email thông báo + hướng dẫn thanh toán
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-700">
                        Email khác (nếu muốn)
                      </label>
                      <input
                        type="email"
                        value={overrideEmail}
                        onChange={(e) => setOverrideEmail(e.target.value)}
                        placeholder="Mặc định dùng email user"
                        className="w-full rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-700">
                      Nội dung ghi chú thêm trong email
                    </label>
                    <textarea
                      rows={2}
                      value={emailNote}
                      onChange={(e) => setEmailNote(e.target.value)}
                      className="w-full rounded-lg border border-rose-200 bg-white px-2 py-1.5 text-[11px] outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDepositForm(false)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitDeposit}
                      disabled={isDoingAction}
                      className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {isDoingAction ? "Đang gửi..." : "Lưu & gửi cho khách"}
                    </button>
                  </div>
                </div>
              )}

              {/* Summary tiền & trạng thái thanh toán */}
              <div className="grid gap-3 rounded-xl bg-gray-50 p-3 text-xs sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-gray-600">
                    Tổng tiền dự kiến
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatMoney(selectedOrder.totalAmount)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-gray-600">
                    Tỉ lệ cọc
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedOrder.depositPercent != null
                      ? `${selectedOrder.depositPercent}%`
                      : "Chưa thiết lập"}
                  </p>
                  {selectedOrder.requiredDepositAmount && (
                    <p className="text-[11px] text-gray-500">
                      Cần thanh toán trước:{" "}
                      {formatMoney(selectedOrder.requiredDepositAmount)}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-gray-600">
                    Email thanh toán / thanh toán
                  </p>
                  <p className="text-[11px] text-gray-700">
                    Gửi email:{" "}
                    {selectedOrder.paymentEmailSentAt
                      ? formatDateTime(selectedOrder.paymentEmailSentAt)
                      : "Chưa gửi"}
                    <br />
                    Thanh toán lúc:{" "}
                    {selectedOrder.paidAt
                      ? formatDateTime(selectedOrder.paidAt)
                      : "Chưa thanh toán"}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="grid gap-3 text-xs sm:grid-cols-2">
                {selectedOrder.note && (
                  <div className="space-y-1 rounded-xl border border-gray-100 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium text-gray-600">
                      Ghi chú từ khách
                    </p>
                    <p className="whitespace-pre-line text-gray-800">
                      {selectedOrder.note}
                    </p>
                  </div>
                )}
                {selectedOrder.ownerNote && (
                  <div className="space-y-1 rounded-xl border border-gray-100 bg-white px-3 py-2">
                    <p className="text-[11px] font-medium text-gray-600">
                      Ghi chú nội bộ / gửi cho khách
                    </p>
                    <p className="whitespace-pre-line text-gray-800">
                      {selectedOrder.ownerNote}
                    </p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2 rounded-xl border border-gray-100 bg-white px-3 py-3 text-xs">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Chi tiết món
                </p>
                {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                  <p className="text-[11px] text-gray-500">
                    Không có dữ liệu món ăn.
                  </p>
                )}

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-2 py-1 text-left font-medium text-gray-600">
                            Món
                          </th>
                          <th className="px-2 py-1 text-center font-medium text-gray-600">
                            SL
                          </th>
                          <th className="px-2 py-1 text-right font-medium text-gray-600">
                            Đơn giá
                          </th>
                          <th className="px-2 py-1 text-right font-medium text-gray-600">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((it) => (
                          <tr
                            key={(it as any).menuItemId || it.menuItemName}
                            className="border-b border-gray-50"
                          >
                            <td className="px-2 py-1 align-top">
                              <p className="font-medium text-gray-900">
                                {it.menuItemName}
                              </p>
                              {it.note && (
                                <p className="mt-0.5 text-[10px] text-gray-500">
                                  Ghi chú: {it.note}
                                </p>
                              )}
                            </td>
                            <td className="px-2 py-1 text-center align-top text-gray-700">
                              {it.quantity}
                            </td>
                            <td className="px-2 py-1 text-right align-top text-gray-700">
                              {formatMoney(it.unitPrice)}
                            </td>
                            <td className="px-2 py-1 text-right align-top font-semibold text-gray-900">
                              {formatMoney(it.lineTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
