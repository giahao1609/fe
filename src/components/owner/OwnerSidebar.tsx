"use client";

import { OwnerTab } from "@/app/dashboard/owner/page";
import React from "react";

export default function OwnerSidebar({
  active,
  onChange,
}: {
  active: OwnerTab;
  onChange: (t: OwnerTab) => void;
}) {
  const Item = ({
    id,
    label,
    icon,
  }: {
    id: OwnerTab;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={() => onChange(id)}
      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-left transition-all ${
        active === id
          ? "bg-blue-600 text-white shadow-md"
          : "hover:bg-blue-600 text-blue-100 hover:text-white"
      }`}
    >
      <span className="w-5 text-center">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <aside className="w-64 bg-[#0d47a1] text-white flex flex-col shadow-lg">
      <div className="px-6 py-5 text-2xl font-bold tracking-wide border-b border-blue-700">
        Owner<span className="text-blue-200 ml-1">Dashboard</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto text-sm">
        <Item
          id="overview"
          label="Tổng quan"
          icon={<i className="fa-solid fa-chart-line" />}
        />
        <Item
          id="store"
          label="Cửa hàng"
          icon={<i className="fa-solid fa-store" />}
        />
        <Item
          id="comments"
          label="Bình luận"
          icon={<i className="fa-regular fa-comments" />}
        />
        {/* <Item
          id="posts"
          label="Bài viết liên quan"
          icon={<i className="fa-regular fa-newspaper" />}
        /> */}
        {/* <Item
          id="restaurants"
          label="Đăng quán / Nhà hàng"
          icon={<i className="fa-solid fa-utensils" />}
        /> */}
        <Item
          id="menu"
          label="Menu"
          icon={<i className="fa-solid fa-utensils" />}
        />
        {/* <Item
          id="blogs"
          label="Blog của tôi"
          icon={<i className="fa-solid fa-blog" />}
        /> */}

        <Item
          id="order"
          label="Order"
          icon={<i className="fa-solid fa-receipt" />}
        />
      </nav>

      <div className="p-4 text-xs text-blue-100 border-t border-blue-800">
        © 2025
      </div>
    </aside>
  );
}
