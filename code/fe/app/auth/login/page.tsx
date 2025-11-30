"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Swal from 'sweetalert2';

import { Role, setClientRole } from "@/lib/role";
import api from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/types/auth";

// Test accounts mapping for role assignment (frontend only for demo)
// In production, roles would come from the backend
// USERNAME ONLY - email_edu is always derived as username@hcmut.edu.vn
const ROLE_MAPPING: Record<string, { role: Role; redirect: string }> = {
  "lan.tran": { role: Role.STUDENT, redirect: "/student/dashboard" },
  "student_gioi": { role: Role.STUDENT, redirect: "/student/dashboard" },
  "tuan.pham": { role: Role.TUTOR, redirect: "/tutor/dashboard" },
  "head.cse": { role: Role.DEPARTMENT_CHAIR, redirect: "/dept" },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if redirected due to authentication error
    const errorParam = searchParams.get('error');
    if (errorParam === 'not_authenticated') {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in first to access this page.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1e3a8a',
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call backend login API
      const loginData: LoginRequest = {
        username: username,
        password: password,
      };

      const response: LoginResponse = await api.post("/auth/login", loginData);

      // Get role mapping for this user (in production, roles would come from backend)
      const roleInfo = ROLE_MAPPING[username];

      if (!roleInfo) {
        setError("Account role not configured");
        setLoading(false);
        return;
      }

      // Store user info in localStorage
      // email_edu is ALWAYS derived from username
      localStorage.setItem("userEmail", `${username}@hcmut.edu.vn`);
      localStorage.setItem("username", username);
      try {
        localStorage.setItem('userRole', roleInfo.role);
        setClientRole(roleInfo.role);
      } catch (e) {
        // ignore write errors in strict environments
      }

      // Redirect based on assigned role
      router.push(roleInfo.redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-soft-white-blue">
      {/* Header */}
        <header className="h-18 md:h-20 bg-dark-blue flex items-center justify-between px-5 md:px-10">
        {/* Logo + brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 p-1 rounded-xl bg-white text-dark-blue flex items-center justify-center font-bold text-xs">
            <Image
              src="/logo-hcmut.png"
              alt="HCMUT logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="text-white font-bold text-sm md:text-base">
              TUTOR SUPPORT SYSTEM
            </div>
            <div className="text-white/60 text-[0.7rem]">
              Ho Chi Minh City University of Technology (HCMUT)
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-lg border border-soft-white-blue">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-dark-blue mb-2">Sign in with HCMUT SSO</h1>
              <p className="text-sm text-black/70">Enter your credentials to access the system</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-dark-blue mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-light-heavy-blue text-sm"
                  placeholder="lan.tran"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-dark-blue mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-light-heavy-blue text-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-sm font-semibold rounded-lg px-4 py-3 transition disabled:opacity-50"
                style={{ background: "var(--color-light-heavy-blue)", color: "var(--color-white)" }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Test Accounts Info */}
            <div className="mt-6 p-4 bg-soft-white-blue rounded-lg border border-black/10">
              <p className="text-xs font-semibold text-dark-blue mb-2">Test Accounts (Username / Password):</p>
              <div className="space-y-1 text-xs text-black/70">
                <div className="flex justify-between">
                  <span>Student (Lan):</span>
                  <span className="font-mono">lan.tran / 123</span>
                </div>
                <div className="flex justify-between">
                  <span>Student (Gioi):</span>
                  <span className="font-mono">student_gioi / 123</span>
                </div>
                <div className="flex justify-between">
                  <span>Lecturer (Tuấn):</span>
                  <span className="font-mono">tuan.pham / 123</span>
                </div>
                <div className="flex justify-between">
                  <span>Department Head:</span>
                  <span className="font-mono">head.cse / 123</span>
                </div>
                <div className="text-xs text-black/50 mt-2 pt-2 border-t border-black/10">
                  🔒 Email is auto-generated as username@hcmut.edu.vn
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-sm text-black/60">
              Securely integrated with HCMUT_SSO, DATACORE and Library
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-blue text-white/60 text-center text-xs py-3">
        © {new Date().getFullYear()} Tutor Support System – HCMUT
      </footer>
    </div>
  );
}
