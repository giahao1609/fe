"use client";

import CommentsTab from "@/components/owner/CommentsTab";
import MenuItemsDemoTab from "@/components/owner/menu/MenuItemsDemoTab";
import OverviewTab from "@/components/owner/OverviewTab";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import PostsTab from "@/components/owner/PostsTab";
import RestaurantsTab from "@/components/owner/RestaurantsTab";
import StoreSettings from "@/components/owner/StoreSettings";
import { useEffect, useState } from "react";

export type OwnerTab = "overview" | "store" | "comments" | "posts" | "restaurants" |"menu";

export default function OwnerPage() {
  const [tab, setTab] = useState<OwnerTab>("overview");

  useEffect(() => {
  }, []);

  return (
    <div className="flex h-screen bg-[#f5f7fb] text-gray-800">
      <OwnerSidebar active={tab} onChange={setTab} />
      <main className="flex-1 overflow-y-auto p-6">
        {tab === "overview" && <OverviewTab />}
        {tab === "store" && <StoreSettings />}
        {tab === "comments" && <CommentsTab />}
        {tab === "posts" && <PostsTab />}
        {tab === "restaurants" && <RestaurantsTab />}
          {tab === "menu" && <MenuItemsDemoTab />}
      </main>
    </div>
  );
}
