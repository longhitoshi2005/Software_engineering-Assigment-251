// src/components/layout/AuthLayout.tsx
import React from 'react'
import '@/src/styles/layout.css'

type Props = {
  children: React.ReactNode
}

const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="auth-shell">
      <div className="auth-box">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout