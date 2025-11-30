import React from "react";

const NoMatchingTutor: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto bg-white border border-soft-white-blue rounded-lg p-6 text-center">
      <h1 className="text-lg md:text-xl font-semibold text-dark-blue">No tutors found</h1>
      <p className="text-sm text-black/70 mt-1">Try broadening your search: change time window, allow online mode, or switch department.</p>
      <div className="mt-3">
        <button className="text-sm font-semibold rounded-lg px-4 py-2 border hover:bg-soft-white-blue/70 transition"
          style={{borderColor:"var(--color-soft-white-blue)", color:"var(--color-medium-light-blue)", background:"var(--color-white)"}}>
          Adjust filters
        </button>
      </div>
    </div>
  );
};
export default NoMatchingTutor;