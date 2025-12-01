import { ApiService } from './api.service';

// ====== TYPES ======

export type PreOrderStatus =
  | 'PENDING'          // mới tạo, chờ quán xác nhận
  | 'CONFIRMED'        // quán đã xác nhận giữ chỗ
  | 'REJECTED'         // quán từ chối / không nhận
  | 'CANCELLED'        // khách hủy
  | 'WAITING_DEPOSIT'  // yêu cầu đặt cọc, chờ thanh toán
  | 'DEPOSIT_PAID'     // đã thanh toán tiền cọc
  | 'DONE';            // hoàn thành (đã tới ăn xong)

export interface PreOrderItemInput {
  menuItemId: string;
  quantity: number;
  note?: string;
}

export interface PreOrderItem extends PreOrderItemInput {
  _id?: string;
  // Nếu BE có trả thêm snapshot menuItem:
  menuItemName?: string;
  unitPrice?: number;
  totalPrice?: number;
}

export interface PreOrder {
  _id: string;

  restaurantId: string;
  restaurantName?: string;

  customerId: string;
  customerName?: string;
  customerPhone?: string;

  items: PreOrderItem[];

  guestCount?: number;
  arrivalTime?: string; // ISO
  contactName?: string;
  contactPhone?: string;
  note?: string;       // ghi chú của khách
  ownerNote?: string;  // ghi chú nội bộ/ghi chú trả lời của quán

  status: PreOrderStatus;

  // Đặt cọc
  depositPercent?: number;
  depositAmount?: number;
  depositCurrency?: string;
  depositRequestedAt?: string;
  isDepositPaid?: boolean;
  depositPaidAt?: string;
  paymentReference?: string;

  // Meta
  code?: string;
  extra?: Record<string, any>;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePreOrderPayload {
  restaurantId: string;
  items: PreOrderItemInput[];
  guestCount?: number;
  arrivalTime?: string; // ISO string: "2025-12-30T09:30:00+07:00"
  contactName?: string;
  contactPhone?: string;
  note?: string;
}

export interface UpdatePreOrderStatusPayload {
  status: PreOrderStatus;
  ownerNote?: string;
}

export interface RequestDepositPayload {
  depositPercent: number; // 0 - 100
  sendEmail?: boolean;
  emailNote?: string;
}

export interface MarkPaidPayload {
  paymentReference: string;
}

export interface PreOrderQuery {
  page?: number;
  limit?: number;
  status?: PreOrderStatus | string;
  restaurantId?: string;  // filter thêm nếu cần
  from?: string;          // ISO date from
  to?: string;            // ISO date to
}

export interface PaginatedPreOrders {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: PreOrder[];
}

// ====== HELPERS ======

const BASE_PATH = '/pre-orders';

function buildQueryParams(raw?: PreOrderQuery): Record<string, string> {
  const params: Record<string, string> = {};
  if (!raw) return params;

  if (raw.page !== undefined && raw.page !== null) {
    const p = Number(raw.page);
    if (!Number.isNaN(p)) params.page = String(Math.trunc(p));
  }

  if (raw.limit !== undefined && raw.limit !== null) {
    const l = Number(raw.limit);
    if (!Number.isNaN(l)) params.limit = String(Math.trunc(l));
  }

  if (raw.status) params.status = String(raw.status);
  if (raw.restaurantId) params.restaurantId = raw.restaurantId;
  if (raw.from) params.from = raw.from;
  if (raw.to) params.to = raw.to;

  return params;
}

// ====== SERVICE ======

export const PreOrderService = {
  /**
   * Tạo pre-order (khách/owner) – POST /pre-orders
   * Payload giống curl:
   * {
   *   restaurantId, items, guestCount, arrivalTime, contactName, contactPhone, note
   * }
   */
  async create(payload: CreatePreOrderPayload): Promise<PreOrder> {
    return ApiService.post<PreOrder>(BASE_PATH, payload);
  },

  /**
   * Lấy chi tiết 1 pre-order theo id – GET /pre-orders/:id
   */
  async getById(id: string): Promise<PreOrder> {
    return ApiService.get<PreOrder>(`${BASE_PATH}/${id}`);
  },

  /**
   * Danh sách pre-order của current user – GET /pre-orders/me
   * (nếu backend correct theo controller cũ)
   */
  async listMyPreOrders(query?: PreOrderQuery): Promise<PaginatedPreOrders> {
    const params = buildQueryParams(query);
    return ApiService.get<PaginatedPreOrders>(`${BASE_PATH}/me`, params);
  },

  /**
   * Danh sách pre-order theo nhà hàng – GET /pre-orders/restaurant/:restaurantId
   * (owner dùng để xem các đơn pre-order của quán)
   */
  async listForRestaurant(
    restaurantId: string,
    query?: PreOrderQuery,
  ): Promise<PaginatedPreOrders> {
    const params = buildQueryParams(query);
    return ApiService.get<PaginatedPreOrders>(
      `${BASE_PATH}/restaurant/${restaurantId}`,
      params,
    );
  },

  /**
   * Update status pre-order – POST /pre-orders/:id/status
   * Curl:
   *  curl --location '.../pre-orders/{id}/status' \
   *    --header 'Content-Type: application/json' \
   *    --data '{ "status": "CONFIRMED", "ownerNote": "..." }'
   */
  async updateStatus(
    id: string,
    payload: UpdatePreOrderStatusPayload,
  ): Promise<PreOrder> {
    return ApiService.post<PreOrder>(`${BASE_PATH}/${id}/status`, payload);
  },

  /**
   * Yêu cầu đặt cọc – POST /pre-orders/:id/request-deposit
   * Curl:
   *  /pre-orders/{{PRE_ORDER_ID}}/request-deposit
   *  { "depositPercent": 30, "sendEmail": true, "emailNote": "..." }
   */
  async requestDeposit(
    id: string,
    payload: RequestDepositPayload,
  ): Promise<PreOrder> {
    return ApiService.post<PreOrder>(
      `${BASE_PATH}/${id}/request-deposit`,
      payload,
    );
  },

  /**
   * Đánh dấu đã thanh toán cọc – POST /pre-orders/:id/mark-paid
   * Curl:
   *  /pre-orders/{{PRE_ORDER_ID}}/mark-paid
   *  { "paymentReference": "VNPAY_..." }
   */
  async markPaid(id: string, payload: MarkPaidPayload): Promise<PreOrder> {
    return ApiService.post<PreOrder>(`${BASE_PATH}/${id}/mark-paid`, payload);
  },

  /**
   * Confirm final – POST /pre-orders/:id/confirm
   * Curl:
   *  /pre-orders/{{PRE_ORDER_ID}}/confirm
   *  (không body)
   */
  async confirm(id: string): Promise<PreOrder> {
    return ApiService.post<PreOrder>(`${BASE_PATH}/${id}/confirm`, {});
  },

  /**
   * (Nếu cần) Huỷ pre-order – POST /pre-orders/:id/cancel
   * Không thấy trong curl, nhưng hay dùng:
   */
  async cancel(id: string, reason?: string): Promise<PreOrder> {
    return ApiService.post<PreOrder>(`${BASE_PATH}/${id}/cancel`, {
      reason,
    });
  },
};
