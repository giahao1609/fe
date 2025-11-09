import { Bell, Search } from "lucide-react";

export default function HeaderBar() {
  return (
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
  );
}
