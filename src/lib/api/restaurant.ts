// src/lib/api/restaurant.ts
"use client";

import {
  MOCK_RESTAURANTS,
  type Restaurant,
} from "@/data/mock";

const LS_KEY = "fm_restaurants";

function load(): Restaurant[] {
  if (typeof window === "undefined") return MOCK_RESTAURANTS;
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    localStorage.setItem(LS_KEY, JSON.stringify(MOCK_RESTAURANTS));
    return [...MOCK_RESTAURANTS];
    }
  try { return JSON.parse(raw) as Restaurant[]; } catch {
    return [...MOCK_RESTAURANTS];
  }
}

function save(list: Restaurant[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

const genId = () =>
  "r_" + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);

export async function getAllRestaurants(): Promise<Restaurant[]> {
  return load();
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  return load().find(r => r._id === id) ?? null;
}

export async function createRestaurant(dto: Partial<Restaurant>): Promise<Restaurant> {
  const list = load();
  const item: Restaurant = {
    _id: genId(),
    name: dto.name ?? "",
    address: dto.address ?? "",
    district: dto.district ?? "",
    category: dto.category ?? "",
    priceRange: dto.priceRange ?? "",
    latitude: Number(dto.latitude ?? 0),
    longitude: Number(dto.longitude ?? 0),
    description: dto.description ?? "",
    directions: dto.directions ?? "",
    scheduleText: dto.scheduleText ?? "",
    banner: [],
    gallery: [],
    menuImages: [],
  };
  list.unshift(item);
  save(list);
  return item;
}

export async function updateRestaurant(id: string, dto: Partial<Restaurant>): Promise<Restaurant> {
  const list = load();
  const idx = list.findIndex(r => r._id === id);
  if (idx === -1) throw new Error("Not found");
  list[idx] = { ...list[idx], ...dto, _id: id };
  save(list);
  return list[idx];
}

export async function deleteRestaurant(id: string): Promise<void> {
  const list = load().filter(r => r._id !== id);
  save(list);
}
