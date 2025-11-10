import DirectionsClient from "@/components/directions/DirectionsClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Đang tải…</div>}>
      <DirectionsClient />
    </Suspense>
  );
}
