#!/usr/bin/env npx tsx
/**
 * Script para crear usuarios admin en el Cognito Admin Pool.
 *
 * Uso interactivo:
 *   npm run dev:admin
 *
 * Uso no-interactivo:
 *   npm run dev:admin -- --username admin --email admin@test.com --name "Admin" --password "Admin2026!"
 *
 * Requiere:
 *   - AWS CLI configurado con perfil simtabasco
 *   - Variables NEXT_PUBLIC_ADMIN_POOL_ID en .env.local
 */

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import * as readline from 'readline'
import { config } from 'dotenv'
import { parseArgs } from 'util'

// Load .env.local
config({ path: '.env.local' })

const REGION = process.env.NEXT_PUBLIC_REGION || 'us-east-1'
const USER_POOL_ID = process.env.NEXT_PUBLIC_ADMIN_POOL_ID

if (!USER_POOL_ID) {
  console.error('Error: NEXT_PUBLIC_ADMIN_POOL_ID no encontrado en .env.local')
  process.exit(1)
}

import { fromIni } from '@aws-sdk/credential-providers'

const client = new CognitoIdentityProviderClient({
  region: REGION,
  credentials: fromIni({ profile: 'simtabasco' }),
})

function parseCliArgs() {
  try {
    const { values } = parseArgs({
      options: {
        username: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        password: { type: 'string' },
      },
      strict: false,
    })
    return values as Record<string, string | undefined>
  } catch {
    return {}
  }
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log('\n=== Crear Admin - Cognito User Pool ===\n')
  console.log(`Pool ID: ${USER_POOL_ID}`)
  console.log(`Región:  ${REGION}\n`)

  const args = parseCliArgs()

  let username = args.username
  let email = args.email
  let name = args.name
  let tempPassword = args.password

  // Si faltan argumentos, preguntar interactivamente
  if (!username || !email || !name || !tempPassword) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    if (!username) username = await ask(rl, 'Username: ')
    if (!email) email = await ask(rl, 'Email: ')
    if (!name) name = await ask(rl, 'Nombre completo: ')
    if (!tempPassword)
      tempPassword = await ask(
        rl,
        'Contraseña temporal (mín 8 chars, mayúscula, minúscula, número): '
      )

    rl.close()
  }

  if (!username) {
    console.error('Username es requerido')
    process.exit(1)
  }
  if (!email) {
    console.error('Email es requerido')
    process.exit(1)
  }
  if (!name) {
    console.error('Nombre es requerido')
    process.exit(1)
  }
  if (!tempPassword || tempPassword.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres')
    process.exit(1)
  }

  console.log('\nCreando usuario...')

  try {
    await client.send(
      new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'name', Value: name },
        ],
        TemporaryPassword: tempPassword,
        MessageAction: 'SUPPRESS',
      })
    )

    console.log(`\nUsuario "${username}" creado exitosamente.`)
    console.log(`\nInstrucciones para el admin:`)
    console.log(`  1. Ir a /admin en el portal`)
    console.log(`  2. Login con username: ${username}`)
    console.log(`  3. Password temporal: ${tempPassword}`)
    console.log(`  4. Se le pedirá cambiar la contraseña en el primer login`)
  } catch (err: unknown) {
    const error = err as Error
    console.error(`\nError al crear usuario: ${error.message}`)
    process.exit(1)
  }
}

main()
