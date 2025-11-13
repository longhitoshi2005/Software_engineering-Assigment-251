import React from "react";
import MainNavbar from "@/src/components/layout/MainNavbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-soft-white-blue text-black">
      {/* === MAIN NAVBAR === */}
      <MainNavbar />

      {/* === PAGE CONTENT === */}
      <main className="flex-1 px-6 md:px-10 py-8">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;