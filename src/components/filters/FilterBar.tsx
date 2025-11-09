"use client";
import { useState } from "react";

export default function FilterBar({
  onFilter,
}: {
  onFilter: (filter: { price: string; district: string;dish: string  }) => void;
}) {
  const [price, setPrice] = useState("");
  const [district, setDistrict] = useState("");
  const [dish, setDish] = useState("");

  const handleFilter = () => {
    onFilter({ price, district, dish });
  };

  return (
    <div className="bg-white shadow p-4 rounded mb-6 flex flex-wrap gap-4">
      {/* Lọc theo giá */}
      <div>
        <label className="text-sm font-medium mr-2">Giá:</label>
        <select
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">-- Tất cả --</option>
          <option value="low">Dưới 50.000đ</option>
          <option value="mid">50.000đ - 100.000đ</option>
          <option value="high">Trên 100.000đ</option>
        </select>
      </div>

      {/* Lọc theo quận */}
      <div>
        <label className="text-sm font-medium mr-2">Quận:</label>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
        <option value="">-- Tất cả --</option>
        <option value="Q.1">Quận 1</option>
        <option value="Q.2">Quận 2</option>
        <option value="Q.3">Quận 3</option>
        <option value="Q.4">Quận 4</option>
        <option value="Q.5">Quận 5</option>
        <option value="Q.6">Quận 6</option>
        <option value="Q.7">Quận 7</option>
        <option value="Q.8">Quận 8</option>
        <option value="Q.9">Quận 9</option>
        <option value="Q.10">Quận 10</option>
        <option value="Q.11">Quận 11</option>
        <option value="Bình Thạnh">Bình Thạnh</option>
        <option value="Phú Nhuận">Phú Nhuận</option>
        <option value="Tân Bình">Tân Bình</option>
        <option value="Thủ Đức">Thủ Đức</option>

        </select>
      </div>
      <div>
        <label className="text-sm font-medium mr-2">Món:</label>
        <select 
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
        <option value="">-- Tất cả --</option>
        <option value="Bún bò">Bún bò</option>
        <option value="Phở gà">Phở gà</option>
        <option value="Hủ tiếu">Hủ tiếu</option>
        <option value="Bánh canh">Bánh canh</option>
        <option value="Bún đậu">Bún đậu</option>
        <option value="Trà sữa">Trà sữa</option>
        <option value="Bún riêu">Bún riêu</option>
        </select>
      </div>

      {/* Nút áp dụng */}
      <button
        onClick={handleFilter}
        className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
      >
        Áp dụng
      </button>
    </div>
  );
}
