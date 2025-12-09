"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

export type TabType =
  | "dashboard"
  | "restaurants-list"
  | "restaurants-form"
  | "chatbot-files"
  | "chatbot-history"
  | "upload-images"
  | "blog-list"
  | "blog-form"
  | "comments"
  | "users-list"
  // 👇 thêm 2 tab mới cho Category
  | "categories-list"
  | "categories-form";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: Dispatch<SetStateAction<TabType>>;
  openDropdown:
    | "restaurants"
    | "chatbot"
    | "media"
    | "blog"
    | "users"
    | "categories"
    | null;
  setOpenDropdown: Dispatch<
    SetStateAction<
      | "restaurants"
      | "chatbot"
      | "media"
      | "blog"
      | "users"
      | "categories"
      | null
    >
  >;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  openDropdown,
  setOpenDropdown,
}: SidebarProps) {
  const toggleDropdown = (
    menu:
      | "restaurants"
      | "chatbot"
      | "media"
      | "blog"
      | "users"
      | "categories"
  ) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <aside className="w-64 bg-[#0d47a1] text-white flex flex-col shadow-lg">
      <div className="px-6 py-5 text-2xl font-bold tracking-wide border-b border-blue-700">
        Food<span className="text-blue-200 ml-1">Admin</span>
      </div>

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
          label="Nhà hàng"
          icon={<i className="fa-solid fa-utensils"></i>}
          isOpen={openDropdown === "restaurants"}
          onToggle={() => toggleDropdown("restaurants")}
        >
          <SubNavButton
            label="📋 Danh sách Nhà hàng"
            active={activeTab === "restaurants-list"}
            onClick={() => setActiveTab("restaurants-list")}
          />
          {/* <SubNavButton
            label="➕ Thêm / Sửa Nhà hàng"
            active={activeTab === "restaurants-form"}
            onClick={() => setActiveTab("restaurants-form")}
          /> */}
        </DropdownGroup>

        <DropdownGroup
          label="Danh mục món"
          icon={<i className="fa-solid fa-layer-group"></i>}
          isOpen={openDropdown === "categories"}
          onToggle={() => toggleDropdown("categories")}
        >
          <SubNavButton
            label="📚 Danh sách Category"
            active={activeTab === "categories-list"}
            onClick={() => setActiveTab("categories-list")}
          />
          <SubNavButton
            label="➕ Thêm / Sửa Category"
            active={activeTab === "categories-form"}
            onClick={() => setActiveTab("categories-form")}
          />
        </DropdownGroup>

        {/* USERS */}
        <DropdownGroup
          label="Người dùng"
          icon={<i className="fa-regular fa-user"></i>}
          isOpen={openDropdown === "users"}
          onToggle={() => toggleDropdown("users")}
        >
          <SubNavButton
            label="👥 Danh sách người dùng"
            active={activeTab === "users-list"}
            onClick={() => setActiveTab("users-list")}
          />
        </DropdownGroup>

        {/* BLOG */}
        <DropdownGroup
          label="Blog"
          icon={<i className="fa-regular fa-newspaper"></i>}
          isOpen={openDropdown === "blog"}
          onToggle={() => toggleDropdown("blog")}
        >
          <SubNavButton
            label="📝 Danh sách bài viết"
            active={activeTab === "blog-list"}
            onClick={() => setActiveTab("blog-list")}
          />
          {/* <SubNavButton
            label="➕ Thêm / Sửa bài viết"
            active={activeTab === "blog-form"}
            onClick={() => setActiveTab("blog-form")}
          /> */}
        </DropdownGroup>

        {/* COMMENTS moderation */}
        <NavButton
          icon={<i className="fa-regular fa-comments"></i>}
          label="Bình luận"
          active={activeTab === "comments"}
          onClick={() => setActiveTab("comments")}
        />

        {/* CHATBOT */}
        {/* <DropdownGroup
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
        </DropdownGroup> */}

        {/* UPLOAD MEDIA */}
        {/* <DropdownGroup
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
        </DropdownGroup> */}

        {/* SETTINGS */}
        {/* <NavButton
          icon={<i className="fa-solid fa-gear"></i>}
          label="Cài đặt"
          onClick={() => alert("⚙️ Chức năng này đang được phát triển!")}
        /> */}
      </nav>

      <div className="p-4 text-xs text-blue-100 border-t border-blue-800">
        © 2025
      </div>
    </aside>
  );
}

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

      {isOpen && (
        <div className="ml-9 mt-1 space-y-1 animate-fadeIn">{children}</div>
      )}
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
