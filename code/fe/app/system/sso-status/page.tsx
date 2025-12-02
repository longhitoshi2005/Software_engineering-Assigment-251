import React from "react";

const SsoStatus: React.FC = () => {
  const services = [
    { name: "HCMUT_SSO", status: "OK" },
    { name: "DATACORE", status: "SYNCED (2h ago)" },
    { name: "LIBRARY", status: "OK" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">System status</h1>
        <p className="text-sm text-black/70 mt-1">SSO / DATACORE / Library health.</p>
      </section>
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <ul className="space-y-2">
          {services.map(s => (
            <li key={s.name} className="bg-soft-white-blue rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-dark-blue">{s.name}</span>
              <span className="text-xs text-black/70">{s.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
export default SsoStatus;