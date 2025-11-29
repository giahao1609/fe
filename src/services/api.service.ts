import axios from 'axios';
import { NotifyService } from './notify.service';

type ApiHeaders = Record<string, string>;

const API_BASE_URL = process.env.API_BASE_URL ?? 'https://api.food-map.online/api/v1';
export const nameCookies = 'accessToken';

let authToken: string | null = null;
let extraHeaders: ApiHeaders = {};


const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const setAccessTokenCookie = (token: string | null, days = 7) => {
  if (!isBrowser) return;
  if (!token) {
    document.cookie = `${nameCookies}=; Max-Age=0; Path=/`;
    return;
  }
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${nameCookies}=${encodeURIComponent(token)}; Expires=${expires}; Path=/`;
};

const getAccessTokenFromCookies = (): string | null => {
  if (!isBrowser) return null;
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${nameCookies}=`));
  if (!match) return null;
  return decodeURIComponent(match.split('=')[1] || '');
};

if (isBrowser) {
  authToken = getAccessTokenFromCookies();
}

const getDefaultHeaders = (withJsonContentType = true): HeadersInit => {
  const headers: HeadersInit = {
    ...(withJsonContentType ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...extraHeaders,
  };
  return headers;
};

const handleResponse = (response: any) => {
  if ('statusCode' in response && response.statusCode >= 400) {
    let msg = response?.message || 'Có lỗi xảy ra';

    if (response?.message === 'EMAIL_EXISTS') {
      msg = 'Email đã tồn tại';
    } else if (response?.message === 'INVALID_CREDENTIALS') {
      msg = 'Email hoặc mật khẩu không đúng, vui lòng kiểm tra lại.';
    } else if (response?.message === 'Please wait before requesting another code.') {
      msg = 'Bạn đã yêu cầu mã gần đây, vui lòng đợi thêm trước khi yêu cầu lại.';
    } else if (response?.message === 'Invalid code.' || response?.message === 'Invalid code') {
      msg = 'Mã xác nhận không đúng hoặc đã hết hạn, vui lòng kiểm tra lại.';
    }

    NotifyService.error(msg);
    throw new Error(response?.message || msg);
  }
};

const postFormData = async <T = any>(
  path: string,
  formData: FormData,
  params?: any,
): Promise<T> => {
  try {
    const url = buildUrl(path, params);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        // KHÔNG set Content-Type để browser tự set boundary
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...extraHeaders,
      },
    });

    let json: any = {};
    try {
      json = await response.json();
    } catch {
      // không phải JSON (ít gặp) -> coi như lỗi chung
      if (!response.ok) {
        NotifyService.error('Có lỗi xảy ra khi POST form data');
        throw new Error('POST_FORMDATA_ERROR');
      }
      return {} as T;
    }

    handleResponse(json);
    return (json?.data ?? json) as T;
  } catch (error: any) {
    console.error(error);
    if (!error?.message) {
      NotifyService.error('Có lỗi xảy ra khi POST form data');
    }
    throw error;
  }
};

const buildUrl = (path: string, params?: any): string => {
  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path);
    if (params) {
      Object.keys(params).forEach(key =>
        url.searchParams.append(key, String(params[key])),
      );
    }
    return url.toString();
  }

  const base = API_BASE_URL.replace(/\/+$/, ''); 
  const cleanPath = path.replace(/^\/+/, '');  

  const url = new URL(`${base}/${cleanPath}`);

  if (params) {
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, String(params[key])),
    );
  }

  return url.toString();
};


const get = async <T = any>(path: string, params?: any): Promise<T> => {
  try {
    const url = buildUrl(path, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    const json = await response.json();
    handleResponse(json);
    return (json?.data ?? json) as T;
  } catch (error: any) {
    console.error(error);
    if (!error?.message) {
      NotifyService.error('Có lỗi xảy ra khi GET');
    }
    throw error;
  }
};

const getFile = async <T = any>(path: string, params?: any): Promise<T> => {
  try {
    const url = buildUrl(path, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...extraHeaders,
      },
    });

    const json = await response.json();
    handleResponse(json);
    return (json?.data ?? json) as T;
  } catch (error: any) {
    console.error(error);
    if (!error?.message) {
      NotifyService.error('Có lỗi xảy ra khi GET file');
    }
    throw error;
  }
};

