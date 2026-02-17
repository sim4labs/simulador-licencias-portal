export interface CitizenAccount {
  email: string
  password: string // btoa encoded
  name: string
  createdAt: string
}

export interface CitizenSession {
  email: string
  name: string
}

const CITIZENS_KEY = 'citizens'
const SESSION_KEY = 'citizenSession'

function getCitizens(): CitizenAccount[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(CITIZENS_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveCitizens(citizens: CitizenAccount[]): void {
  localStorage.setItem(CITIZENS_KEY, JSON.stringify(citizens))
}

export function registerCitizen(
  email: string,
  password: string,
  name: string
): { ok: true } | { ok: false; error: string } {
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedName = name.trim()

  if (!trimmedName || trimmedName.length < 2) {
    return { ok: false, error: 'El nombre debe tener al menos 2 caracteres' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { ok: false, error: 'Ingresa un correo electrónico válido' }
  }
  if (password.length < 6) {
    return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  const citizens = getCitizens()
  if (citizens.some((c) => c.email === trimmedEmail)) {
    return { ok: false, error: 'Ya existe una cuenta con este correo' }
  }

  citizens.push({
    email: trimmedEmail,
    password: btoa(password),
    name: trimmedName,
    createdAt: new Date().toISOString(),
  })
  saveCitizens(citizens)

  // Auto-login after register
  const session: CitizenSession = { email: trimmedEmail, name: trimmedName }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))

  return { ok: true }
}

export function loginCitizen(
  email: string,
  password: string
): { ok: true } | { ok: false; error: string } {
  const trimmedEmail = email.trim().toLowerCase()
  const citizens = getCitizens()
  const citizen = citizens.find((c) => c.email === trimmedEmail)

  if (!citizen || citizen.password !== btoa(password)) {
    return { ok: false, error: 'Correo o contraseña incorrectos' }
  }

  const session: CitizenSession = { email: citizen.email, name: citizen.name }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true }
}

export function logoutCitizen(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentCitizen(): CitizenSession | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}
