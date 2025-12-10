// src/services/blog.service.ts
import { ApiService } from "./api.service";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogPost {
  _id: string;
  authorId: string;
  title: string;
  subtitle?: string;
  slug: string;
  excerpt?: string;
  contentHtml?: string;
  contentJson?: any;

  tags?: string[];
  categories?: string[];

  heroImageUrl?: string;
  heroImageUrlSigned?: string | null;

  gallery?: string[];
  gallerySigned?: { path: string; url: string | null }[];

  readingMinutes?: number;
  status: BlogStatus;
  publishedAt?: string;

  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];

  searchTerms?: string[];
  viewCount?: number;
  likeCount?: number;
  isFeatured?: boolean;

  extra?: Record<string, any>;

  createdAt?: string;
  updatedAt?: string;
}

// ==== Payloads dùng cho create/update ====
export interface CreateBlogPayload {
  title: string;
  subtitle?: string;
  slug?: string;
  excerpt?: string;
  contentHtml?: string;
  contentJson?: any;
  tags?: string[];
  categories?: string[];
  readingMinutes?: number;
  status?: BlogStatus;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface UpdateBlogPayload {
  title?: string;
  subtitle?: string;
  slug?: string;
  excerpt?: string;
  contentHtml?: string;
  contentJson?: any;
  tags?: string[];
  categories?: string[];
  readingMinutes?: number;
  status?: BlogStatus;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  heroImageUrl?: string;
  gallery?: string[];
}

export interface BlogQuery {
  page?: number;
  limit?: number;
  q?: string;
  tags?: string;        // "tag1,tag2"
  categories?: string;  // "blog,review"
  authorId?: string;
  status?: string;
}

// Shape thực tế theo API /blogs & /blogs/full
export interface RawPaginatedBlogs {
  items: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// Shape dùng trong FE (có trường pages cho tiện)
export interface PaginatedBlogs {
  items: BlogPost[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

type UploadFiles = {
  hero?: File | null;
  gallery?: File[] | null;
};

const BASE_PATH = "/blogs";

// ========= Helpers build FormData =========

function appendScalar(fd: FormData, key: string, v: any) {
  if (v === undefined || v === null) return;
  if (typeof v === "boolean") fd.append(key, v ? "true" : "false");
  else fd.append(key, String(v));
}

function appendStringArray(fd: FormData, key: string, arr?: string[]) {
  if (!Array.isArray(arr)) return;
  for (const item of arr) {
    if (item !== undefined && item !== null && String(item).trim() !== "") {
      fd.append(key, String(item));
    }
  }
}

function buildFormData(
  payload: CreateBlogPayload | UpdateBlogPayload,
  files?: UploadFiles,
) {
  const fd = new FormData();

  appendScalar(fd, "title", (payload as any).title);
  appendScalar(fd, "subtitle", payload.subtitle);
  appendScalar(fd, "slug", payload.slug);
  appendScalar(fd, "excerpt", payload.excerpt);
  appendScalar(fd, "contentHtml", payload.contentHtml);

  // contentJson: gửi dạng JSON string
  if (payload.contentJson !== undefined) {
    fd.append("contentJson", JSON.stringify(payload.contentJson));
  }

  appendStringArray(fd, "tags[]", payload.tags);
  appendStringArray(fd, "categories[]", payload.categories);
  appendStringArray(fd, "keywords[]", payload.keywords);

  if (payload.readingMinutes !== undefined) {
    appendScalar(fd, "readingMinutes", payload.readingMinutes);
  }
  if (payload.status !== undefined) {
    appendScalar(fd, "status", payload.status);
  }

  appendScalar(fd, "metaTitle", payload.metaTitle);
  appendScalar(fd, "metaDescription", payload.metaDescription);

  // Trường hợp update muốn set heroImageUrl/gallery (string), bỏ qua upload
  if ("heroImageUrl" in payload && payload.heroImageUrl !== undefined) {
    appendScalar(fd, "heroImageUrl", payload.heroImageUrl);
  }
  if ("gallery" in payload && Array.isArray(payload.gallery)) {
    appendStringArray(fd, "gallery[]", payload.gallery);
  }

  // Files
  if (files?.hero) {
    fd.append("hero", files.hero);
  }
  if (files?.gallery && files.gallery.length) {
    for (const file of files.gallery) {
      fd.append("gallery", file);
    }
  }

  return fd;
}

function normalizePagination(raw: RawPaginatedBlogs): PaginatedBlogs {
  const limit = raw.limit || (raw.items?.length ?? 0) || 1;
  const pages =
    raw.totalPages ??
    (limit > 0 ? Math.max(1, Math.ceil((raw.total ?? 0) / limit)) : 1);

  return {
    items: raw.items ?? [],
    total: raw.total ?? 0,
    page: raw.page ?? 1,
    limit,
    pages,
  };
}

// helper build options từ jwt cho SSR
function buildAuthOptions(jwt?: string) {
  if (!jwt) return undefined;
  return {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  };
}

// ========= BlogService =========
// Tất cả method đều cho phép truyền thêm jwt? để dùng trong Server Component (SSR).
// - FE browser: bỏ jwt, dùng token trong cookies (authToken)
// - SSR: truyền jwt vào để override header Authorization

export const BlogService = {
  async detail(idOrSlug: string, jwt?: string): Promise<BlogPost> {
    if (!idOrSlug) {
      throw new Error("idOrSlug is required");
    }

    // Thử gọi theo slug trước
    try {
      const bySlug = await BlogService.getBySlug(idOrSlug, jwt);
      if (bySlug) return bySlug;
    } catch (e) {
      // ignore, fallback sang getById
      // console.warn("detail getBySlug failed, fallback to getById", e);
    }

    // Fallback: gọi theo id
    try {
      const byId = await BlogService.getById(idOrSlug, jwt);
      return byId;
    } catch (e) {
      // Nếu cả hai đều fail thì throw ra
      throw e;
    }
  },
  async create(
    payload: CreateBlogPayload,
    files?: UploadFiles,
    jwt?: string,
  ): Promise<BlogPost> {
    const fd = buildFormData(payload, files);
    return ApiService.postFormData<BlogPost>(
      `${BASE_PATH}`,
      fd,
      undefined,
      buildAuthOptions(jwt),
    );
  },

  /**
   * Cập nhật bài viết theo id (POST multipart /blogs/:id)
   */
  async updateById(
    id: string,
    payload: UpdateBlogPayload,
    files?: UploadFiles,
    jwt?: string,
  ): Promise<BlogPost> {
    if (!id) throw new Error("Blog id is required");
    const fd = buildFormData(payload, files);
    return ApiService.postFormData<BlogPost>(
      `${BASE_PATH}/${id}`,
      fd,
      undefined,
      buildAuthOptions(jwt),
    );
  },

  /**
   * Lấy chi tiết 1 bài viết theo id
   * GET /blogs/:id
   */
  async getById(id: string, jwt?: string): Promise<BlogPost> {
    if (!id) throw new Error("Blog id is required");
    return ApiService.get<BlogPost>(
      `${BASE_PATH}/${id}`,
      undefined,
      buildAuthOptions(jwt),
    );
  },

  /**
   * Lấy chi tiết theo slug – nếu backend có route /blogs/slug/:slug
   */
  async getBySlug(slug: string, jwt?: string): Promise<BlogPost> {
    if (!slug) throw new Error("Slug is required");
    return ApiService.get<BlogPost>(
      `${BASE_PATH}/slug/${encodeURIComponent(slug)}`,
      undefined,
      buildAuthOptions(jwt),
    );
  },

  async listBlogs(
    rawQuery?: BlogQuery,
    jwt?: string,
  ): Promise<PaginatedBlogs> {
    const params: Record<string, string> = {};

    if (rawQuery) {
      if (rawQuery.page !== undefined && rawQuery.page !== null) {
        const p = Number(rawQuery.page);
        if (!Number.isNaN(p)) params.page = String(Math.trunc(p));
      }
      if (rawQuery.limit !== undefined && rawQuery.limit !== null) {
        const l = Number(rawQuery.limit);
        if (!Number.isNaN(l)) params.limit = String(Math.trunc(l));
      }

      if (rawQuery.q) params.q = rawQuery.q;
      if (rawQuery.tags) params.tags = rawQuery.tags;
      if (rawQuery.categories) params.categories = rawQuery.categories;
      if (rawQuery.authorId) params.authorId = rawQuery.authorId;
      if (rawQuery.status) params.status = rawQuery.status;
    }

    const raw = await ApiService.get<RawPaginatedBlogs>(
      `${BASE_PATH}`,
      params,
      buildAuthOptions(jwt),
    );
    return normalizePagination(raw);
  },

  /**
   * Alias cho tên cũ
   */
  async listMyBlogs(
    rawQuery?: BlogQuery,
    jwt?: string,
  ): Promise<PaginatedBlogs> {
    return BlogService.listBlogs(rawQuery, jwt);
  },

  /**
   * List full: GET /blogs/full?page=1&limit=20
   */
  async listFullBlogs(
    rawQuery?: BlogQuery,
    jwt?: string,
  ) {
    const params: Record<string, string> = {};

    if (rawQuery) {
      if (rawQuery.page !== undefined && rawQuery.page !== null) {
        const p = Number(rawQuery.page);
        if (!Number.isNaN(p)) params.page = String(Math.trunc(p));
      }
      if (rawQuery.limit !== undefined && rawQuery.limit !== null) {
        const l = Number(rawQuery.limit);
        if (!Number.isNaN(l)) params.limit = String(Math.trunc(l));
      }
      if (rawQuery.q) params.q = rawQuery.q;
      if (rawQuery.tags) params.tags = rawQuery.tags;
      if (rawQuery.categories) params.categories = rawQuery.categories;
      if (rawQuery.authorId) params.authorId = rawQuery.authorId;
      if (rawQuery.status) params.status = rawQuery.status;
    }

    const raw = await ApiService.get<RawPaginatedBlogs>(
      `${BASE_PATH}/full`,
      params,
      buildAuthOptions(jwt),
    );
    return normalizePagination(raw);
  },

  /**
   * Xoá một bài
   * DELETE /blogs/:id
   */
  async deleteMyBlog(
    id: string,
    jwt?: string,
  ): Promise<{ success: boolean }> {
    if (!id) throw new Error("Blog id is required");
    return ApiService.delete<{ success: boolean }>(
      `${BASE_PATH}/${id}`,
      undefined,
      buildAuthOptions(jwt),
    );
  },

  async updatePublishStatus(
    id: string,
    published: boolean,
    jwt?: string,
  ) {
    const body = { published };

    // nếu ApiService có patch thì dùng patch cũng được
    const raw = await ApiService.put<BlogPost>(
      `${BASE_PATH}/${id}/status`,
      body,
      buildAuthOptions(jwt),
    );

    return raw;
  },

  async updateHiddenStatus(
    id: string,
    isHidden: boolean,
    jwt?: string,
  ) {
    return ApiService.post<BlogPost>(
      `${BASE_PATH}/${id}/hidden`,
      { isHidden },
      buildAuthOptions(jwt),
    );
  },
};

