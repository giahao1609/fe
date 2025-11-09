"use client";
import Image from "next/image";

interface Props {
  title: string;
  images: string[];
  getImageUrl: (path?: string) => string;
  onPreview: (url: string) => void;
}

export default function RestaurantGallery({ title, images, getImageUrl, onPreview }: Props) {
  if (!images?.length) return null;

  return (
    <section className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-3 border-b pb-2">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => {
          const url = getImageUrl(img);
          return (
            <div
              key={i}
              className="relative w-full h-48 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => onPreview(url)}
            >
              <Image
                src={url}
                alt={`${title}-${i}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
