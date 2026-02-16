export interface AdminAccount {
  username: string
  password: string // btoa encoded
  name: string
}

export interface AdminSession {
  username: string
  name: string
}

const ADMINS_KEY = 'adminAccounts'
const SESSION_KEY = 'adminSession'

function getAdmins(): AdminAccount[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(ADMINS_KEY)
  if (raw) return JSON.parse(raw)

  // Seed default admin account on first access
  const defaultAdmin: AdminAccount = {
    username: 'admin',
    password: btoa('admin123'),
    name: 'Administrador',
  }
  localStorage.setItem(ADMINS_KEY, JSON.stringify([defaultAdmin]))
  return [defaultAdmin]
}

export function loginAdmin(
  username: string,
  password: string
): { ok: true } | { ok: false; error: string } {
  const trimmed = username.trim().toLowerCase()
  const admins = getAdmins()
  const admin = admins.find((a) => a.username === trimmed)

  if (!admin || admin.password !== btoa(password)) {
    return { ok: false, error: 'Usuario o contraseña incorrectos' }
  }

  const session: AdminSession = { username: admin.username, name: admin.name }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true }
}

export function logoutAdmin(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentAdmin(): AdminSession | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}
