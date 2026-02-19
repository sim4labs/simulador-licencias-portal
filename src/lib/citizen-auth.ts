import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
  autoSignIn,
} from 'aws-amplify/auth'
import { configureAmplifyForPool } from './amplify-config'

export interface CitizenSession {
  email: string
  name: string
  sub: string
}

type AuthResult = { ok: true } | { ok: false; error: string }
type AuthResultWithConfirm =
  | { ok: true }
  | { ok: true; requiresConfirmation: true; email: string }
  | { ok: false; error: string }

function ensureCitizenPool() {
  configureAmplifyForPool('citizen')
}

function mapError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('User already exists')) return 'Ya existe una cuenta con este correo'
  if (msg.includes('Password did not conform'))
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
  if (msg.includes('Invalid email')) return 'Ingresa un correo electrónico válido'
  if (msg.includes('Incorrect username or password') || msg.includes('NotAuthorizedException'))
    return 'Correo o contraseña incorrectos'
  if (msg.includes('User is not confirmed'))
    return 'Tu cuenta no ha sido confirmada. Revisa tu correo electrónico'
  if (msg.includes('CodeMismatchException') || msg.includes('Invalid verification code'))
    return 'Código de verificación incorrecto'
  if (msg.includes('ExpiredCodeException'))
    return 'El código ha expirado. Solicita uno nuevo'
  if (msg.includes('LimitExceededException'))
    return 'Demasiados intentos. Intenta más tarde'
  if (msg.includes('NetworkError') || msg.includes('network'))
    return 'Error de conexión. Verifica tu internet'
  console.error('[CitizenAuth]', err)
  return 'Ocurrió un error inesperado. Intenta de nuevo'
}

export async function registerCitizen(
  email: string,
  password: string,
  name: string
): Promise<AuthResultWithConfirm> {
  ensureCitizenPool()
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = name.trim()

  if (!trimmedName || trimmedName.length < 2) {
    return { ok: false, error: 'El nombre debe tener al menos 2 caracteres' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { ok: false, error: 'Ingresa un correo electrónico válido' }
  }
  if (password.length < 8) {
    return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres' }
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, error: 'La contraseña debe incluir al menos una mayúscula' }
  }
  if (!/[a-z]/.test(password)) {
    return { ok: false, error: 'La contraseña debe incluir al menos una minúscula' }
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, error: 'La contraseña debe incluir al menos un número' }
  }

  try {
    const { isSignUpComplete, nextStep } = await signUp({
      username: trimmedEmail,
      password,
      options: {
        userAttributes: {
          email: trimmedEmail,
          name: trimmedName,
        },
        autoSignIn: true,
      },
    })

    if (isSignUpComplete) {
      return { ok: true }
    }

    if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
      return { ok: true, requiresConfirmation: true, email: trimmedEmail }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: mapError(err) }
  }
}

export async function confirmCitizenSignUp(
  email: string,
  code: string
): Promise<AuthResult> {
  ensureCitizenPool()
  try {
    await confirmSignUp({ username: email, confirmationCode: code })
    try {
      await autoSignIn()
    } catch {
      // autoSignIn may fail if not configured, user will need to login manually
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: mapError(err) }
  }
}

export async function loginCitizen(
  email: string,
  password: string
): Promise<AuthResult> {
  ensureCitizenPool()
  const trimmedEmail = email.trim().toLowerCase()

  try {
    // Clear any stale session
    try { await signOut() } catch { /* ignore */ }

    const result = await signIn({ username: trimmedEmail, password })

    if (result.isSignedIn) {
      return { ok: true }
    }

    if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
      return { ok: false, error: 'Tu cuenta no ha sido confirmada. Revisa tu correo electrónico' }
    }

    return { ok: false, error: 'No se pudo iniciar sesión' }
  } catch (err) {
    return { ok: false, error: mapError(err) }
  }
}

export async function logoutCitizen(): Promise<void> {
  ensureCitizenPool()
  try {
    await signOut()
  } catch {
    // ignore
  }
}

export async function getCurrentCitizen(): Promise<CitizenSession | null> {
  ensureCitizenPool()
  try {
    const user = await getCurrentUser()
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken
    const claims = idToken?.payload
    return {
      email: (claims?.email as string) || user.signInDetails?.loginId || '',
      name: (claims?.name as string) || '',
      sub: user.userId,
    }
  } catch {
    return null
  }
}

export async function getCitizenIdToken(): Promise<string | null> {
  ensureCitizenPool()
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() || null
  } catch {
    return null
  }
}
