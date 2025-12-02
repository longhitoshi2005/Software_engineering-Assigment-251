"use client";

import React, { useMemo, useState } from "react";

type RoleRow = {
  key: string;                // e.g. "student", "tutor"
  source: "DATACORE" | "LOCAL";
  granted: boolean;
  scope?: string;             // e.g. "CSE", "EEE", or "global"
  note?: string;
};

const mockDatacore: RoleRow[] = [
  { key: "student", source: "DATACORE", granted: true, scope: "CSE" },
  { key: "coordinator", source: "DATACORE", granted: false, scope: "global" },
  { key: "tutor", source: "DATACORE", granted: true, scope: "CSE" },
];

const mockLocalOverride: RoleRow[] = [
  { key: "tutor", source: "LOCAL", granted: false, note: "Temporarily disabled by program admin" },
  { key: "program_admin", source: "LOCAL", granted: true, scope: "EEE" },
];

const ALL_KEYS = Array.from(
  new Set([...mockDatacore, ...mockLocalOverride].map(r => r.key))
).sort();

const Roles: React.FC = () => {
  const [q, setQ] = useState("");

  const merged = useMemo(() => {
    // gộp theo role key để thấy ảnh hưởng của LOCAL override
    return ALL_KEYS
      .filter(k => !q || k.toLowerCase().includes(q.toLowerCase()))
      .map((key) => {
        const dc = mockDatacore.find(r => r.key === key);
        const local = mockLocalOverride.find(r => r.key === key);

        // effective: LOCAL ghi đè nếu tồn tại; nếu không thì DATACORE
        const effective: RoleRow = local ?? dc ?? { key, source: "DATACORE", granted: false };
        return { key, dc, local, effective };
      });
  }, [q]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Roles &amp; Access (RBAC)</h1>
        <p className="text-sm text-black/70 mt-1">
          View roles from <span className="font-medium">DATACORE</span> and local overrides. LOCAL overrides take precedence.
        </p>
      </section>

      {/* Filters */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search role key (e.g., tutor, coordinator)"
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition w-full sm:w-80"
          />
          <span className="text-xs text-black/60">
            Showing {merged.length} / {ALL_KEYS.length} role keys
          </span>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: "var(--color-soft-white-blue)" }}>
                <th className="py-2 pr-4 text-dark-blue">Role</th>
                <th className="py-2 pr-4 text-dark-blue">DATACORE</th>
                <th className="py-2 pr-4 text-dark-blue">LOCAL Override</th>
                <th className="py-2 pr-4 text-dark-blue">Effective</th>
                <th className="py-2 pr-4 text-dark-blue">Note</th>
              </tr>
            </thead>
            <tbody>
              {merged.map(({ key, dc, local, effective }) => (
                <tr key={key} className="border-b last:border-0" style={{ borderColor: "var(--color-soft-white-blue)" }}>
                  <td className="py-2 pr-4 font-semibold text-dark-blue">{key}</td>

                  <td className="py-2 pr-4">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.75rem] font-semibold"
                      style={{
                        background: "var(--color-soft-white-blue)",
                        color: dc?.granted ? "var(--color-light-heavy-blue)" : "var(--color-light-blue)",
                      }}
                    >
                      {dc?.granted ? "Granted" : "Denied"}
                    </span>
                    <div className="text-xs text-black/60">
                      scope: {dc?.scope ?? "—"}
                    </div>
                  </td>

                  <td className="py-2 pr-4">
                    {local ? (
                      <>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.75rem] font-semibold"
                          style={{
                            background: "var(--color-soft-white-blue)",
                            color: local.granted ? "var(--color-light-heavy-blue)" : "var(--color-light-blue)",
                          }}
                        >
                          {local.granted ? "Granted" : "Denied"}
                        </span>
                        <div className="text-xs text-black/60">
                          scope: {local.scope ?? "—" }
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-black/50">No override</span>
                    )}
                  </td>

                  <td className="py-2 pr-4">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.75rem] font-semibold"
                      style={{
                        background: "var(--color-soft-white-blue)",
                        color: effective.granted ? "var(--color-light-heavy-blue)" : "var(--color-light-blue)",
                      }}
                    >
                      {effective.granted ? "Granted" : "Denied"}
                    </span>
                    <div className="text-xs text-black/60">source: {effective.source}</div>
                  </td>

                  <td className="py-2 pr-4 text-xs text-black/70">
                    {local?.note ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="text-sm font-semibold rounded-lg px-3 py-2"
            style={{ background: "var(--color-light-heavy-blue)", color: "var(--color-white)" }}
          >
            Sync from DATACORE
          </button>
          <button
            className="text-sm font-semibold rounded-lg px-3 py-2 border hover:bg-soft-white-blue/70 transition"
            style={{ borderColor: "var(--color-soft-white-blue)", color: "var(--color-medium-light-blue)", background: "var(--color-white)" }}
          >
            Manage local overrides
          </button>
        </div>
      </section>
    </div>
  );
};

export default Roles;