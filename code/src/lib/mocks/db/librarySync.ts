// lib/mocks/db/librarySync.ts

export type LibraryState = "ok" | "restricted" | "expired";

export interface LibraryDoc {
  id: string;
  title: string;
  state: LibraryState;
}

export let librarySyncDocs: LibraryDoc[] = [
  { id: "L-01", title: "CO1001 Lab Manual", state: "restricted" },
  { id: "L-02", title: "CO2002 Data Structures notes", state: "ok" },
  { id: "L-03", title: "EE2002 Experiments", state: "expired" },
];

export let libraryAccessRequests: { docId: string; at: string }[] = [];

/**
 * Add an access request (mock)
 */
export function requestLibraryAccess(docId: string) {
  const at = new Date().toISOString().split(":").slice(0, 2).join(":");
  libraryAccessRequests.push({ docId, at });
}
