"use client";

import { useEffect, useState } from "react";

type Audit = {
  id: string;
  actorId: string;
  actorRole: string;
  eventType: string;
  resource: string;
  details?: any;
  createdAt: string;
};

export default function Page() {
  // 1) Tất cả Hooks phải ở trên cùng — không return trước Hook nào
  const [mounted, setMounted] = useState(false);
  const [rows, setRows] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  const [actor, setActor] = useState("");
  const [eventType, setEventType] = useState("");
  const [resource, setResource] = useState("");

  // 2) Đánh dấu client mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const load = () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (actor) params.set("actor", actor);
    if (eventType) params.set("eventType", eventType);
    if (resource) params.set("resource", resource);

    fetch(`/api/admin/audit?${params.toString()}`, {
      headers: {
        "x-user-role": "PROGRAM_ADMIN",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          console.error("Audit API error:", await res.text());
          setRows([]);
          return;
        }
        const data = await res.json();
        setRows(data.results || []);
      })
      .catch((err) => console.error("Audit API error:", err))
      .finally(() => setLoading(false));
  };

  // 3) Load sau khi mount
  useEffect(() => {
    if (mounted) load();
  }, [mounted]);

  // 4) Khi chưa mounted → render skeleton (KHÔNG return trước Hook)
  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <p className="text-sm text-black/50">Loading…</p>
      </div>
    );
  }

  // 5) UI chính
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Audit Logs</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          View system activities, exports, sync operations, and role changes.
        </p>
      </header>

      {/* Filters */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            placeholder="Actor"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className="px-3 py-2 text-sm rounded border bg-soft-white-blue border-soft-white-blue"
          />

          <input
            placeholder="Event Type (EXPORT / SYNC / AUTH)"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="px-3 py-2 text-sm rounded border bg-soft-white-blue border-soft-white-blue"
          />

          <input
            placeholder="Resource"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            className="px-3 py-2 text-sm rounded border bg-soft-white-blue border-soft-white-blue"
          />

          <button
            onClick={load}
            className="px-3 py-2 text-sm rounded bg-dark-blue text-white hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        {loading ? (
          <p className="text-sm text-black/60">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-white-blue">
                  <th>ID</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Event</th>
                  <th>Resource</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-soft-white-blue hover:bg-soft-white-blue/50"
                  >
                    <td className="py-2 px-3 font-medium text-dark-blue">{r.id}</td>
                    <td className="py-2 px-3">{r.actorId}</td>
                    <td className="py-2 px-3">{r.actorRole}</td>
                    <td className="py-2 px-3">{r.eventType}</td>
                    <td className="py-2 px-3">{r.resource}</td>
                    <td className="py-2 px-3">{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
