"use client";

type Log = { id: string; at: string; actor: string; action: string; target?: string };

const AUDIT: Log[] = [
  { id: "A-3001", at: "2025-10-21 08:10", actor: "admin", action: "RoleAssign", target: "tutor02 → Tutor" },
  { id: "A-3002", at: "2025-10-21 21:15", actor: "system", action: "DATACORE Sync", target: "users/roles" },
  { id: "A-3003", at: "2025-10-22 07:45", actor: "coord01", action: "ApproveSession", target: "S-2103" },
];

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Audit & System Logs</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Key actions for compliance and debugging.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-soft-white-blue">
              <th className="text-left py-2 px-3">Log</th>
              <th className="text-left py-2 px-3">Time</th>
              <th className="text-left py-2 px-3">Actor</th>
              <th className="text-left py-2 px-3">Action</th>
              <th className="text-left py-2 px-3">Target</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT.map(a=>(
              <tr key={a.id} className="border-b border-soft-white-blue hover:bg-soft-white-blue/50">
                <td className="py-3 px-3 font-medium text-dark-blue">{a.id}</td>
                <td className="py-3 px-3">{a.at}</td>
                <td className="py-3 px-3">{a.actor}</td>
                <td className="py-3 px-3">{a.action}</td>
                <td className="py-3 px-3">{a.target || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
