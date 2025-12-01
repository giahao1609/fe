import { ApiService } from './api.service';

export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

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

export interface PaginatedBlogs {
  page: number;
  limit: number;
  total: number;
  pages: number;
  items: BlogPost[];
}

type UploadFiles = {
  hero?: File | null;
  gallery?: File[] | null;
};

const BASE_PATH = '/blogs';

/**
 * Append scalar (string/number/boolean) -> string
 */
function appendScalar(fd: FormData, key: string, v: any) {
  if (v === undefined || v === null) return;
  if (typeof v === 'boolean') fd.append(key, v ? 'true' : 'false');
  else fd.append(key, String(v));
}

/**
 * Append array bằng cách lặp lại field nhiều lần: tags=a&tags=b
 */
function appendStringArray(fd: FormData, key: string, arr?: string[]) {
  if (!Array.isArray(arr)) return;
  for (const item of arr) {
    if (item !== undefined && item !== null && String(item).trim() !== '') {
      fd.append(key, String(item));
    }
  }
}

/**
 * Build FormData cho create/update
 */
function buildFormData(
  payload: CreateBlogPayload | UpdateBlogPayload,
  files?: UploadFiles
) {
  const fd = new FormData();

  appendScalar(fd, 'title', payload.title);
  appendScalar(fd, 'subtitle', payload.subtitle);
  appendScalar(fd, 'slug', payload.slug);
  appendScalar(fd, 'excerpt', payload.excerpt);
  appendScalar(fd, 'contentHtml', payload.contentHtml);

  // contentJson: gửi dạng JSON string để backend dễ parse
  if (payload.contentJson !== undefined) {
    fd.append('contentJson', JSON.stringify(payload.contentJson));
  }

  appendStringArray(fd, 'tags', payload.tags);
  appendStringArray(fd, 'categories', payload.categories);

  if (payload.readingMinutes !== undefined) {
    appendScalar(fd, 'readingMinutes', payload.readingMinutes);
  }
  if (payload.status !== undefined) {
    appendScalar(fd, 'status', payload.status);
  }

  appendScalar(fd, 'metaTitle', payload.metaTitle);
  appendScalar(fd, 'metaDescription', payload.metaDescription);
  appendStringArray(fd, 'keywords', payload.keywords);

  // Trường hợp update muốn set heroImageUrl/gallery (bỏ qua upload)
  if ('heroImageUrl' in payload && payload.heroImageUrl !== undefined) {
    appendScalar(fd, 'heroImageUrl', payload.heroImageUrl);
  }
  if ('gallery' in payload && Array.isArray(payload.gallery)) {
    // replace toàn bộ gallery
    appendStringArray(fd, 'gallery', payload.gallery);
  }

  // Files
  if (files?.hero) {
    // chỉ lấy 1 file hero
    fd.append('hero', files.hero);
  }
  if (files?.gallery && files.gallery.length) {
    for (const file of files.gallery) {
      fd.append('gallery', file);
    }
  }

  return fd;
}

export const BlogService = {
  /**
   * Tạo bài viết (của current user dựa vào access token)
   * POST /blogs  (multipart)
   */
  async create(
    payload: CreateBlogPayload,
    files?: UploadFiles
  ): Promise<BlogPost> {
    const fd = buildFormData(payload, files);
    return ApiService.postFormData<BlogPost>(`${BASE_PATH}`, fd);
  },

  /**
   * Cập nhật bài viết theo id (của chính author)
   * PATCH /blogs/:id  (multipart)
   */
  async updateById(
    id: string,
    payload: UpdateBlogPayload,
    files?: UploadFiles
  ): Promise<BlogPost> {
    const fd = buildFormData(payload, files);
    // dùng postFormData + override method nếu backend chỉ nhận PATCH?
    // Ở đây backend đã @Patch(':id') nên cứ gửi thẳng tới /blogs/:id với fetch PATCH
    // Nhưng ApiService hiện chỉ có postFormData (POST). Ta sẽ tạo đường riêng:
    // => Dùng fetch thủ công giống postFormData nhưng method=PATCH.
    const url = (ApiService as any).buildUrl
      ? (ApiService as any).buildUrl(`${BASE_PATH}/${id}`)
      : `${BASE_PATH}/${id}`;

    // Reuse logic trong ApiService.postFormData (tối giản)
    const res = await fetch(url, {
      method: 'PATCH',
      body: fd,
      headers: {
        // KHÔNG set Content-Type cho multipart
        ...(typeof window !== 'undefined' &&
        (document.cookie || '').includes('accessToken=')
          ? {}
          : {}),
      },
    });

    let json: any = {};
    try {
      json = await res.json();
    } catch {
      if (!res.ok) {
        throw new Error('PATCH_FORMDATA_ERROR');
      }
      return {} as BlogPost;
    }

    // dùng cùng handleResponse như ApiService
    const handleResponse = (ApiService as any).handleResponse as
      | ((r: any) => void)
      | undefined;
    if (handleResponse) handleResponse(json);

    return (json?.data ?? json) as BlogPost;
  },

 
  async listMyBlogs(rawQuery?: BlogQuery): Promise<PaginatedBlogs> {
    const params: Record<string, string> = {};

    if (rawQuery) {
      // page
      if (rawQuery.page !== undefined && rawQuery.page !== null) {
        const p = Number(rawQuery.page);
        if (!Number.isNaN(p)) {
          params.page = String(Math.trunc(p)); // "1"
        }
      }

      // limit
      if (rawQuery.limit !== undefined && rawQuery.limit !== null) {
        const l = Number(rawQuery.limit);
        if (!Number.isNaN(l)) {
          params.limit = String(Math.trunc(l)); // "10"
        }
      }

      if (rawQuery.q) params.q = rawQuery.q;
      if (rawQuery.tags) params.tags = rawQuery.tags;
      if (rawQuery.categories) params.categories = rawQuery.categories;
      if (rawQuery.authorId) params.authorId = rawQuery.authorId;
      if (rawQuery.status) params.status = rawQuery.status;
    }

    return ApiService.get<PaginatedBlogs>(`${BASE_PATH}`, params);
  },

  /**
   * Xoá một bài (của chính tác giả)
   * DELETE /blogs/:id
   */
  async deleteMyBlog(id: string): Promise<{ success: boolean }> {
    return ApiService.delete<{ success: boolean }>(`${BASE_PATH}/${id}`);
  },
};
