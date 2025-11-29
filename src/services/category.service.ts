// src/services/category.service.ts
import { ApiService } from "./api.service";

export interface CategoryExtra {
  icon?: string;
  color?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive: boolean;
  sortIndex?: number;
  extra?: CategoryExtra;
  children?: Category[];

  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isActive?: boolean;
  sortIndex?: number;
  extra?: CategoryExtra;
}

const BASE_PATH = "/admin/categories";

export const CategoryService = {
  // GET /admin/categories/tree
  async listTree(): Promise<Category[]> {
    return ApiService.get<Category[]>(`${BASE_PATH}/tree`);
  },

  // POST /admin/categories
  async createCategory(payload: UpsertCategoryPayload): Promise<Category> {
    return ApiService.post<Category>(`${BASE_PATH}`, payload);
  },

  // PUT /admin/categories/id/:id
  async updateCategory(
    id: string,
    payload: UpsertCategoryPayload,
  ): Promise<Category> {
    return ApiService.put<Category>(`${BASE_PATH}/id/${id}`, payload);
  },
};
