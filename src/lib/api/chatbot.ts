// src/lib/api/chatbot.ts
"use client";

const LS_KEY = "fm_files";

type FileRow = { name: string; url: string; createdAt: string; status?: string };

function load(): FileRow[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
}

function save(list: FileRow[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export async function getFiles(): Promise<FileRow[]> {
  return load();
}

// Demo: dùng blob: URL (sống theo phiên). Nếu muốn bền, có thể FileReader -> base64.
export async function uploadFile(file: File): Promise<void> {
  const list = load();
  const url = URL.createObjectURL(file); // quick demo
  list.unshift({
    name: file.name,
    url,
    createdAt: new Date().toISOString(),
    status: "indexed",
  });
  save(list);
}

export async function deleteFile(nameOrPath: string): Promise<void> {
  // nameOrPath có thể là "folder/name.pdf" -> lấy phần cuối
  const filename = nameOrPath.split("/").pop() || nameOrPath;
  const next = load().filter((f) => {
    // match theo: đúng tên, hoặc url kết thúc bằng filename (hữu ích với blob:)
    return f.name !== filename && !f.url.endsWith(filename);
  });
  save(next);
}
export async function getHistory() {
  // mock trả về rỗng; sau này thay bằng API thực
  return [
    { id: "h1", user: "guest", createdAt: new Date().toISOString(), messageCount: 5 },
    { id: "h2", user: "minhdao", createdAt: new Date().toISOString(), messageCount: 12 },
  ];
}

export async function deleteHistory(id: string) {
  // mock xoá
  return { ok: true, id };
}