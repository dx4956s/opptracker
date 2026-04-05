"use client";

import { thCls } from "@/lib/styles";

interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const roleBadge: Record<string, string> = {
  admin: "bg-blue50 text-blue700",
  user: "bg-smoky4 text-smoky8",
};

export default function UserTable({ users, onEdit, onDelete }: Props) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-smoky6 text-[14px]">
        No users found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-smoky4">
            <th className={thCls}>Username</th>
            <th className={thCls}>Role</th>
            <th className={`${thCls} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={user.id} className={`border-b border-smoky4 last:border-0 cursor-default hover:bg-blue50 transition-colors ${i % 2 === 1 ? "bg-smoky2" : ""}`}>
              <td className="px-6 py-4 text-[14px] text-smoky13 font-medium">{user.username}</td>
              <td className="px-6 py-4">
                <span className={`text-[12px] font-semibold px-3 py-1 rounded-full capitalize ${roleBadge[user.role]}`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="px-4 py-1.5 rounded-[8px] text-[13px] font-medium text-blue500 border border-blue100 hover:bg-blue50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="px-4 py-1.5 rounded-[8px] text-[13px] font-medium text-error border border-error/20 hover:bg-error/5 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
