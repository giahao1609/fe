import { api } from "./api";

export async function getFiles() {
  const res = await api.get("/upload/ai/data");
  return res.data;
}

export async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("files", file);
  const res = await api.post("/upload/ai/data", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteFile(filename: string) {
  const res = await api.delete(`/upload/ai/data/${encodeURIComponent(filename)}`);
  return res.data;
}

export async function getHistory() {
  const res = await api.get("/chat/history");
  return res.data;
}

export async function deleteHistory(id: string) {
  const res = await api.delete(`/chat/history/${id}`);
  return res.data;
}
