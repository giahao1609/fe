// src/services/user.service.ts
import { ApiService } from "./api.service";

export type UserRole = "customer" | "owner" | "admin" | string;

export interface UserItem {
  _id: string;
  displayName: string;
  email: string;
  roles: UserRole[];
  addresses: any[];
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ListUsersResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: UserItem[];
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  keyword?: string | null;
  role?: string | null;
}

export interface UpdateUserRolesPayload {
  roles: UserRole[];
}

const BASE_PATH = "/admin/users";

export const UserService = {
  async listUsers(params: ListUsersParams = {}): Promise<ListUsersResponse> {
    const {
      page = 1,
      limit = 10,
      keyword,
      role,
    } = params;

    const query: Record<string, any> = {
      page,
      limit,
    };

    if (keyword && keyword.trim()) {
      query.keyword = keyword.trim();
    }

    if (role && role.trim()) {
      query.role = role.trim();
    }

    return ApiService.get<ListUsersResponse>(`${BASE_PATH}/list-user`, query);
  },

  async updateRolesByEmail(
    email: string,
    roles: UserRole[],
  ): Promise<UserItem> {
    if (!email.trim()) {
      throw new Error("Email không được để trống");
    }
    if (!roles || roles.length === 0) {
      throw new Error("Danh sách roles không được để trống");
    }

    const path = `${BASE_PATH}/email/${encodeURIComponent(email)}/roles`;
    const payload: UpdateUserRolesPayload = { roles };

    return ApiService.post<UserItem>(path, payload);
  },

  async addOwnerRole(email: string, currentRoles: UserRole[]): Promise<UserItem> {
    const normalized = new Set(
      (currentRoles || []).map((r) => r.toLowerCase()),
    );

    normalized.add("customer");
    normalized.add("owner");

    const finalRoles = Array.from(normalized);

    return UserService.updateRolesByEmail(email, finalRoles);
  },
};
