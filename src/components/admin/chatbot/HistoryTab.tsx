"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {getHistory,deleteHistory } from "@/lib/api/chatbot";

export default function HistoryTab() {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    const res = await getHistory();
    setHistory(res || []);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteHistory(id);
    fetchHistory();
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Ngày bắt đầu</TableHead>
            <TableHead>Số tin nhắn</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.length ? (
            history.map((h: any) => (
              <TableRow key={h.id}>
                <TableCell>{h.user || "N/A"}</TableCell>
                <TableCell>{h.createdAt}</TableCell>
                <TableCell>{h.messageCount}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(h.id)}>
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-400">
                Chưa có lịch sử trò chuyện
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
