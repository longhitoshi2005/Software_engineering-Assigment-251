"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Role, setClientRole } from "@/lib/role";
import Cookies from 'js-cookie'
import { oauthLogin } from '@/lib/api_oauth'
import api from '@/lib/api'


const TEST_ACCOUNTS: Record<string, { password: string; role: Role; redirect: string }> = {
  "student@hcmut.edu.vn": { password: "student", role: Role.STUDENT, redirect: "/student/dashboard" },
  "tutor@hcmut.edu.vn": { password: "tutor", role: Role.TUTOR, redirect: "/tutor/dashboard" },
  "coord@hcmut.edu.vn": { password: "coord", role: Role.COORDINATOR, redirect: "/coord/dashboard" },
  "dept@hcmut.edu.vn": { password: "dept", role: Role.DEPARTMENT_CHAIR, redirect: "/dept" },
  "sa@hcmut.edu.vn": { password: "sa", role: Role.STUDENT_AFFAIRS, redirect: "/sa/dashboard" },
  "admin@hcmut.edu.vn": { password: "admin", role: Role.PROGRAM_ADMIN, redirect: "/admin/dashboard" },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Try backend OAuth2 form login first
      const body = await oauthLogin(email, password)
      const token = body && (body.access_token || body.token)
      const refresh = body && body.refresh_token

      if (token) {
        // persist into api module and cookie
        try { api.setAccessToken(token) } catch (e) {}
        try { Cookies.set('access_token', token, { secure: true, sameSite: 'lax', expires: 1 }) } catch (e) {}
      }
      if (refresh) {
        try { Cookies.set('refresh_token', refresh, { secure: true, sameSite: 'lax', expires: 30 }) } catch (e) {}
      }

      // fetch profile/roles
      let me = null
      try {
        me = await api.auth.me()
      } catch (e) {
        // ignore — profile may be returned in login response instead
        me = body && body.user
      }

      // set client role based on roles from profile
      let assignedRole: Role | null = null
      const roles: string[] = me && me.roles ? me.roles : []
      if (roles.includes('STUDENT')) assignedRole = Role.STUDENT
      else if (roles.includes('TUTOR')) assignedRole = Role.TUTOR
      else if (roles.includes('COORDINATOR')) assignedRole = Role.COORDINATOR
      else if (roles.includes('DEPARTMENT_CHAIR')) assignedRole = Role.DEPARTMENT_CHAIR
      else if (roles.includes('STUDENT_AFFAIRS')) assignedRole = Role.STUDENT_AFFAIRS
      else if (roles.includes('PROGRAM_ADMIN')) assignedRole = Role.PROGRAM_ADMIN

      if (assignedRole) {
        try {
          localStorage.setItem('userRole', assignedRole)
          setClientRole(assignedRole)
        } catch (e) {}
      }

      // store email
      try { localStorage.setItem('userEmail', email) } catch (e) {}

      // redirect
      if (assignedRole === Role.STUDENT) router.push('/student/dashboard')
      else if (assignedRole === Role.TUTOR) router.push('/tutor/dashboard')
      else if (assignedRole === Role.COORDINATOR) router.push('/coord/dashboard')
      else if (assignedRole === Role.DEPARTMENT_CHAIR) router.push('/dept')
      else if (assignedRole === Role.STUDENT_AFFAIRS) router.push('/sa/dashboard')
      else if (assignedRole === Role.PROGRAM_ADMIN) router.push('/admin/dashboard')
      else router.push('/')
      return
    } catch (err) {
      // backend login failed — fall back to local TEST_ACCOUNTS for development
      console.warn('Backend login failed, falling back to TEST_ACCOUNTS', err)
      const account = TEST_ACCOUNTS[email as keyof typeof TEST_ACCOUNTS]
      if (!account || account.password !== password) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      try {
        localStorage.setItem('userEmail', email)
        localStorage.setItem('userRole', account.role)
        setClientRole(account.role)
      } catch (e) {}

      router.push(account.redirect)
      return
    } finally {
      setLoading(false)
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
                <label htmlFor="email" className="block text-sm font-medium text-dark-blue mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-black/10 rounded-md focus:outline-none focus:ring-2 focus:ring-light-heavy-blue text-sm"
                  placeholder="your.email@hcmut.edu.vn"
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
              <p className="text-xs font-semibold text-dark-blue mb-2">Test Accounts:</p>
              <div className="space-y-1 text-xs text-black/70">
                <div className="flex justify-between">
                  <span>Student:</span>
                  <span className="font-mono">student@hcmut.edu.vn / student</span>
                </div>
                <div className="flex justify-between">
                  <span>Tutor:</span>
                  <span className="font-mono">tutor@hcmut.edu.vn / tutor</span>
                </div>
                <div className="flex justify-between">
                  <span>Coordinator:</span>
                  <span className="font-mono">coord@hcmut.edu.vn / coord</span>
                </div>
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span className="font-mono">dept@hcmut.edu.vn / dept</span>
                </div>
                <div className="flex justify-between">
                  <span>Student Affairs:</span>
                  <span className="font-mono">sa@hcmut.edu.vn / sa</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin:</span>
                  <span className="font-mono">admin@hcmut.edu.vn / admin</span>
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
        © {new Date().getFullYear()} Tutor Support System - HCMUT
      </footer>
    </div>
  );
}
// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { oauthLogin, setAccessToken } from "../../../src/lib/api_oauth";

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     try {
//       const body = await oauthLogin(email, password);
//         const token = body && (body.access_token || body.token);
//         const refresh = body && body.refresh_token;
//         if (token) {
//           // set in api module and persist in cookie for reload
//           setAccessToken(token);
//           try {
//             Cookies.set('access_token', token, { secure: true, sameSite: 'lax', expires: 1 });
//           } catch (e) {
//             // ignore cookie errors in dev
//           }
//         }
//         if (refresh) {
//           try {
//             Cookies.set('refresh_token', refresh, { secure: true, sameSite: 'lax', expires: 30 });
//           } catch (e) {}
//       }
//       // redirect to home or previous page
//       router.push("/");
//     } catch (err: any) {
//       console.error("Login error", err);
//       setError(err?.body?.message || err?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="max-w-md mx-auto mt-24 p-6 border rounded">
//       <h1 className="text-2xl mb-4">Đăng nhập</h1>
//       <form onSubmit={handleSubmit}>
//         <label className="block mb-2">
//           <div className="text-sm">Email</div>
//           <input
//             type="email"
//             className="w-full border px-2 py-1"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </label>

//         <label className="block mb-4">
//           <div className="text-sm">Mật khẩu</div>
//           <input
//             type="password"
//             className="w-full border px-2 py-1"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </label>

//         {error && <div className="text-red-600 mb-2">{error}</div>}

//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//           disabled={loading}
//         >
//           {loading ? "Đang đăng nhập..." : "Đăng nhập"}
//         </button>
//       </form>
//     </div>
//   );
// }
