"use client";

import { useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  ChevronUp,
  PlusCircle,
} from "lucide-react";

import RestaurantListTab from "./restaurants/RestaurantListTab";
import RestaurantFormTab from "./restaurants/RestaurantFormTab";
import FilesTab from "./chatbot/FilesTab";
import HistoryTab from "./chatbot/HistoryTab";
import AdminUploadPage from "./upload/page";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboardPage() {
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

  const toggleDropdown = (menu: "restaurants" | "chatbot" | "media") => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <div className="flex h-screen bg-[#f5f7fb] text-gray-800">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-[#0d47a1] text-white flex flex-col shadow-lg">
        <div className="px-6 py-5 text-2xl font-bold tracking-wide border-b border-blue-700">
          Food<span className="text-blue-200 ml-1">Admin</span>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto text-sm">
          <NavButton
            icon={<i className="fa-solid fa-chart-line"></i>}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />

          {/* Restaurants */}
          <DropdownGroup
            label="Restaurants"
            icon={<i className="fa-solid fa-utensils"></i>}
            isOpen={openDropdown === "restaurants"}
            onToggle={() => toggleDropdown("restaurants")}
          >
            <SubNavButton
              label=" Danh sách Nhà hàng"
              active={activeTab === "restaurants-list"}
              onClick={() => setActiveTab("restaurants-list")}
            />
            <SubNavButton
              label=" Thêm / Sửa Nhà hàng"
              active={activeTab === "restaurants-form"}
              onClick={() => setActiveTab("restaurants-form")}
            />
          </DropdownGroup>

          {/* Chatbot */}
          <DropdownGroup
            label="Chatbot AI"
            icon={<i className="fa-solid fa-robot"></i>}
            isOpen={openDropdown === "chatbot"}
            onToggle={() => toggleDropdown("chatbot")}
          >
            <SubNavButton
              label=" File tri thức AI"
              active={activeTab === "chatbot-files"}
              onClick={() => setActiveTab("chatbot-files")}
            />
            <SubNavButton
              label=" Lịch sử trò chuyện"
              active={activeTab === "chatbot-history"}
              onClick={() => setActiveTab("chatbot-history")}
            />
          </DropdownGroup>

          {/* Upload ảnh website */}
          <DropdownGroup
            label="Upload"
            icon={<i className="fa-regular fa-image"></i>}
            isOpen={openDropdown === "media"}
            onToggle={() => toggleDropdown("media")}
          >
            <SubNavButton
              label=" Upload Ảnh Website"
              active={activeTab === "upload-images"}
              onClick={() => setActiveTab("upload-images")}
            />
          </DropdownGroup>

          <NavButton
            icon={<i className="fa-solid fa-gear"></i>}
            label="Cài đặt"
            onClick={() => alert("Chức năng sắp có!")}
          />
        </nav>

        <div className="p-4 text-xs text-blue-100 border-t border-blue-800">
          <p>© 2025 Duralux CRM</p>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-col flex-1">
        {/* HEADER */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-72">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-5">
            <Bell className="text-gray-600 hover:text-blue-600 cursor-pointer transition" />
            <img
              src="https://i.pravatar.cc/150?img=13"
              alt="user avatar"
              width={32}
              height={32}
              className="rounded-full border border-gray-300"
            />
          </div>
        </header>

        {/* ===== CONTENT ===== */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "dashboard" && <DashboardContent />}

          {activeTab === "restaurants-list" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[#0d47a1]">
                   Danh sách Nhà hàng
                </h1>
                <button
                  onClick={() => setActiveTab("restaurants-form")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow transition"
                >
                  <PlusCircle size={18} />
                  Thêm Nhà hàng
                </button>
              </div>
              <RestaurantListTab
                onEdit={() => setActiveTab("restaurants-form")}
              />
            </div>
          )}

          {activeTab === "restaurants-form" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-[#0d47a1]">
                ➕ Thêm / Sửa Nhà hàng
              </h1>
              <RestaurantFormTab
                onDone={() => setActiveTab("restaurants-list")}
              />
            </div>
          )}

          {activeTab === "chatbot-files" && (
            <div>
              <h1 className="text-2xl font-bold text-[#0d47a1] mb-4">
                 Quản lý File tri thức
              </h1>
              <FilesTab />
            </div>
          )}

          {activeTab === "chatbot-history" && (
            <div>
              <h1 className="text-2xl font-bold text-[#0d47a1] mb-4">
                 Lịch sử Chatbot
              </h1>
              <HistoryTab />
            </div>
          )}

          {activeTab === "upload-images" && (
            <div>
              <h1 className="text-2xl font-bold text-[#0d47a1] mb-4">
                 Upload & Quản lý Ảnh Website
              </h1>
              <AdminUploadPage />
            </div>
          )}
        </main>
      </div>
    </div>
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

/* ===== DASHBOARD CONTENT ===== */
function DashboardContent() {
  const reviewData = [
    { date: "T2", reviews: 8 },
    { date: "T3", reviews: 12 },
    { date: "T4", reviews: 5 },
    { date: "T5", reviews: 15 },
    { date: "T6", reviews: 10 },
    { date: "T7", reviews: 18 },
    { date: "CN", reviews: 9 },
  ];

  const chatbotData = [
    { date: "T2", chats: 22 },
    { date: "T3", chats: 18 },
    { date: "T4", chats: 30 },
    { date: "T5", chats: 25 },
    { date: "T6", chats: 35 },
    { date: "T7", chats: 40 },
    { date: "CN", chats: 28 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[#0d47a1] tracking-tight">
        Dashboard Overview
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SoftCard
          icon={<i className="fa-solid fa-utensils"></i>}
          title="Tổng số Nhà hàng"
          value="124"
          color="from-blue-400 to-blue-600"
        />
        <SoftCard
          icon={<i className="fa-solid fa-comments"></i>}
          title="Tổng số Review"
          value="847"
          color="from-indigo-400 to-indigo-600"
        />
        <SoftCard
          icon={<i className="fa-solid fa-user"></i>}
          title="Tổng số User"
          value="356"
          color="from-emerald-400 to-emerald-600"
        />
        <SoftCard
          icon={<i className="fa-solid fa-robot"></i>}
          title="File Chatbot"
          value="22"
          color="from-cyan-400 to-cyan-600"
        />
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-8">
        <ChartCard title="📈 Lượt đánh giá theo thời gian">
          <LineChart data={reviewData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}
            />
            <Line
              type="monotone"
              dataKey="reviews"
              stroke="#0d47a1"
              strokeWidth={3}
              dot={{ r: 4, fill: "#0d47a1" }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="🤖 Lượt tương tác Chatbot">
          <AreaChart data={chatbotData}>
            <defs>
              <linearGradient id="chatColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00b894" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00b894" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}
            />
            <Area
              type="monotone"
              dataKey="chats"
              stroke="#00b894"
              fillOpacity={1}
              fill="url(#chatColor)"
            />
          </AreaChart>
        </ChartCard>
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */
function SoftCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition-all transform hover:scale-[1.02] border border-gray-100">
      <div className="flex items-center gap-4">
        <div
          className={`text-3xl p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}
        >
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3
            className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <h2 className="font-semibold text-[#0d47a1] mb-3 text-lg">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
