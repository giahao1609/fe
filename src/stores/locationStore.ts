import { create } from "zustand";

type Mode = "prompt" | "gps" | "manual" | "none";

type S = {
  mode: Mode;
  lat: number | null;
  lng: number | null;
  address: string;
  asking: boolean;
  watchId: number | null;
  setMode: (m: Mode) => void;
  setGPS: (lat: number, lng: number) => void;
  setManual: (addr: string, lat?: number, lng?: number) => void;
  resetThisVisit: () => void;
  autoDetect: () => void;
  watchGPS: () => number | null;
  stopWatchGPS: () => void;
};

export const useLocationStore = create<S>((set, get) => ({
  mode: "prompt",
  lat: null,
  lng: null,
  address: "",
  asking: true,
  watchId: null,

  setMode: (mode) => set({ mode }),
  setGPS: (lat, lng) => set({ lat, lng, mode: "gps", asking: false }),
  setManual: (address, lat, lng) =>
    set({
      address,
      lat: lat ?? null,
      lng: lng ?? null,
      mode: "manual",
      asking: false,
    }),
  resetThisVisit: () =>
    set({
      mode: "prompt",
      lat: null,
      lng: null,
      address: "",
      asking: true,
      watchId: null,
    }),

  /** 📍 Lấy 1 lần duy nhất */
  autoDetect: () => {
    if (!navigator.geolocation) {
      console.warn("⚠️ Trình duyệt không hỗ trợ Geolocation");
      set({ mode: "none", asking: false });
      return;
    }

    setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log("📍 AutoDetect:", latitude, longitude);
          set({
            lat: latitude,
            lng: longitude,
            mode: "gps",
            asking: false,
          });
        },
        (err) => {
          console.warn("❌ Lấy vị trí thất bại:", err);
          set({ mode: "manual", asking: false });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }, 500);
  },

  /** 🚀 Theo dõi realtime vị trí */
  watchGPS: () => {
    if (!navigator.geolocation) {
      console.warn("⚠️ Trình duyệt không hỗ trợ GPS realtime");
      return null;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("📡 GPS cập nhật:", latitude, longitude);
        set({
          lat: latitude,
          lng: longitude,
          mode: "gps",
          asking: false,
        });
      },
      (err) => {
        console.warn("❌ watchGPS lỗi:", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    set({ watchId: id });
    return id;
  },

  /** 🧹 Dừng theo dõi */
  stopWatchGPS: () => {
    const { watchId } = get();
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      set({ watchId: null });
      console.log("🧹 Dừng theo dõi GPS");
    }
  },
}));
