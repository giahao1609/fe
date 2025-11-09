import { api } from "./api";

export async function getAllRestaurants() {
  const res = await api.get("/restaurants");
  return res.data;
}

export async function getRestaurantById(id: string) {
  const res = await api.get(`/restaurants/${id}`);
  return res.data;
}

export async function createRestaurant(data: any) {
  const res = await api.post("/restaurants", data);
  return res.data;
}

export async function updateRestaurant(id: string, data: any) {
  const res = await api.patch(`/restaurants/${id}`, data);
  return res.data;
}

export async function deleteRestaurant(id: string) {
  const res = await api.delete(`/restaurants/${id}`);
  return res.data;
}

export async function getNearbyRestaurants(lat: number, lng: number) {
  const res = await api.get("/restaurants/nearby", { params: { lat, lng } });
  return res.data;
}
