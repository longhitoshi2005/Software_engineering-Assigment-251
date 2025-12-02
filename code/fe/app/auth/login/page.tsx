"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Swal from 'sweetalert2';

import { Role, setClientRole } from "@/lib/role";
import api from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDevMode, setShowDevMode] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Dev-only quick login accounts
  const devAccounts = [
    { name: "Lan Tran", username: "lan.tran", roles: ["STUDENT"], password: "123" },
    { name: "Gioi", username: "student_gioi", roles: ["STUDENT", "TUTOR"], password: "123" },
    { name: "Tuan Pham (Tutor)", username: "tuan.pham", roles: ["TUTOR"], password: "123" },
    { name: "Head CSE (Admin)", username: "head.cse", roles: ["DEPARTMENT_CHAIR", "TUTOR"], password: "123" },
    { name: "An Nguyen", username: "an.nguyen", roles: ["STUDENT"], password: "123" },
    { name: "Binh Tran", username: "binh.tran", roles: ["STUDENT"], password: "123" },
    { name: "Cuong Le", username: "cuong.le", roles: ["STUDENT"], password: "123" },
    { name: "Dung Pham", username: "dung.pham", roles: ["STUDENT"], password: "123" },
    { name: "Em Hoang", username: "em.hoang", roles: ["STUDENT"], password: "123" },
    { name: "Phuong Vo", username: "phuong.vo", roles: ["STUDENT"], password: "123" },
    { name: "Gia Do", username: "gia.do", roles: ["STUDENT"], password: "123" },
    { name: "Hoa Bui", username: "hoa.bui", roles: ["STUDENT"], password: "123" },
    { name: "Kha Dinh", username: "kha.dinh", roles: ["STUDENT"], password: "123" },
    { name: "Linh Ngo", username: "linh.ngo", roles: ["STUDENT"], password: "123" },
    { name: "Minh Truong", username: "minh.truong", roles: ["STUDENT"], password: "123" },
    { name: "Nga Ly", username: "nga.ly", roles: ["STUDENT"], password: "123" },
    { name: "Phong Duong", username: "phong.duong", roles: ["STUDENT"], password: "123" },
    { name: "Quynh Trinh", username: "quynh.trinh", roles: ["STUDENT"], password: "123" },
    { name: "Son Mai", username: "son.mai", roles: ["STUDENT"], password: "123" },
    { name: "Thao Ha", username: "thao.ha", roles: ["STUDENT"], password: "123" },
    { name: "Tuan Vu", username: "tuan.vu", roles: ["STUDENT"], password: "123" },
    { name: "Uyen Dang", username: "uyen.dang", roles: ["STUDENT"], password: "123" },
    { name: "Vinh Cao", username: "vinh.cao", roles: ["STUDENT"], password: "123" },
    { name: "Xuan Phan", username: "xuan.phan", roles: ["STUDENT"], password: "123" },
  ];

  // Filter accounts based on role
  const filteredAccounts = roleFilter === "all" 
    ? devAccounts 
    : devAccounts.filter(account => {
        if (roleFilter === "student") return account.roles.includes("STUDENT");
        if (roleFilter === "tutor") return account.roles.includes("TUTOR");
        if (roleFilter === "dept") return account.roles.includes("DEPARTMENT_CHAIR");
        if (roleFilter === "coord") return account.roles.includes("COORDINATOR");
        if (roleFilter === "sa") return account.roles.includes("STUDENT_AFFAIRS");
        if (roleFilter === "admin") return account.roles.includes("PROGRAM_ADMIN");
        return true;
      });

  const handleDevLogin = async (account: typeof devAccounts[0]) => {
    setUsername(account.username);
    setPassword(account.password);
    setLoading(true);
    setError("");

    try {
      const loginData: LoginRequest = {
        username: account.username,
        password: account.password,
      };

      await api.post("/auth/login", loginData);
      const userInfo = await api.get("/users/me");

      if (!userInfo.roles || userInfo.roles.length === 0) {
        setError("Account role not configured");
        setLoading(false);
        return;
      }

      localStorage.setItem("userEmail", `${account.username}@hcmut.edu.vn`);
      localStorage.setItem("username", account.username);
      
      let primaryRole: Role;
      let redirectPath: string;

      if (userInfo.roles.includes("TUTOR")) {
        primaryRole = Role.TUTOR;
        redirectPath = "/tutor/dashboard";
      } else if (userInfo.roles.includes("STUDENT")) {
        primaryRole = Role.STUDENT;
        redirectPath = "/student/dashboard";
      } else if (userInfo.roles.includes("DEPARTMENT_CHAIR")) {
        primaryRole = Role.DEPARTMENT_CHAIR;
        redirectPath = "/dept";
      } else if (userInfo.roles.includes("COORDINATOR")) {
        primaryRole = Role.COORDINATOR;
        redirectPath = "/coord";
      } else if (userInfo.roles.includes("STUDENT_AFFAIRS")) {
        primaryRole = Role.STUDENT_AFFAIRS;
        redirectPath = "/sa";
      } else if (userInfo.roles.includes("PROGRAM_ADMIN")) {
        primaryRole = Role.PROGRAM_ADMIN;
        redirectPath = "/admin";
      } else {
        setError("Account role not supported");
        setLoading(false);
        return;
      }

      localStorage.setItem('userRole', primaryRole);
      setClientRole(primaryRole);
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quick login failed");
      setLoading(false);
    }
  };

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

      await api.post("/auth/login", loginData);

      // Get user info from backend to determine role
      const userInfo = await api.get("/users/me");

      if (!userInfo.roles || userInfo.roles.length === 0) {
        setError("Account role not configured");
        setLoading(false);
        return;
      }

      // Store user info in localStorage
      localStorage.setItem("userEmail", `${username}@hcmut.edu.vn`);
      localStorage.setItem("username", username);
      
      // Determine primary role and redirect path
      let primaryRole: Role;
      let redirectPath: string;

      if (userInfo.roles.includes("TUTOR")) {
        primaryRole = Role.TUTOR;
        redirectPath = "/tutor/dashboard";
      } else if (userInfo.roles.includes("STUDENT")) {
        primaryRole = Role.STUDENT;
        redirectPath = "/student/dashboard";
      } else if (userInfo.roles.includes("DEPARTMENT_CHAIR")) {
        primaryRole = Role.DEPARTMENT_CHAIR;
        redirectPath = "/dept";
      } else if (userInfo.roles.includes("COORDINATOR")) {
        primaryRole = Role.COORDINATOR;
        redirectPath = "/coord";
      } else if (userInfo.roles.includes("STUDENT_AFFAIRS")) {
        primaryRole = Role.STUDENT_AFFAIRS;
        redirectPath = "/sa";
      } else if (userInfo.roles.includes("PROGRAM_ADMIN")) {
        primaryRole = Role.PROGRAM_ADMIN;
        redirectPath = "/admin";
      } else {
        setError("Account role not supported");
        setLoading(false);
        return;
      }

      try {
        localStorage.setItem('userRole', primaryRole);
        setClientRole(primaryRole);
      } catch (e) {
        console.log("error: ", e)
      }

      // Redirect based on assigned role
      router.push(redirectPath);
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
                style={{ background: "var(--color-light-heavy-blue)", color: "white" }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Test Accounts Info */}
            <div className="mt-6 p-4 bg-soft-white-blue rounded-lg border border-black/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-dark-blue">Dev Quick Login:</p>
                <button
                  type="button"
                  onClick={() => setShowDevMode(!showDevMode)}
                  className="text-xs px-3 py-1.5 rounded bg-dark-blue text-white hover:bg-dark-blue/80 transition"
                >
                  {showDevMode ? "Hide" : "Show Accounts"}
                </button>
              </div>

              {showDevMode && (
                <div className="space-y-2">
                  {/* Role Filter */}
                  <div className="flex gap-1 flex-wrap pb-2 border-b border-black/10">
                    {[
                      { label: "All", value: "all" },
                      { label: "Student", value: "student" },
                      { label: "Tutor", value: "tutor" },
                      { label: "Dept", value: "dept" },
                      { label: "Coord", value: "coord" },
                      { label: "SA", value: "sa" },
                      { label: "Admin", value: "admin" },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setRoleFilter(filter.value)}
                        className={`text-[0.65rem] px-2 py-1 rounded transition ${
                          roleFilter === filter.value
                            ? "bg-light-heavy-blue text-white"
                            : "bg-white text-dark-blue border border-black/10 hover:border-light-heavy-blue/50"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable Account List */}
                  <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1">
                    {filteredAccounts.map((account) => (
                      <div
                        key={account.username}
                        className="flex items-center justify-between p-2 bg-white rounded border border-black/10 hover:border-light-heavy-blue/30 transition"
                      >
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-dark-blue">{account.name}</div>
                          <div className="text-[0.65rem] text-black/60">
                            {account.roles.join(", ")}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDevLogin(account)}
                          disabled={loading}
                          className="text-xs px-3 py-1 rounded bg-light-heavy-blue text-white hover:bg-light-heavy-blue/80 transition disabled:opacity-50"
                        >
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        © {new Date().getFullYear()} Tutor Support System - HCMUT
      </footer>
    </div>
  );
}
