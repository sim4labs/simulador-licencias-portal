'use client'

import { useState, useEffect } from 'react'
import { CitizenAuth } from '@/components/portal/CitizenAuth'
import { CitizenLayout } from '@/components/portal/CitizenLayout'
import { getCurrentCitizen, logoutCitizen } from '@/lib/citizen-auth'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [citizenName, setCitizenName] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const session = getCurrentCitizen()
    if (session) {
      setAuthenticated(true)
      setCitizenName(session.name)
    }
    setChecked(true)
  }, [])

  const handleLogout = () => {
    logoutCitizen()
    setAuthenticated(false)
    setCitizenName('')
  }

  const handleAuthenticated = () => {
    const session = getCurrentCitizen()
    if (session) {
      setCitizenName(session.name)
      setAuthenticated(true)
    }
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
