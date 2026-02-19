import { Amplify } from 'aws-amplify'

type Pool = 'citizen' | 'admin'

const poolConfigs: Record<Pool, { userPoolId: string; userPoolClientId: string }> = {
  citizen: {
    userPoolId: process.env.NEXT_PUBLIC_CITIZEN_POOL_ID || '',
    userPoolClientId: process.env.NEXT_PUBLIC_CITIZEN_CLIENT_ID || '',
  },
  admin: {
    userPoolId: process.env.NEXT_PUBLIC_ADMIN_POOL_ID || '',
    userPoolClientId: process.env.NEXT_PUBLIC_ADMIN_CLIENT_ID || '',
  },
}

let currentPool: Pool | null = null

export function configureAmplifyForPool(pool: Pool): void {
  if (currentPool === pool) return
  const config = poolConfigs[pool]
  if (!config.userPoolId) {
    console.warn(`[Auth] ${pool} pool not configured`)
    return
  }
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.userPoolClientId,
      },
    },
  })
  currentPool = pool
}

export function getCurrentPool(): Pool | null {
  return currentPool
}
