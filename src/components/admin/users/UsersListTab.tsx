"use client";

import { useEffect, useState } from "react";
import {
  UserService,
  UserItem,
  UserRole,
} from "@/services/user.service";

const BUILTIN_ROLES: UserRole[] = ["customer", "owner", "admin"];

export default function UsersListTab() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("");

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const loadUsers = async (p = 1) => {
    setLoading(true);
    try {
      const res = await UserService.listUsers({
        page: p,
        limit,
        keyword: search || undefined,
        role: selectedRoleFilter || undefined,
      });
      setUsers(res.items);
      setPage(res.page);
      setTotalPages(res.pages);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1);
  };

  const handlePrevPage = () => {
    if (page > 1) loadUsers(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) loadUsers(page + 1);
  };

  const openEditRoles = (user: UserItem) => {
    setEditingUser(user);
    setEditRoles(user.roles || []);
  };

  const toggleRole = (role: UserRole) => {
    setEditRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role],
    );
  };

  const saveUserRoles = async () => {
    if (!editingUser) return;
    setSavingRoles(true);
    try {
      const updated = await UserService.updateRolesByEmail(
        editingUser.email,
        editRoles,
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u)),
      );
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRoles(false);
    }
  };

  const handleGrantOwner = async (user: UserItem) => {
    try {
      const updated = await UserService.addOwnerRole(user.email, user.roles);
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN");
  };

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Xem danh sách user, gán quyền <code>owner</code> hoặc chỉnh sửa
            roles chi tiết.
          </p>
        </div>
        <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 shadow-sm">
          Tổng số user:{" "}
          <span className="font-semibold text-blue-900">{total}</span>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo tên / email…"
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              🔍
            </span>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Lọc theo role:</span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả</option>
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Roles
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Đang tải danh sách người dùng…
                  </td>
                </tr>
              )}

              {!loading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Không có user nào.
                  </td>
                </tr>
              )}

              {!loading &&
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {u.displayName || "—"}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          ID: {u._id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="text-sm text-gray-800">
                        {u.email || "—"}
                      </div>
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        Email verified:{" "}
                        <span
                          className={
                            u.emailVerified ? "text-emerald-600" : "text-amber-600"
                          }
                        >
                          {u.emailVerified ? "Yes" : "No"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {(u.roles || []).map((r) => (
                          <span
                            key={r}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                          >
                            {r}
                          </span>
                        ))}
                        {(!u.roles || u.roles.length === 0) && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col items-end gap-2 text-xs sm:flex-row sm:items-center sm:justify-end">
                        <button
                          onClick={() => handleGrantOwner(u)}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          Cấp quyền Owner
                        </button>
                        <button
                          onClick={() => openEditRoles(u)}
                          className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700"
                        >
                          Sửa roles
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-600">
          <div>
            Trang{" "}
            <span className="font-semibold text-gray-900">{page}</span> /{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                page <= 1
                  ? "cursor-not-allowed border-gray-200 text-gray-300"
                  : "border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              ← Trước
            </button>
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                page >= totalPages
                  ? "cursor-not-allowed border-gray-200 text-gray-300"
                  : "border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              Sau →
            </button>
          </div>
        </div>
      </div>

      {/* Modal edit roles */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Chỉnh sửa roles
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {editingUser.displayName || editingUser.email}
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                Chọn các quyền áp dụng cho user. Thường dùng:
                <ul className="mt-1 list-disc pl-4">
                  <li>
                    <code>customer</code> – user thường
                  </li>
                  <li>
                    <code>owner</code> – chủ quán / có thể quản lý nhà hàng
                  </li>
                  <li>
                    <code>admin</code> – quản trị hệ thống
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                {BUILTIN_ROLES.map((role) => (
                  <label
                    key={role}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={editRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    <span className="text-sm text-gray-800">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-xl border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                disabled={savingRoles}
              >
                Hủy
              </button>
              <button
                onClick={saveUserRoles}
                disabled={savingRoles}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold text-white ${
                  savingRoles
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {savingRoles ? "Đang lưu…" : "Lưu roles"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