const post = async <T = any>(path: string, body?: any, params?: any): Promise<T> => {
  try {
    const url = buildUrl(path, params);

    const response = await fetch(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: getDefaultHeaders(),
    });

    const json = await response.json();
    handleResponse(json);
    return (json?.data ?? json) as T;
  } catch (error: any) {
    console.error(error);
    if (!error?.message) {
      NotifyService.error('Có lỗi xảy ra khi POST');
    }
    throw error;
  }
};

const put = async <T = any>(path: string, body?: any, params?: any): Promise<T> => {
  try {
    const url = buildUrl(path, params);

    const response = await fetch(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: getDefaultHeaders(),
    });

    const json = await response.json();
    handleResponse(json);
    return (json?.data ?? json) as T;
  } catch (error: any) {
    console.error(error);
    if (!error?.message) {
      NotifyService.error('Có lỗi xảy ra khi PUT');
    }
    throw error;
  }
};

const del = async <T = any>(path: string, params?: any): Promise<T> => {
  try {
    const url = buildUrl(path, params);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getDefaultHeaders(),
    });

    const json = await response.json();
    handleResponse(json);
    return (json?.data ?? json) as T;
  } catch (error: any) {
    console.error(error);
    if (!error?.message) {
      NotifyService.error('Có lỗi xảy ra khi DELETE');
    }
    throw error;
  }
};

const upload = async <T = any>(path: string, file: File, params?: any): Promise<T> => {
  try {
    const url = buildUrl(path, params);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...extraHeaders,
      },
    });

    const json = await response.json();
    handleResponse(json);
    return (json?.data ?? json) as T;
  } catch (error: any) {
    console.error(error);
    if (!error?.message) {
      NotifyService.error('Có lỗi xảy ra khi upload file');
    }
    throw error;
  }
};

const download = async (path: string, name?: string) => {
  try {
    const url = buildUrl(path);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'blob',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...extraHeaders,
      },
    });

    let filename = '';
    const disposition = response.headers['content-disposition'];

    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    filename = filename || name || '';

    const file = new Blob([response.data], { type: response.data?.type });
    const blobUrl = window.URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = blobUrl;
    if (filename) {
      link.setAttribute('download', filename);
    }
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error: any) {
    console.error(error);
    NotifyService.warn('Có lỗi xảy ra khi tải tập tin');
  }
};

const downloadBlob = async (path: string, name?: string): Promise<{ blob: Blob; filename: string } | null> => {
  try {
    const url = buildUrl(path);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'blob',
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...extraHeaders,
      },
    });

    let filename = '';
    const disposition = response.headers['content-disposition'];

    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    filename = filename || name || '';

    return {
      blob: new Blob([response.data], { type: response.data?.type }),
      filename,
    };
  } catch (error: any) {
    console.error(error);
    NotifyService.warn('Có lỗi xảy ra khi tải tập tin');
    return null;
  }
};

const readFile = async (file: File, name?: string) => {
  const fileName = name || `Export-${new Date().toISOString()}.xlsx`;
  const type = 'application/octet-stream';
  const fileDownload = new Blob([file], { type });
  const url = window.URL.createObjectURL(fileDownload);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const ApiService = {
  setToken(value: string | null) {
    authToken = value;
    setAccessTokenCookie(value);
  },
  clearToken() {
    authToken = null;
    setAccessTokenCookie(null);
  },
  setHeaders(headers: ApiHeaders) {
    extraHeaders = headers || {};
  },
  mergeHeaders(headers: ApiHeaders) {
    extraHeaders = { ...extraHeaders, ...headers };
  },

  get,
  getFile,
  post,
  put,
  postFormData,
  upload,
  delete: del,
  download,
  downloadBlob,
  readFile,
};
