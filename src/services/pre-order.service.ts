import { ApiService } from "./api.service";


export type PreOrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

export type PreOrderMoney = {
  currency: string;
  amount: number;
};

export type PreOrderItem = {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice?: PreOrderMoney;
  lineTotal?: PreOrderMoney;
  note?: string;
};

export type PreOrder = {
  _id: string;
  userId: string;
  restaurantId: string;
  guestCount: number;
  arrivalTime: string; // ISO
  contactName: string;
  contactPhone: string;
  note?: string;
  ownerNote?: string;
  status: PreOrderStatus;
  totalAmount?: PreOrderMoney;
  depositPercent?: number | null;
  requiredDepositAmount?: PreOrderMoney | null;
  paymentEmailSentAt?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items?: PreOrderItem[];
};

export type RequestDepositPayload = {
  depositPercent?: number;   // 0–100
  sendEmail?: boolean;       // default true
  emailNote?: string;
  overrideEmail?: string;
};

export type MarkPaidPayload = {
  paymentReference?: string;
};

export type UpdatePreOrderStatusPayload = {
  status: "CANCELLED" | "REJECTED";
  ownerNote?: string;
};

export const PreOrderService = {
  // ông đã có create(...) rồi, giữ nguyên
  async create(dto: any) {
    return ApiService.post<PreOrder>("/pre-orders", dto);
  },

  async listForRestaurant(restaurantId: string) {
    return ApiService.get<PreOrder[]>(
      `/pre-orders/restaurant/${restaurantId}`,
    );
  },

  async getById(id: string) {
    return ApiService.get<PreOrder>(`/pre-orders/restaurant${id}`);
  },

  async requestDeposit(id: string, payload: RequestDepositPayload) {
    return ApiService.post<PreOrder>(
      `/pre-orders/${id}/request-deposit`,
      payload,
    );
  },

  async markPaid(id: string, payload: MarkPaidPayload) {
    return ApiService.post<PreOrder>(`/pre-orders/${id}/mark-paid`, payload);
  },

  async confirm(id: string) {
    return ApiService.post<PreOrder>(`/pre-orders/${id}/confirm`, {});
  },

  async updateStatus(id: string, payload: UpdatePreOrderStatusPayload) {
    return ApiService.post<PreOrder>(`/pre-orders/${id}/status`, payload);
  },
};
