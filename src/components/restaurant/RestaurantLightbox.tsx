"use client";
import Image from "next/image";

export default function RestaurantLightbox({
  previewImage,
  onClose,
}: {
  previewImage: string | null;
  onClose: () => void;
}) {
  if (!previewImage) return null;
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full mx-4">
        <Image
          src={previewImage}
          alt="Preview"
          width={1200}
          height={800}
          className="w-full h-auto rounded-lg shadow-lg object-contain"
          unoptimized
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
