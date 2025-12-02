import React from "react";

const LibrarySync: React.FC = () => {
  const docs = [
    { id: "L-01", title: "CO1001 Lab Manual", state: "restricted" },
    { id: "L-02", title: "CO2002 Data Structures notes", state: "ok" },
    { id: "L-03", title: "EE2002 Experiments", state: "expired" },
  ];
  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Library sync</h1>
        <p className="text-sm text-black/70 mt-1">Review restricted or expired documents.</p>
      </section>
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <ul className="space-y-2">
          {docs.map(d => (
            <li key={d.id} className="bg-soft-white-blue rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-dark-blue">{d.title}</div>
                <div className="text-xs text-black/60">{d.id}</div>
              </div>
              <div className="flex gap-2">
                <span className="text-xs text-black/70">{d.state}</span>
                <button className="text-sm font-semibold rounded-lg px-3 py-2 border hover:bg-soft-white-blue/70 transition"
                  style={{borderColor:"var(--color-soft-white-blue)", color:"var(--color-medium-light-blue)", background:"var(--color-white)"}}>
                  Request access
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
export default LibrarySync;