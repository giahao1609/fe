export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

export const calcReadingTime = (text: string | string[]) => {
  const s = Array.isArray(text) ? text.join(" ") : text;
  const words = s.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)); // 200wpm
};
