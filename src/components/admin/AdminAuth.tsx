'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, User, Lock, ArrowRight, Shield, CheckCircle, XCircle } from 'lucide-react'
import { loginAdmin, completeNewPassword } from '@/lib/admin-auth'

interface AdminAuthProps {
  onAuthenticated: () => void
}

type Step = 'login' | 'new-password'

function PasswordCheck({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {valid ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-gray-300" />
      )}
      <span className={valid ? 'text-green-600' : 'text-gray-400'}>{text}</span>
    </div>
  )
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [step, setStep] = useState<Step>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // New password fields
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)

  const passwordChecks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  }
  const passwordValid = Object.values(passwordChecks).every(Boolean)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await loginAdmin(username, password)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    if ('requiresNewPassword' in result && result.requiresNewPassword) {
      setStep('new-password')
    } else {
      onAuthenticated()
    }
  }

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!passwordValid) {
      setError('La contraseña no cumple los requisitos')
      return
    }
    setLoading(true)
    const result = await completeNewPassword(newPassword)
    setLoading(false)
    if (result.ok) {
      onAuthenticated()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-repeat bg-center"
          style={{ backgroundImage: 'url(/Flower-pattern.png)', backgroundSize: '200px auto' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-accent opacity-95" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Image src="/Tlaxcala-logo.svg" alt="Gobierno de Tlaxcala" width={220} height={66} className="mb-12 brightness-0 invert" />
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Portal<br />Administrativo
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Gestiona trámites, citas, exámenes y resultados del simulador de licencias de conducir.
          </p>
          <div className="mt-12 space-y-4">
            {[
              'Gestión de citas y calendario',
              'Banco de preguntas y exámenes',
              'Resultados del simulador',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src="/Tlaxcala-logo.svg" alt="Gobierno de Tlaxcala" width={180} height={54} />
          </div>

          {/* Admin badge */}
          <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Acceso Administrativo</span>
          </div>

          {step === 'login' ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h2>
                <p className="text-gray-500 mt-2">Ingresa tus credenciales para acceder al panel</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tu usuario"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError('') }}
                      autoFocus
                      className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!username || !password || loading}
                  className="w-full h-11 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Actualiza tu contraseña</h2>
                <p className="text-gray-500 mt-2">Por seguridad, debes cambiar tu contraseña temporal</p>
              </div>

              <form onSubmit={handleNewPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                      autoFocus
                      className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      <PasswordCheck valid={passwordChecks.length} text="8+ caracteres" />
                      <PasswordCheck valid={passwordChecks.upper} text="Una mayúscula" />
                      <PasswordCheck valid={passwordChecks.lower} text="Una minúscula" />
                      <PasswordCheck valid={passwordChecks.number} text="Un número" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Repite tu nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                      className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!passwordValid || !confirmPassword || loading}
                  className="w-full h-11 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Actualizar Contraseña
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            Gobierno del Estado de Tlaxcala &middot; Portal Administrativo
          </p>
        </div>
      </div>
    </div>
  )
}
