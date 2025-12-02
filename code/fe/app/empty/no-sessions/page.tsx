import React from "react";
import Link from "next/link";

const NoSessions: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto bg-white border border-soft-white-blue rounded-lg p-6 text-center">
      <h1 className="text-lg md:text-xl font-semibold text-dark-blue">No sessions yet</h1>
      <p className="text-sm text-black/70 mt-1">You haven&apos;t booked any session.</p>
      <div className="mt-4 flex justify-center">
        <Link href="/find-tutor" className="text-sm font-semibold rounded-lg px-4 py-2"
          style={{background:"var(--color-light-heavy-blue)", color:"var(--color-white)"}}>
          Find a tutor
        </Link>
      </div>
    </div>
  );
};
export default NoSessions;