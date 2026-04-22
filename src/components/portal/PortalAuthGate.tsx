'use client'

import { useEffect, useState } from 'react'
import { CitizenAuth } from '@/components/portal/CitizenAuth'
import { CitizenLayout } from '@/components/portal/CitizenLayout'
import { getCurrentCitizen, logoutCitizen } from '@/lib/citizen-auth'

export function PortalAuthGate({ children }: { children: React.ReactNode }) {
  const [citizenName, setCitizenName] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [checked, setChecked] = useState(false)

  const loadSession = async () => {
    const session = await getCurrentCitizen()
    if (!session) {
      setAuthenticated(false)
      setChecked(true)
      return
    }
    setAuthenticated(true)
    setCitizenName(session.name)
    setChecked(true)
  }

  useEffect(() => {
    loadSession()
  }, [])

  const handleLogout = async () => {
    await logoutCitizen()
    setAuthenticated(false)
    setCitizenName('')
  }

  const handleAuthenticated = async () => {
    await loadSession()
  }

  if (!checked) return null

  if (!authenticated) {
    return <CitizenAuth onAuthenticated={handleAuthenticated} />
  }

  return (
    <CitizenLayout citizenName={citizenName} onLogout={handleLogout}>
      {children}
    </CitizenLayout>
  )
}
