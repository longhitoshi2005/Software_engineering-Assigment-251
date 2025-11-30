"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  source: "DATACORE" | "Local Override" | "Local";
}

export default function AdminRBACPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const [showModal, setShowModal] = useState<{
    type: "view" | "assign" | "remove" | "";
    user: User | null;
  }>({ type: "", user: null });

  const [roleInput, setRoleInput] = useState("");

  // ---------------------------------------------
  // MESSAGE POPUP
  // ---------------------------------------------
  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ---------------------------------------------
  // LOAD USERS FROM BACKEND
  // ---------------------------------------------
  const loadUsers = async () => {
    const res = await fetch("/api/rbac/users");
    setUsers(await res.json());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ---------------------------------------------
  // SYNC FROM DATACORE
  // ---------------------------------------------
  const syncRoles = async () => {
    await fetch("/api/rbac/sync", { method: "POST" });
    showMessage("Role sync from DATACORE started (mock).");
  };

  // ---------------------------------------------
  // ASSIGN ROLE
  // ---------------------------------------------
  const assignRole = async () => {
    if (!showModal.user || !roleInput.trim()) return;

    await fetch("/api/rbac/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: showModal.user.id,
        role: roleInput.trim(),
      }),
    });

    await loadUsers();
    showMessage("Role assigned.");
    setRoleInput("");
    closeModal();
  };

  // ---------------------------------------------
  // REMOVE ROLE
  // ---------------------------------------------
  const removeRole = async (role: string) => {
    if (!showModal.user) return;

    await fetch("/api/rbac/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: showModal.user.id,
        role,
      }),
    });

    await loadUsers();
    showMessage("Role removed.");
    closeModal();
  };

  // ---------------------------------------------
  // MODALS
  // ---------------------------------------------
  const openUserModal = (user: User) => {
    setShowModal({ type: "view", user });
  };

  const openAssignRoleModal = (user: User) => {
    setShowModal({ type: "assign", user });
    setRoleInput("");
  };

  const openRemoveRoleModal = (user: User) => {
    setShowModal({ type: "remove", user });
  };

  const closeModal = () => {
    setShowModal({ type: "", user: null });
  };

  // ---------------------------------------------
  // FILTER USERS
  // ---------------------------------------------
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSourceColor = (src: string) => {
    if (src === "DATACORE") return "text-blue-700 bg-blue-50";
    if (src === "Local Override") return "text-orange-700 bg-orange-50";
    return "text-gray-700 bg-gray-50";
  };

  if (!users.length) {
    return (
      <div className="p-4 text-sm text-black/60">
        Loading users…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Users & Roles</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Inspect current roles (Student, Tutor, Coordinator, Department Chair, Program Admin) and local overrides.
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
            onClick={syncRoles}
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
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Current Role(s)</th>
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
                  <td className="py-3 px-3 font-medium text-dark-blue">
                    {user.name}
                  </td>

                  <td className="py-3 px-3 text-black/70">
                    {user.email}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded text-xs font-medium bg-soft-white-blue text-dark-blue border border-soft-white-blue"
                        >
                          {r}
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
              {/* View */}
              {showModal.type === "view" && (
                <>
                  <p><strong>Email:</strong> {showModal.user.email}</p>
                  <p><strong>ID:</strong> {showModal.user.id}</p>
                  <p><strong>Roles:</strong> {showModal.user.roles.join(", ")}</p>
                  <p><strong>Source:</strong> {showModal.user.source}</p>
                </>
              )}

              {/* Assign */}
              {showModal.type === "assign" && (
                <>
                  <p>Select or type a role to assign:</p>
                  <input
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="e.g., Tutor, Coordinator"
                    className="w-full px-3 py-2 border border-soft-white-blue rounded bg-soft-white-blue focus:outline-none focus:bg-white"
                  />
                  <button
                    onClick={assignRole}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded text-sm font-medium"
                  >
                    Add role
                  </button>
                </>
              )}

              {/* Remove */}
              {showModal.type === "remove" && (
                <>
                  <p>Select a role to remove:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {showModal.user.roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => removeRole(role)}
                        className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </>
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
