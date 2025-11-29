"use client";

import { useState } from "react";
import Sidebar, { TabType } from "@/components/admin/layout/Sidebar";
import HeaderBar from "@/components/admin/layout/HeaderBar";
import DashboardContent from "@/components/admin/layout/DashboardContent";

import RestaurantListTab from "@/components/admin/restaurants/RestaurantListTab";
import RestaurantFormTab from "@/components/admin/restaurants/RestaurantFormTab";
import FilesTab from "@/components/admin/chatbot/FilesTab";
import HistoryTab from "@/components/admin/chatbot/HistoryTab";

import BlogListTab from "@/components/admin/blog/BlogListTab";
import BlogFormTab from "@/components/admin/blog/BlogFormTab";
import CommentModerationTab from "@/components/admin/blog/CommentModerationTab";
import UsersListTab from "@/components/admin/users/UsersListTab";

import CategoriesListTab from "@/components/admin/categories/CategoriesListTab";
import CategoryFormTab from "@/components/admin/categories/CategoryFormTab";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const [openDropdown, setOpenDropdown] = useState<
    "restaurants" | "chatbot" | "media" | "blog" | "users" | "categories" | null
  >(null);

  const [editingRestaurant, setEditingRestaurant] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

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

          {/* RESTAURANTS */}
          {activeTab === "restaurants-list" && (
            <RestaurantListTab
              onEdit={(restaurant) => {
                setEditingRestaurant(restaurant);
                setActiveTab("restaurants-form");
              }}
            />
          )}

          {activeTab === "restaurants-form" && (
            <RestaurantFormTab
              editing={editingRestaurant}
              onDone={() => {
                setEditingRestaurant(null);
                setActiveTab("restaurants-list");
              }}
            />
          )}

          {/* CATEGORIES */}
          {activeTab === "categories-list" && (
            <CategoriesListTab
              onEdit={(category) => {
                setEditingCategory(category);
                setActiveTab("categories-form");
              }}
            />
          )}

          {activeTab === "categories-form" && (
            <CategoryFormTab
              editing={editingCategory}
              onDone={() => {
                setEditingCategory(null);
                setActiveTab("categories-list");
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

          {/* User management */}
          {activeTab === "users-list" && <UsersListTab />}
        </main>
      </div>
    </div>
  );
}
