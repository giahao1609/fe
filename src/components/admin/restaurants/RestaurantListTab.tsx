"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getAllRestaurants, deleteRestaurant } from "@/lib/api/restaurant";

interface Props {
  onEdit: (restaurant: any) => void;
}

export default function RestaurantListTab({ onEdit }: Props) {
  const [restaurants, setRestaurants] = useState<any[]>([]);

  const fetchRestaurants = async () => {
    const res = await getAllRestaurants();
    setRestaurants(res);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(" Bạn chắc chắn muốn xóa nhà hàng này?")) {
      await deleteRestaurant(id);
      fetchRestaurants();
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-3"> Danh sách nhà hàng</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên quán</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Quận</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Khoảng giá</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {restaurants.length > 0 ? (
            restaurants.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.address}</TableCell>
                <TableCell>{r.district}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell>{r.priceRange}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-yellow-400 text-white hover:bg-yellow-500"
                    onClick={() => onEdit(r)}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(r._id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400">
                Chưa có nhà hàng nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
