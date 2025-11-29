export function resolveCDN(src: string) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;

  const base = process.env.NEXT_PUBLIC_CDN_BASE?.replace(/\/+$/, "");
  if (base) return `${base}${src.startsWith("/") ? "" : "/"}${src}`;

  const map: Record<string, string> = {
    "/image/hero-food.jpg":
      "https://images.unsplash.com/photo-1543357480-c60d40007a14?q=80&w=1600&auto=format&fit=crop",
  };
  return map[src] ?? src;
}
