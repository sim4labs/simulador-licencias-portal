'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import {
  registerCitizen,
  loginCitizen,
  confirmCitizenSignUp,
  resendCitizenVerificationCode,
  requestCitizenPasswordReset,
  confirmCitizenPasswordReset,
} from '@/lib/citizen-auth'

interface CitizenAuthProps {
  onAuthenticated: () => void
}

type Tab = 'login' | 'register' | 'confirm' | 'forgot' | 'reset'

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

export function CitizenAuth({ onAuthenticated }: CitizenAuthProps) {
  const [tab, setTab] = useState<Tab>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Confirmation
  const [confirmEmail, setConfirmEmail] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendInfo, setResendInfo] = useState('')

  // Password recovery
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const passwordChecks = {
    length: regPassword.length >= 8,
    upper: /[A-Z]/.test(regPassword),
    lower: /[a-z]/.test(regPassword),
    number: /[0-9]/.test(regPassword),
  }
  const passwordValid = Object.values(passwordChecks).every(Boolean)
  const resetPasswordChecks = {
    length: resetPassword.length >= 8,
    upper: /[A-Z]/.test(resetPassword),
    lower: /[a-z]/.test(resetPassword),
    number: /[0-9]/.test(resetPassword),
  }
  const resetPasswordValid = Object.values(resetPasswordChecks).every(Boolean)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await loginCitizen(loginEmail, loginPassword)
    setLoading(false)
    if (result.ok) {
      onAuthenticated()
    } else {
      setError(result.error)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (regPassword !== regConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!passwordValid) {
      setError('La contraseña no cumple los requisitos')
      return
    }
    setLoading(true)
    const result = await registerCitizen(regEmail, regPassword, regName)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    if ('requiresConfirmation' in result && result.requiresConfirmation) {
      setConfirmEmail(result.email)
      setTab('confirm')
    } else {
      onAuthenticated()
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await confirmCitizenSignUp(confirmEmail, confirmCode.trim())
    setLoading(false)
    if (result.ok) {
      onAuthenticated()
    } else {
      setError(result.error)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendLoading) return
    setError('')
    setResendInfo('')
    setResendLoading(true)
    const result = await resendCitizenVerificationCode(confirmEmail)
    setResendLoading(false)
    if (result.ok) {
      setResendInfo('Enviamos un nuevo código a tu correo. Revisa tu bandeja y spam.')
      setResendCooldown(60)
    } else {
      setError(result.error)
    }
  }

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await requestCitizenPasswordReset(resetEmail)
    setLoading(false)
    if (result.ok) {
      setResetEmail(resetEmail.trim().toLowerCase())
      setResendInfo('Enviamos un código a tu correo. Revisa también la carpeta de spam.')
      setResendCooldown(60)
      setTab('reset')
    } else {
      setError(result.error)
    }
  }

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (resetPassword !== resetConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!resetPasswordValid) {
      setError('La contraseña no cumple los requisitos')
      return
    }
    setLoading(true)
    const result = await confirmCitizenPasswordReset(resetEmail, resetCode, resetPassword)
    setLoading(false)
    if (result.ok) {
      setLoginEmail(resetEmail)
      setLoginPassword('')
      setResetCode('')
      setResetPassword('')
      setResetConfirm('')
      setTab('login')
      setResendInfo('Tu contraseña fue actualizada. Ya puedes iniciar sesión.')
    } else {
      setError(result.error)
    }
  }

  const handleResendResetCode = async () => {
    if (resendCooldown > 0 || resendLoading) return
    setError('')
    setResendInfo('')
    setResendLoading(true)
    const result = await requestCitizenPasswordReset(resetEmail)
    setResendLoading(false)
    if (result.ok) {
      setResendInfo('Enviamos un nuevo código a tu correo. Revisa también la carpeta de spam.')
      setResendCooldown(60)
    } else {
      setError(result.error)
    }
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    setError('')
    setResendInfo('')
  }

  const goToConfirmForExistingAccount = () => {
    if (!regEmail.trim()) return
    setConfirmEmail(regEmail.trim().toLowerCase())
    setTab('confirm')
    setError('')
    setResendInfo('')
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
          <Image src="/Tlaxcala-logo-white.svg" alt="Gobierno de Tlaxcala" width={220} height={66} className="mb-12" />
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Portal de Licencias<br />de Conducir
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            Realiza tu examen teórico, agenda tu cita en el simulador y obtén tu licencia de forma rápida y segura.
          </p>
          <div className="mt-12 space-y-4">
            {[
              'Examen teórico en línea',
              'Agenda tu cita al instante',
              'Recibe tu código QR de confirmación',
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

          {tab === 'confirm' ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Confirma tu correo</h2>
                <p className="text-gray-500 mt-2">
                  Enviamos un código de verificación a <strong className="text-gray-700">{confirmEmail}</strong>
                </p>
              </div>

              <form onSubmit={handleConfirm} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Código de verificación</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={confirmCode}
                    onChange={(e) => { setConfirmCode(e.target.value.replace(/\D/g, '')); setError('') }}
                    autoFocus
                    className={`w-full h-11 px-4 rounded-xl border bg-white text-sm text-center tracking-[0.3em] font-mono text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                {resendInfo && !error && (
                  <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-100">
                    {resendInfo}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={confirmCode.length !== 6 || loading}
                  className="w-full h-11 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirmar
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-500 mt-4 space-y-2">
                  <p>
                    ¿No recibiste el código?{' '}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0 || resendLoading}
                      className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {resendLoading
                        ? 'Enviando...'
                        : resendCooldown > 0
                          ? `Reenviar en ${resendCooldown}s`
                          : 'Reenviar código'}
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={() => switchTab('login')}
                      className="text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                    >
                      Volver a iniciar sesión
                    </button>
                  </p>
                </div>
              </form>
            </>
          ) : tab === 'forgot' ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Recupera tu contraseña</h2>
                <p className="text-gray-500 mt-2">
                  Ingresa el correo de tu cuenta y te enviaremos un código de verificación.
                </p>
              </div>
              <form onSubmit={handleRequestPasswordReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={resetEmail}
                      onChange={(e) => { setResetEmail(e.target.value); setError('') }}
                      autoFocus
                      className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white text-base sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                    />
                  </div>
                </div>
                {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}
                <button type="submit" disabled={!resetEmail || loading} className="w-full min-h-11 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Enviar código <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={() => switchTab('login')} className="w-full min-h-11 text-sm text-primary-600 font-semibold hover:text-primary-700 hover:underline">
                  Volver a iniciar sesión
                </button>
              </form>
            </>
          ) : tab === 'reset' ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Crea una nueva contraseña</h2>
                <p className="text-gray-500 mt-2">Escribe el código que enviamos a <strong className="text-gray-700">{resetEmail}</strong>.</p>
              </div>
              <form onSubmit={handleConfirmPasswordReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Código de verificación</label>
                  <input type="text" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" maxLength={6} value={resetCode} onChange={(e) => { setResetCode(e.target.value.replace(/\D/g, '')); setError('') }} autoFocus className={`w-full h-11 px-4 rounded-xl border bg-white text-center tracking-[0.3em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type={showResetPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={resetPassword} onChange={(e) => { setResetPassword(e.target.value); setError('') }} className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`} />
                    <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} aria-label={showResetPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-gray-400 hover:text-gray-600">
                      {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {resetPassword.length > 0 && <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-1.5 mt-2">
                    <PasswordCheck valid={resetPasswordChecks.length} text="8+ caracteres" />
                    <PasswordCheck valid={resetPasswordChecks.upper} text="Una mayúscula" />
                    <PasswordCheck valid={resetPasswordChecks.lower} text="Una minúscula" />
                    <PasswordCheck valid={resetPasswordChecks.number} text="Un número" />
                  </div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="password" autoComplete="new-password" placeholder="Repite tu contraseña" value={resetConfirm} onChange={(e) => { setResetConfirm(e.target.value); setError('') }} className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`} /></div>
                </div>
                {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>}
                {resendInfo && !error && <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-100">{resendInfo}</div>}
                <button type="submit" disabled={resetCode.length !== 6 || !resetPasswordValid || !resetConfirm || loading} className="w-full min-h-11 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Actualizar contraseña <ArrowRight className="w-4 h-4" /></>}
                </button>
                <div className="text-center text-sm space-y-2">
                  <button type="button" onClick={handleResendResetCode} disabled={resendCooldown > 0 || resendLoading} className="min-h-11 px-2 text-primary-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline">
                    {resendLoading ? 'Enviando...' : resendCooldown > 0 ? `Reenviar código en ${resendCooldown}s` : 'Reenviar código'}
                  </button>
                  <button type="button" onClick={() => switchTab('login')} className="block w-full min-h-11 text-gray-500 hover:text-gray-700 hover:underline">Volver a iniciar sesión</button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex bg-gray-200/70 rounded-xl p-1 mb-8">
                <button
                  onClick={() => switchTab('login')}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    tab === 'login'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => switchTab('register')}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    tab === 'register'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-primary-700 hover:text-primary-800 hover:bg-white/50'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {tab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
                </h2>
                <p className="text-gray-500 mt-2">
                  {tab === 'login'
                    ? 'Ingresa tus datos para continuar con tu trámite'
                    : 'Regístrate para iniciar tu trámite de licencia'}
                </p>
              </div>

              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="tu@correo.com"
                        value={loginEmail}
                        onChange={(e) => { setLoginEmail(e.target.value); setError('') }}
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
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Tu contraseña"
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setError('') }}
                        className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginEmail.trim().toLowerCase())
                        switchTab('forgot')
                      }}
                      className="min-h-11 px-1 text-sm text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  {resendInfo && !error && (
                    <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-100">
                      {resendInfo}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!loginEmail || !loginPassword || loading}
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

                  <p className="text-center text-sm text-gray-500 mt-6">
                    ¿No tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('register')}
                      className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors"
                    >
                      Regístrate aquí
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Juan Pérez García"
                        value={regName}
                        onChange={(e) => { setRegName(e.target.value); setError('') }}
                        autoFocus
                        className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="tu@correo.com"
                        value={regEmail}
                        onChange={(e) => { setRegEmail(e.target.value); setError('') }}
                        className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={regPassword}
                        onChange={(e) => { setRegPassword(e.target.value); setError('') }}
                        className={`w-full h-11 pl-10 pr-11 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {regPassword.length > 0 && (
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
                        placeholder="Repite tu contraseña"
                        value={regConfirm}
                        onChange={(e) => { setRegConfirm(e.target.value); setError('') }}
                        className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 ${error ? 'border-red-300' : 'border-gray-200'}`}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 space-y-2">
                      <p>{error}</p>
                      {error === 'Ya existe una cuenta con este correo' && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-red-100">
                          <button
                            type="button"
                            onClick={() => switchTab('login')}
                            className="text-primary-600 font-semibold hover:text-primary-700 hover:underline"
                          >
                            Iniciar sesión
                          </button>
                          <span className="text-red-300">·</span>
                          <button
                            type="button"
                            onClick={goToConfirmForExistingAccount}
                            className="text-primary-600 font-semibold hover:text-primary-700 hover:underline"
                          >
                            Aún no confirmé mi correo
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!regName || !regEmail || !passwordValid || !regConfirm || loading}
                    className="w-full h-11 bg-primary-600 text-white rounded-xl font-medium text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Crear Cuenta
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-6">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => switchTab('login')}
                      className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </form>
              )}
            </>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            Gobierno del Estado de Tlaxcala &middot; Portal de Licencias
          </p>
        </div>
      </div>
    </div>
  )
}
