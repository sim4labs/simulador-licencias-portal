'use client'

import { useState, useEffect } from 'react'
import { AdminAuth } from '@/components/admin/AdminAuth'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { getCurrentAdmin, logoutAdmin } from '@/lib/admin-auth'

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    getCurrentAdmin().then((session) => {
      setAuthenticated(!!session)
      setChecked(true)
    })
  }, [])

  const handleAuthenticated = () => {
    setAuthenticated(true)
  }

  const handleLogout = async () => {
    await logoutAdmin()
    setAuthenticated(false)
  }

  if (!checked) return null

  if (!authenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />
  }

  return <AdminLayout onLogout={handleLogout}>{children}</AdminLayout>
}
