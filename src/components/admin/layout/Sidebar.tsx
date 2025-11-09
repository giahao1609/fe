"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

type TabType =
  | "dashboard"
  | "restaurants-list"
  | "restaurants-form"
  | "chatbot-files"
  | "chatbot-history"
  | "upload-images";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: Dispatch<SetStateAction<TabType>>;
  openDropdown: "restaurants" | "chatbot" | "media" | null;
  setOpenDropdown: Dispatch<SetStateAction<"restaurants" | "chatbot" | "media" | null>>;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  openDropdown,
  setOpenDropdown,
}: SidebarProps) {
  const toggleDropdown = (menu: "restaurants" | "chatbot" | "media") => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <aside className="w-64 bg-[#0d47a1] text-white flex flex-col shadow-lg">
      {/* LOGO */}
      <div className="px-6 py-5 text-2xl font-bold tracking-wide border-b border-blue-700">
        Duralux<span className="text-blue-200 ml-1">Admin</span>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto text-sm">
        {/* DASHBOARD */}
        <NavButton
          icon={<i className="fa-solid fa-chart-line"></i>}
          label="Dashboard"
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
        />

        {/* RESTAURANTS */}
        <DropdownGroup
          label="Restaurants"
          icon={<i className="fa-solid fa-utensils"></i>}
          isOpen={openDropdown === "restaurants"}
          onToggle={() => toggleDropdown("restaurants")}
        >
          <SubNavButton
            label="📋 Danh sách Nhà hàng"
            active={activeTab === "restaurants-list"}
            onClick={() => setActiveTab("restaurants-list")}
          />
          <SubNavButton
            label="➕ Thêm / Sửa Nhà hàng"
            active={activeTab === "restaurants-form"}
            onClick={() => setActiveTab("restaurants-form")}
          />
        </DropdownGroup>

        {/* CHATBOT */}
        <DropdownGroup
          label="Chatbot AI"
          icon={<i className="fa-solid fa-robot"></i>}
          isOpen={openDropdown === "chatbot"}
          onToggle={() => toggleDropdown("chatbot")}
        >
          <SubNavButton
            label="📁 File tri thức AI"
            active={activeTab === "chatbot-files"}
            onClick={() => setActiveTab("chatbot-files")}
          />
          <SubNavButton
            label="💬 Lịch sử trò chuyện"
            active={activeTab === "chatbot-history"}
            onClick={() => setActiveTab("chatbot-history")}
          />
        </DropdownGroup>

        {/* UPLOAD MEDIA */}
        <DropdownGroup
          label="Upload"
          icon={<i className="fa-regular fa-image"></i>}
          isOpen={openDropdown === "media"}
          onToggle={() => toggleDropdown("media")}
        >
          <SubNavButton
            label="📸 Upload Ảnh Website"
            active={activeTab === "upload-images"}
            onClick={() => setActiveTab("upload-images")}
          />
        </DropdownGroup>

        {/* SETTINGS */}
        <NavButton
          icon={<i className="fa-solid fa-gear"></i>}
          label="Cài đặt"
          onClick={() => alert("⚙️ Chức năng này đang được phát triển!")}
        />
      </nav>

      {/* FOOTER */}
      <div className="p-4 text-xs text-blue-100 border-t border-blue-800">
        © 2025 Duralux CRM
      </div>
    </aside>
  );
}

/* ==== COMPONENTS ==== */
function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-left transition-all ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "hover:bg-blue-600 text-blue-100 hover:text-white"
      }`}
    >
      <span className="w-5 text-center">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function DropdownGroup({
  icon,
  label,
  isOpen,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-4 py-2.5 rounded-md font-medium transition-all ${
          isOpen
            ? "bg-blue-600 text-white shadow-md"
            : "hover:bg-blue-600 text-blue-100 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-5 text-center">{icon}</span>
          <span>{label}</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && <div className="ml-9 mt-1 space-y-1 animate-fadeIn">{children}</div>}
    </div>
  );
}

function SubNavButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition ${
        active
          ? "bg-blue-500 text-white shadow-sm"
          : "hover:bg-blue-500 text-blue-100"
      }`}
    >
      {label}
    </button>
  );
}
