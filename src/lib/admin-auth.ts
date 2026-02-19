import {
  signIn,
  signOut,
  confirmSignIn,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth'
import { configureAmplifyForPool } from './amplify-config'

export interface AdminSession {
  username: string
  name: string
  sub: string
}

type AdminLoginResult =
  | { ok: true }
  | { ok: true; requiresNewPassword: true }
  | { ok: false; error: string }

type AuthResult = { ok: true } | { ok: false; error: string }

function ensureAdminPool() {
  configureAmplifyForPool('admin')
}

function mapError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('Incorrect username or password') || msg.includes('NotAuthorizedException'))
    return 'Usuario o contraseña incorrectos'
  if (msg.includes('Password did not conform'))
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'
  if (msg.includes('User is disabled'))
    return 'Esta cuenta ha sido desactivada'
  if (msg.includes('LimitExceededException'))
    return 'Demasiados intentos. Intenta más tarde'
  if (msg.includes('NetworkError') || msg.includes('network'))
    return 'Error de conexión. Verifica tu internet'
  console.error('[AdminAuth]', err)
  return 'Ocurrió un error inesperado. Intenta de nuevo'
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<AdminLoginResult> {
  ensureAdminPool()
  const trimmed = username.trim()

  try {
    // Clear any stale session
    try { await signOut() } catch { /* ignore */ }

    const result = await signIn({ username: trimmed, password })

    if (result.isSignedIn) {
      return { ok: true }
    }

    if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      return { ok: true, requiresNewPassword: true }
    }

    return { ok: false, error: 'No se pudo iniciar sesión' }
  } catch (err) {
    return { ok: false, error: mapError(err) }
  }
}

export async function completeNewPassword(newPassword: string): Promise<AuthResult> {
  ensureAdminPool()
  try {
    await confirmSignIn({ challengeResponse: newPassword })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: mapError(err) }
  }
}

export async function logoutAdmin(): Promise<void> {
  ensureAdminPool()
  try {
    await signOut()
  } catch {
    // ignore
  }
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  ensureAdminPool()
  try {
    const user = await getCurrentUser()
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken
    const claims = idToken?.payload
    return {
      username: user.signInDetails?.loginId || (claims?.['cognito:username'] as string) || '',
      name: (claims?.name as string) || user.signInDetails?.loginId || '',
      sub: user.userId,
    }
  } catch {
    return null
  }
}

export async function getAdminIdToken(): Promise<string | null> {
  ensureAdminPool()
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() || null
  } catch {
    return null
  }
}
