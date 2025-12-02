"use client";

import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  source: "DATACORE" | "Local Override" | "Local";
}

export default function AdminRBACPage() {
  const [users] = useState<User[]>([
    {
      id: "2352525",
      name: "2352525 – Khanh",
      email: "2352525@hcmut.edu.vn",
      roles: ["Student"],
      source: "DATACORE",
    },
    {
      id: "coord01",
      name: "coord01 – Student Affairs",
      email: "coord01@hcmut.edu.vn",
      roles: ["Coordinator", "StudentAffairs"],
      source: "Local Override",
    },
    {
      id: "admin",
      name: "admin",
      email: "admin@hcmut.edu.vn",
      roles: ["ProgramAdmin"],
      source: "Local",
    },
    {
      id: "2353001",
      name: "2353001 – Minh",
      email: "2353001@hcmut.edu.vn",
      roles: ["Student", "Tutor"],
      source: "Local Override",
    },
    {
      id: "dept01",
      name: "dept01 – CS Dept Chair",
      email: "dept01@hcmut.edu.vn",
      roles: ["DepartmentChair"],
      source: "DATACORE",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState<{ type: string; user: User | null }>({
    type: "",
    user: null,
  });

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const mockSyncRoles = () => {
    showMessage("Role sync from DATACORE started (mock).");
  };

  const openUserModal = (user: User) => {
    setShowModal({ type: "view", user });
  };

  const openAssignRoleModal = (user: User) => {
    setShowModal({ type: "assign", user });
  };

  const openRemoveRoleModal = (user: User) => {
    setShowModal({ type: "remove", user });
  };

  const closeModal = () => {
    setShowModal({ type: "", user: null });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSourceColor = (source: string) => {
    if (source === "DATACORE") return "text-blue-700 bg-blue-50";
    if (source === "Local Override") return "text-orange-700 bg-orange-50";
    return "text-gray-700 bg-gray-50";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Users & Roles</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Inspect current roles (Student, Tutor, Coordinator, Department Chair, Program Admin) and
          local overrides.
        </p>
      </header>

      {/* Message Banner */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded text-sm animate-fadeIn">
          {message}
        </div>
      )}

      {/* Search Bar */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue mb-3">Search Users</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by email / student ID / name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-soft-white-blue rounded bg-soft-white-blue focus:outline-none focus:border-light-light-blue focus:bg-white transition"
          />
          <button
            onClick={mockSyncRoles}
            className="px-4 py-2 bg-light-heavy-blue text-white rounded text-sm font-medium hover:bg-[#00539a] transition"
          >
            Sync roles from DATACORE (mock)
          </button>
        </div>
      </section>

      {/* Users Table */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 overflow-x-auto">
        <h2 className="text-base font-semibold text-dark-blue mb-3">
          Users ({filteredUsers.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-soft-white-blue">
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">User</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Email / ID</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">
                Current Role(s)
              </th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Source</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-black/60">
                  No users match your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-soft-white-blue hover:bg-soft-white-blue"
                >
                  <td className="py-3 px-3 font-medium text-dark-blue">{user.name}</td>
                  <td className="py-3 px-3 text-black/70">{user.email}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-0.5 rounded text-xs font-medium bg-soft-white-blue text-dark-blue border border-soft-white-blue"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getSourceColor(
                        user.source
                      )}`}
                    >
                      {user.source}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openUserModal(user)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openAssignRoleModal(user)}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        Add role
                      </button>
                      <button
                        onClick={() => openRemoveRoleModal(user)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove role
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Modal */}
      {showModal.type && showModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-slideUp">
            <h3 className="text-lg font-semibold text-dark-blue mb-3">
              {showModal.type === "view" && `User Details: ${showModal.user.name}`}
              {showModal.type === "assign" && `Add Role to ${showModal.user.name}`}
              {showModal.type === "remove" && `Remove Role from ${showModal.user.name}`}
            </h3>
            <div className="text-sm text-black/70 mb-4 space-y-2">
              {showModal.type === "view" && (
                <>
                  <p>
                    <strong>Email:</strong> {showModal.user.email}
                  </p>
                  <p>
                    <strong>ID:</strong> {showModal.user.id}
                  </p>
                  <p>
                    <strong>Roles:</strong> {showModal.user.roles.join(", ")}
                  </p>
                  <p>
                    <strong>Source:</strong> {showModal.user.source}
                  </p>
                </>
              )}
              {showModal.type === "assign" && (
                <p>
                  This is a mock UI. In production, you would select a role (Tutor, Coordinator,
                  etc.) and assign it to {showModal.user.name}.
                </p>
              )}
              {showModal.type === "remove" && (
                <p>
                  This is a mock UI. In production, you would select one of the current roles (
                  {showModal.user.roles.join(", ")}) and remove it from {showModal.user.name}.
                </p>
              )}
            </div>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-light-heavy-blue text-white rounded text-sm font-medium hover:bg-[#00539a] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}