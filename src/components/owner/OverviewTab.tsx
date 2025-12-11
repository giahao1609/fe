// src/components/owner/OverviewTab.tsx
"use client";

import { useEffect, useState } from "react";
import { getOwnerDashboard } from "@/lib/api/owner";
import type { OwnerDashboardData } from "@/types/owner";
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

export default function OverviewTab() {
  const [db, setDb] = useState<OwnerDashboardData | null>(null);

  useEffect(() => {
    getOwnerDashboard().then(setDb);
  }, []);

  if (!db) return <p className="text-gray-500">Đang tải…</p>;

  const { snapshot, series14d } = db;

  const Card = ({
    title,
    value,
    desc,
  }: {
    title: string;
    value: string;
    desc: string;
  }) => (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      <div className="text-xs text-gray-400 mt-2">{desc}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tổng quan</h1>

      {/* Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Tổng bình luận" value={`${snapshot.totalComments}`} desc="Bao gồm đã duyệt & chờ duyệt" />
        <Card title="Đang chờ duyệt" value={`${snapshot.pendingComments}`} desc="Bình luận chưa công khai" />
        <Card title="Điểm trung bình" value={`${snapshot.avgRating.toFixed(1)}`} desc="Từ bình luận đã duyệt" />
        <Card title="Bài viết liên quan" value={`${snapshot.totalPosts}`} desc="Bài blog về cửa hàng" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bình luận 14 ngày */}
        {/* <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="text-sm font-semibold mb-3">📈 Bình luận theo ngày (14d)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series14d}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="comments" stroke="#0d47a1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
          <div className="text-sm font-semibold mb-3">⭐ Điểm trung bình theo ngày (14d)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series14d}>
                <defs>
                  <linearGradient id="ratingColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00b894" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00b894" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} allowDecimals tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="ratingAvg" stroke="#00b894" fillOpacity={1} fill="url(#ratingColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>

      
    </div>
  );
}
