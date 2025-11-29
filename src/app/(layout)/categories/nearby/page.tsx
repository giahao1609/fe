import FoodMapView from "@/components/map/FoodMapView";

export default function NearbyPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Quán ăn gần bạn</h1>
        <p className="text-gray-600">
          Xem các quán ăn, cà phê, nhà hàng quanh vị trí hiện tại của bạn.
        </p>
      </header>

      <FoodMapView />
    </main>
  );
}
