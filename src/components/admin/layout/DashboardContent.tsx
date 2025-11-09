"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, ResponsiveContainer } from "recharts";
import SoftCard from "./SoftCard";
import ChartCard from "./ChartCard";

interface Stats {
  restaurants: number;
  reviews: number;
  users: number;
  files: number;
  reviewChart: { date: string; reviews: number }[];
  chatbotChart: { date: string; chats: number }[];
}

export default function DashboardContent() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/stats`);
        setData(res.data);
      } catch (err) {
        console.error(" Lỗi khi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-gray-500">Đang tải thống kê...</p>;
  if (!data) return <p className="text-red-500">Không thể tải dữ liệu dashboard.</p>;

  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[#0d47a1] tracking-tight">Dashboard Overview</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SoftCard icon={<i className="fa-solid fa-utensils"></i>} title="Tổng số Nhà hàng" value={data.restaurants.toString()} color="from-blue-400 to-blue-600" />
        <SoftCard icon={<i className="fa-solid fa-comments"></i>} title="Tổng số Review" value={data.reviews.toString()} color="from-indigo-400 to-indigo-600" />
        <SoftCard icon={<i className="fa-solid fa-user"></i>} title="Tổng số User" value={data.users.toString()} color="from-emerald-400 to-emerald-600" />
        <SoftCard icon={<i className="fa-solid fa-robot"></i>} title="File Chatbot" value={data.files.toString()} color="from-cyan-400 to-cyan-600" />
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-8">
        <ChartCard title="📈 Lượt đánh giá theo thời gian">
          <LineChart data={data.reviewChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb" }} />
            <Line type="monotone" dataKey="reviews" stroke="#0d47a1" strokeWidth={3} dot={{ r: 4, fill: "#0d47a1" }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="🤖 Lượt tương tác Chatbot">
          <AreaChart data={data.chatbotChart}>
            <defs>
              <linearGradient id="chatColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00b894" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00b894" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb" }} />
            <Area type="monotone" dataKey="chats" stroke="#00b894" fillOpacity={1} fill="url(#chatColor)" />
          </AreaChart>
        </ChartCard>
      </div>
    </div>
  );
}
