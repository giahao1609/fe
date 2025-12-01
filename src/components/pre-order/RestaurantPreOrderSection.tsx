"use client";

import { useEffect, useMemo, useState } from "react";
import { PreOrderService } from "@/services/pre-order.service";
import { NotifyService } from "@/services/notify.service";

const isBrowser = typeof window !== "undefined";

const cartStorageKey = (restaurantId: string) =>
  `fm_cart_restaurant_${restaurantId}`;

export type MenuItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
};

interface RestaurantPreOrderSectionProps {
  restaurantId: string;
  restaurantName?: string;
  menuItems: MenuItem[];
}

function loadCart(restaurantId: string): CartItem[] {
  if (!isBrowser) return [];
  const raw = window.localStorage.getItem(cartStorageKey(restaurantId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return [];
}

function saveCart(restaurantId: string, cart: CartItem[]) {
  if (!isBrowser) return;
  window.localStorage.setItem(cartStorageKey(restaurantId), JSON.stringify(cart));
}

export default function RestaurantPreOrderSection({
  restaurantId,
  restaurantName,
  menuItems,
}: RestaurantPreOrderSectionProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestCount, setGuestCount] = useState(2);
  const [arrivalTime, setArrivalTime] = useState(""); // datetime-local
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const c = loadCart(restaurantId);
    setCart(c);
  }, [restaurantId]);

  const updateCart = (updater: (prev: CartItem[]) => CartItem[]) => {
    setCart((prev) => {
      const next = updater(prev);
      saveCart(restaurantId, next);
      return next;
    });
  };

  const addItem = (item: MenuItem) => {
    updateCart((prev) => {
      const idx = prev.findIndex((c) => c.menuItemId === item._id);
      if (idx === -1) {
        return [
          ...prev,
          {
            menuItemId: item._id,
            name: item.name,
            price: item.price,
            quantity: 1,
          },
        ];
      }
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        quantity: next[idx].quantity + 1,
      };
      return next;
    });
  };

  const changeQuantity = (menuItemId: string, qty: number) => {
    updateCart((prev) => {
      if (qty <= 0) {
        return prev.filter((c) => c.menuItemId !== menuItemId);
      }
      return prev.map((c) =>
        c.menuItemId === menuItemId ? { ...c, quantity: qty } : c,
      );
    });
  };

  const changeNote = (menuItemId: string, newNote: string) => {
    updateCart((prev) =>
      prev.map((c) =>
        c.menuItemId === menuItemId ? { ...c, note: newNote } : c,
      ),
    );
  };

  const clearCart = () => {
    updateCart(() => []);
  };

  const summary = useMemo(() => {
    const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);
    const totalPrice = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
    return { totalItems, totalPrice };
  }, [cart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) {
      NotifyService.warn("Giỏ món đang trống, hãy chọn ít nhất 1 món.");
      return;
    }
    if (!contactName.trim()) {
      NotifyService.warn("Vui lòng nhập tên liên hệ.");
      return;
    }
    if (!contactPhone.trim()) {
      NotifyService.warn("Vui lòng nhập số điện thoại.");
      return;
    }
    if (!arrivalTime) {
      NotifyService.warn("Vui lòng chọn thời gian dự kiến đến.");
      return;
    }

    // Convert datetime-local -> ISO
    const isoArrival = new Date(arrivalTime).toISOString();

    setSubmitting(true);
    try {
      await PreOrderService.create({
        restaurantId,
        items: cart.map((c) => ({
          menuItemId: c.menuItemId,
          quantity: c.quantity,
          note: c.note,
        })),
        guestCount,
        arrivalTime: isoArrival,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        note: note.trim() || undefined,
      });

      NotifyService.success("Gửi yêu cầu đặt bàn thành công!");
      clearCart();
      setNote("");
    } catch (err: any) {
      console.error(err);
      NotifyService.error(err?.message || "Không gửi được yêu cầu đặt bàn.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 p-[1px]">
        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-white/90 px-4 py-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Đặt bàn trước {restaurantName ? `– ${restaurantName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Chọn món, số khách và thời gian đến. Quán sẽ xác nhận lại cho bạn.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-gray-600">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700">
              Không cần thanh toán trước · Thanh toán tại quán
            </span>
            <span>
              Tổng món:{" "}
              <span className="font-semibold text-gray-900">
                {summary.totalItems}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Layout: menu + cart */}
      <div className="grid gap-5 md:grid-cols-[2fr,1.5fr]">
        {/* Menu list */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">
              Thực đơn gợi ý
            </h2>
            <span className="text-xs text-gray-500">
              Chạm vào nút <strong>+ Thêm</strong> để bỏ vào giỏ.
            </span>
          </div>

          {menuItems.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              Quán chưa cập nhật thực đơn.
            </p>
          )}

          <div className="space-y-3">
            {menuItems.map((m) => (
              <div
                key={m._id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-xs"
              >
                {m.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.imageUrl}
                    alt={m.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {m.name}
                  </p>
                  {m.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {m.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs font-semibold text-rose-600">
                    {m.price.toLocaleString("vi-VN")}₫
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addItem(m)}
                  className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  + Thêm
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Cart + info */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cart */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  Giỏ món đã chọn
                </h2>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-gray-500 hover:text-rose-600"
                  >
                    Xóa giỏ
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-500">
                  Chưa chọn món nào. Hãy chọn món ở danh sách bên trái.
                </p>
              ) : (
                <div className="space-y-2">
                  {cart.map((c) => (
                    <div
                      key={c.menuItemId}
                      className="space-y-1 rounded-xl border border-gray-100 bg-gray-50 p-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-800">
                          {c.name}
                        </p>
                        <span className="text-gray-600">
                          {(c.price * c.quantity).toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(c.menuItemId, c.quantity - 1)
                            }
                            className="h-5 w-5 rounded-full bg-gray-100 text-center leading-5 text-gray-700 hover:bg-gray-200"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            className="w-10 border-none bg-transparent text-center text-xs outline-none"
                            value={c.quantity}
                            min={1}
                            onChange={(e) =>
                              changeQuantity(
                                c.menuItemId,
                                Number(e.target.value || 1),
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(c.menuItemId, c.quantity + 1)
                            }
                            className="h-5 w-5 rounded-full bg-gray-100 text-center leading-5 text-gray-700 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => changeQuantity(c.menuItemId, 0)}
                          className="text-[11px] text-gray-500 hover:text-rose-600"
                        >
                          Xóa
                        </button>
                      </div>
                      <textarea
                        rows={1}
                        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200"
                        placeholder="Ghi chú món này (ít đá, ít đường...)"
                        value={c.note ?? ""}
                        onChange={(e) =>
                          changeNote(c.menuItemId, e.target.value)
                        }
                      />
                    </div>
                  ))}

                  <div className="mt-2 flex items-center justify-between text-xs font-semibold text-gray-800">
                    <span>
                      Tổng {summary.totalItems} món
                    </span>
                    <span>
                      {summary.totalPrice.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Info khách + thời gian */}
            <div className="space-y-2 rounded-xl bg-gray-50 p-3 text-xs">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-medium text-gray-700">
                    Tên liên hệ *
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-gray-700">
                    Số điện thoại *
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="VD: 0909..."
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-medium text-gray-700">
                    Số khách *
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value || 1))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-gray-700">
                    Thời gian dự kiến đến *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-gray-700">
                  Ghi chú thêm cho quán
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Cho bàn gần cửa sổ, có ghế em bé..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                submitting || cart.length === 0
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt bàn"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
