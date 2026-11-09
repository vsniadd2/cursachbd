import { randomInt } from 'node:crypto'
import type { PrismaClient } from '@prisma/client'

export const PUBLIC_CODE_PATTERN = /^[1-9]\d{8}$/

export function isValidPublicCode(value: string): boolean {
  return PUBLIC_CODE_PATTERN.test(value.trim())
}

/** Отсекаем «красивые» коды вроде 123456789, 111111111, 101010101 */
export function isPatternedPublicCode(code: string): boolean {
  if (!PUBLIC_CODE_PATTERN.test(code)) return true
  if (/^(\d)\1{8}$/.test(code)) return true
  const digits = code.split('').map(Number)
  let asc = true
  let desc = true
  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) asc = false
    if (digits[i] !== digits[i - 1] - 1) desc = false
  }
  if (asc || desc) return true
  const [a, b] = digits
  if (digits.every((d, i) => d === (i % 2 === 0 ? a : b))) return true
  return false
}

export function generatePublicCode(): string {
  for (let attempt = 0; attempt < 48; attempt++) {
    let code = String(randomInt(1, 10))
    for (let i = 0; i < 8; i++) {
      code += String(randomInt(0, 10))
    }
    if (!isPatternedPublicCode(code)) return code
  }
  let code = String(randomInt(1, 10))
  for (let i = 0; i < 8; i++) {
    code += String(randomInt(0, 10))
  }
  return code
}

export async function generateUniquePublicCode(prisma: PrismaClient): Promise<string> {
  for (let attempt = 0; attempt < 32; attempt++) {
    const publicCode = generatePublicCode()
    const exists = await prisma.user.findUnique({ where: { publicCode }, select: { id: true } })
    if (!exists) return publicCode
  }
  throw new Error('Could not generate unique public code')
}
