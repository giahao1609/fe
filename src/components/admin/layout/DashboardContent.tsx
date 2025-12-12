"use client";

import { useEffect, useState } from "react";
import SoftCard from "./SoftCard";
import ChartCard from "./ChartCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { getAllRestaurants } from "@/lib/api/restaurant";
import { getFiles } from "@/lib/api/chatbot";

type Pt = { date: string; reviews?: number; chats?: number };
interface Stats {
  restaurants: number;
  reviews: number;
  users: number;
  files: number;
  reviewChart: Pt[];
  chatbotChart: Pt[];
}

const lastNDays = (n: number) => {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

export default function DashboardContent() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const restaurants = await getAllRestaurants();
      const files = await getFiles();

      // Fake số liệu
      const users = 12;
      const reviews = Math.max(
        35,
        Math.round(restaurants.length * 12 + Math.random() * 40)
      );

      // Chart 14 ngày
      const days = lastNDays(14);
      const reviewChart = days.map((d) => ({
        date: d,
        reviews: Math.max(0, Math.round(5 + Math.random() * 20)),
      }));
      const chatbotChart = days.map((d) => ({
        date: d,
        chats: Math.max(0, Math.round(10 + Math.random() * 30)),
      }));

      setData({
        restaurants: restaurants.length,
        reviews,
        users,
        files: files.length,
        reviewChart,
        chatbotChart,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-gray-500">Đang tải thống kê...</p>;
  if (!data)
    return <p className="text-red-500">Không thể tải dữ liệu dashboard.</p>;

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
          value={data.restaurants.toString()}
          color="from-blue-400 to-blue-600"
        />
        <SoftCard
          icon={<i className="fa-solid fa-comments"></i>}
          title="Tổng số Review"
          value={data.reviews.toString()}
          color="from-indigo-400 to-indigo-600"
        />
        <SoftCard
          icon={<i className="fa-solid fa-user"></i>}
          title="Tổng số User"
          value={data.users.toString()}
          color="from-emerald-400 to-emerald-600"
        />
        <SoftCard
          icon={<i className="fa-solid fa-blog"></i>}
          title="Blog"
          value="8"
          color="from-cyan-400 to-cyan-600"
        />{" "}
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* <ChartCard title="📈 Lượt đánh giá theo thời gian">
          <LineChart data={data.reviewChart} width={500} height={260}>
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
          <AreaChart data={data.chatbotChart} width={500} height={260}>
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
        </ChartCard> */}
      </div>
    </div>
  );
}
