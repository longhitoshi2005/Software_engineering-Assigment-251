import React from "react";

const ServiceUnavailable: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 bg-white border border-soft-white-blue rounded-lg p-6">
      <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Service unavailable</h1>
      <p className="text-sm text-black/70">
        One or more integrations are down (SSO/Library). Please try again later.
      </p>
      <div className="bg-soft-white-blue rounded-lg p-3">
        <div className="text-xs text-black/60">Tip</div>
        <div className="text-sm text-black/80">Check System Status page or contact support@hcmut.edu.vn</div>
      </div>
      <button className="text-sm font-semibold rounded-lg px-3 py-2" style={{background:"var(--color-light-heavy-blue)", color:"var(--color-white)"}}>
        Go to Status
      </button>
    </div>
  );
};
export default ServiceUnavailable;