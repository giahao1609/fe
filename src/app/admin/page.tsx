"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/layout/Sidebar";
import HeaderBar from "@/components/admin/layout/HeaderBar";
import DashboardContent from "@/components/admin/layout/DashboardContent";

import RestaurantListTab from "@/components/admin/restaurants/RestaurantListTab";
import RestaurantFormTab from "@/components/admin/restaurants/RestaurantFormTab";
import FilesTab from "@/components/admin/chatbot/FilesTab";
import HistoryTab from "@/components/admin/chatbot/HistoryTab";
import AdminUploadPage from "@/components/admin/upload/page";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "restaurants-list"
    | "restaurants-form"
    | "chatbot-files"
    | "chatbot-history"
    | "upload-images"
  >("dashboard");

  const [openDropdown, setOpenDropdown] = useState<
    "restaurants" | "chatbot" | "media" | null
  >(null);

  //  Thêm state lưu quán đang sửa
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

          {/*  Danh sách quán */}
          {activeTab === "restaurants-list" && (
            <RestaurantListTab
              onEdit={(restaurant) => {
                console.log(" Click sửa:", restaurant);
                setEditing(restaurant); // lưu data quán đang sửa
                setActiveTab("restaurants-form"); // chuyển sang tab form
              }}
            />
          )}

          {/*  Form thêm/sửa quán */}
          {activeTab === "restaurants-form" && (
            <RestaurantFormTab
              editing={editing} 
              onDone={() => {
                console.log("Lưu thành công quay lại danh sách");
                setEditing(null);
                setActiveTab("restaurants-list");
              }}
            />
          )}

          {activeTab === "chatbot-files" && <FilesTab />}
          {activeTab === "chatbot-history" && <HistoryTab />}
          {activeTab === "upload-images" && <AdminUploadPage />}
        </main>
      </div>
    </div>
  );
}
