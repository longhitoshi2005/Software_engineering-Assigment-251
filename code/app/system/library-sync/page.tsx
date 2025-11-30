"use client";

import React, { useEffect, useState } from "react";

type LibraryDoc = {
  id: string;
  title: string;
  state: "ok" | "restricted" | "expired";
};

const LibrarySync: React.FC = () => {
  const [docs, setDocs] = useState<LibraryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2500);
  };

  const loadDocs = async () => {
    const res = await fetch("/api/library-sync/docs");
    const data = await res.json();
    setDocs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const requestAccess = async (docId: string) => {
    await fetch("/api/library-sync/request-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docId }),
    });

    showMessage(`Requested access for ${docId}`);
  };

  if (loading) {
    return <div className="p-4 text-black/60">Loading…</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded text-sm">
          {message}
        </div>
      )}

      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">
          Library sync
        </h1>
        <p className="text-sm text-black/70 mt-1">
          Review restricted or expired documents.
        </p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <ul className="space-y-2">
          {docs.map((d) => (
            <li
              key={d.id}
              className="bg-soft-white-blue rounded-lg p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-dark-blue">
                  {d.title}
                </div>
                <div className="text-xs text-black/60">{d.id}</div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-black/70">{d.state}</span>

                {d.state !== "ok" && (
                  <button
                    onClick={() => requestAccess(d.id)}
                    className="text-sm font-semibold rounded-lg px-3 py-2 border hover:bg-soft-white-blue/70 transition"
                    style={{
                      borderColor: "var(--color-soft-white-blue)",
                      color: "var(--color-medium-light-blue)",
                      background: "var(--color-white)",
                    }}
                  >
                    Request access
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default LibrarySync;
