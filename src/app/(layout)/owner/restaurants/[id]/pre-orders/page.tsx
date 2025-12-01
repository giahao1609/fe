import OwnerPreOrdersTab from "@/components/owner/OwnerPreOrdersTab";

export default function OwnerPreOrdersPage({
  params,
}: { params: { id: string } }) {
  return <OwnerPreOrdersTab restaurantId={params.id} />;
}
