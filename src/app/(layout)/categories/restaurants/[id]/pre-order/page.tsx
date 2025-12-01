import RestaurantPreOrderSection, {
  type MenuItem,
} from "@/components/pre-order/RestaurantPreOrderSection";

// Đây chỉ demo: ông fetch menu từ API rồi pass xuống
async function getMenuItems(id: string): Promise<MenuItem[]> {
  // TODO: gọi REST /restaurants/:id/menu
  return [];
}

export default async function RestaurantPreOrderPage({
  params,
}: { params: { id: string } }) {
  const menuItems = await getMenuItems(params.id);

  return (
    <RestaurantPreOrderSection
      restaurantId={params.id}
      restaurantName="Tên quán demo"
      menuItems={menuItems}
    />
  );
}
