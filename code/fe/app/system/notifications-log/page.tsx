import React from "react";

const NotificationsLog: React.FC = () => {
  const logs = [
    { id: "NL-01", text: "Session #101 reminder sent → student 2352525", at: "Today 08:00" },
    { id: "NL-02", text: "Feedback request sent → student 23531xx", at: "Yesterday 21:10" },
    { id: "NL-03", text: "Reschedule notice sent → tutor Nguyen T. A.", at: "Yesterday 16:45" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Notifications log</h1>
        <p className="text-sm text-black/70 mt-1">Evidence for FR-NI-01 automatic notifications.</p>
      </section>
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <ul className="space-y-2">
          {logs.map(l => (
            <li key={l.id} className="bg-soft-white-blue rounded-lg p-3">
              <div className="text-sm text-black/80">{l.text}</div>
              <div className="text-xs text-black/60 mt-1">{l.at}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
export default NotificationsLog;