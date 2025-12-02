// src/services/notify.service.ts
"use client";

import { toast } from "sonner";

const isBrowser = typeof window !== "undefined";

export const NotifyService = {
  success(message: string, options?: any) {
    if (!isBrowser) return;
    const t: any = toast;
    if (typeof t.success === "function") {
      t.success(message, options);
    } else {
      toast(message, options);
    }
  },

  error(message: string, options?: any) {
    if (!isBrowser) return;
    const t: any = toast;
    if (typeof t.error === "function") {
      t.error(message, options);
    } else {
      toast(message, { ...options, className: "bg-red-600 text-white" });
    }
  },

  warn(message: string, options?: any) {
    if (!isBrowser) return;
    const t: any = toast;
    if (typeof t.warning === "function") {
      t.warning(message, options);
    } else if (typeof t.warn === "function") {
      t.warn(message, options);
    } else {
      toast(message, options);
    }
  },

  info(message: string, options?: any) {
    if (!isBrowser) return;
    const t: any = toast;
    if (typeof t.info === "function") {
      t.info(message, options);
    } else {
      toast(message, options);
    }
  },
};
