"use client"
import {  PreOrderMenuItem } from "@/app/(layout)/categories/restaurants/[id]/pre-order/page";
import { NotifyService } from "@/services/notify.service";
import { PreOrderService } from "@/services/pre-order.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
};
const isBrowser = typeof window !== "undefined";
const cartStorageKey = (restaurantId: string) =>
  `fm_cart_restaurant_${restaurantId}`;
function loadCart(restaurantId: string): CartItem[] {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(cartStorageKey(restaurantId));
    if (!raw) return [];
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
// ====== PRE-ORDER SECTION ======
interface RestaurantPreOrderSectionProps {
  restaurantId: string;
  restaurantName?: string;
  menuItems?: PreOrderMenuItem[];
  loadingMenu: boolean;
  isLoggedIn: boolean;
}

export function  RestaurantPreOrderSection({
  restaurantId,
  restaurantName,
  menuItems: rawMenuItems,
  loadingMenu,
  isLoggedIn,
}: RestaurantPreOrderSectionProps) {
  // luôn là array, tránh undefined.length
  const menuItems: PreOrderMenuItem[] = Array.isArray(rawMenuItems)
    ? rawMenuItems
    : [];
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestCount, setGuestCount] = useState(2);
  const [arrivalTime, setArrivalTime] = useState(""); // datetime-local
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load cart từ localStorage
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

  const addItem = (item: PreOrderMenuItem) => {
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

    if (!isLoggedIn) {
      NotifyService.warn("Vui lòng đăng nhập để đặt bàn trước.");
      return;
    }

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
            router.push("/me/pre-orders");

    } catch (err: any) {
      console.error(err);
      NotifyService.error(
        err?.message || "Không gửi được yêu cầu đặt bàn.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* cảnh báo login */}
      {!isLoggedIn && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:text-sm">
          <p className="font-medium">
            Bạn cần đăng nhập để gửi yêu cầu đặt bàn.
          </p>
          <p className="mt-1 text-[11px] sm:text-xs">
            Bạn vẫn có thể xem thực đơn và chuẩn bị sẵn chọn món. Khi đăng nhập
            xong, giỏ món của bạn vẫn được giữ lại trên thiết bị này.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Đăng nhập ngay
            </Link>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              Tạo tài khoản mới
            </Link>
          </div>
        </div>
      )}

      {/* Layout: menu + cart */}
      <div className="grid gap-5 md:grid-cols-[2fr,1.5fr]">
        {/* Menu list */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 sm:text-base">
              Thực đơn gợi ý
            </h2>
            <span className="text-[11px] text-gray-500 sm:text-xs">
              Chạm vào nút <strong>+ Thêm</strong> để bỏ món vào giỏ.
            </span>
          </div>

          {loadingMenu && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-xs"
                >
                  <div className="h-16 w-16 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                    <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingMenu && menuItems.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              Quán chưa cập nhật thực đơn.
            </p>
          )}

          {!loadingMenu && menuItems.length > 0 && (
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
                      <p className="line-clamp-2 text-xs text-gray-500">
                        {m.description}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                      {m.itemType && (
                        <span className="rounded-full bg-gray-50 px-2 py-0.5">
                          {m.itemType}
                        </span>
                      )}
                      {Array.isArray(m.tags) &&
                        m.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700"
                          >
                            #{t}
                          </span>
                        ))}
                    </div>
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
          )}
        </section>

        {/* Cart + info */}
        <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cart */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 sm:text-base">
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
                        <span className="text-gray-700">
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
            <div className="space-y-2 rounded-xl bg-gray-50 p-3 text-xs sm:text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 sm:text-sm">
                    Tên liên hệ *
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 sm:text-sm"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 sm:text-sm">
                    Số điện thoại *
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 sm:text-sm"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="VD: 0909..."
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 sm:text-sm">
                    Số khách *
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 sm:text-sm"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value || 1))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 sm:text-sm">
                    Thời gian dự kiến đến *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 sm:text-sm"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 sm:text-sm">
                  Ghi chú thêm cho quán
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200 sm:text-sm"
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
              {submitting
                ? "Đang gửi yêu cầu..."
                : isLoggedIn
                ? "Gửi yêu cầu đặt bàn"
                : "Đăng nhập để đặt bàn"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}