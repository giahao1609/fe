"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/layout/Sidebar";
import HeaderBar from "@/components/admin/layout/HeaderBar";
import DashboardContent from "@/components/admin/layout/DashboardContent";

import RestaurantListTab from "@/components/admin/restaurants/RestaurantListTab";
import RestaurantFormTab from "@/components/admin/restaurants/RestaurantFormTab";
import FilesTab from "@/components/admin/chatbot/FilesTab";
import HistoryTab from "@/components/admin/chatbot/HistoryTab";

// 👇 mới:
import BlogListTab from "@/components/admin/blog/BlogListTab";
import BlogFormTab from "@/components/admin/blog/BlogFormTab";
import CommentModerationTab from "@/components/admin/blog/CommentModerationTab";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "restaurants-list"
    | "restaurants-form"
    | "chatbot-files"
    | "chatbot-history"
    | "upload-images"
    // 👇 thêm:
    | "blog-list"
    | "blog-form"
    | "comments"
  >("dashboard");

  const [openDropdown, setOpenDropdown] = useState<
    "restaurants" | "chatbot" | "media" | "blog" | null
  >(null);

  const [editing, setEditing] = useState<any | null>(null);

  return (
    <div className="flex h-screen bg-[#f5f7fb] text-gray-800">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
      />

      <div className="flex flex-col flex-1">
        <HeaderBar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "dashboard" && <DashboardContent />}

          {activeTab === "restaurants-list" && (
            <RestaurantListTab
              onEdit={(restaurant) => {
                setEditing(restaurant);
                setActiveTab("restaurants-form");
              }}
            />
          )}

          {activeTab === "restaurants-form" && (
            <RestaurantFormTab
              editing={editing}
              onDone={() => {
                setEditing(null);
                setActiveTab("restaurants-list");
              }}
            />
          )}

          {/* Chatbot */}
          {activeTab === "chatbot-files" && <FilesTab />}
          {activeTab === "chatbot-history" && <HistoryTab />}

          {/* Blog */}
          {activeTab === "blog-list" && <BlogListTab />}
          {activeTab === "blog-form" && <BlogFormTab />}

          {/* Comments moderation */}
          {activeTab === "comments" && <CommentModerationTab />}
        </main>
      </div>
    </div>
  );
}
