import { Router } from 'express'
import { createHash } from 'node:crypto'
import { z } from 'zod'
import { rawPrisma } from '../../lib/prisma.js'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { ApiError } from '../../utils/api-error.js'
import { parsePermissionArray } from '../../config/permissions.js'
export async function joinTeam(userId: string, code: string) {
  const value = code.trim()
  const hash = (s: string) => createHash('sha256').update(s).digest('hex')
  await rawPrisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } })
    const invite = await tx.teamInvite.findFirst({
      where: {
        OR: [{ tokenHash: hash(value) }, { codeHash: hash(value.toUpperCase().replace(/[\s-]/g, '')) }],
      },
    })
    if (
      !invite ||
      !['LINK', 'EMAIL'].includes(invite.type) ||
      invite.status !== 'PENDING' ||
      invite.expiresAt <= new Date()
    )
      throw new ApiError(400, 'Invalid or expired invitation code')
    if (invite.email && invite.email !== user.email)
      throw new ApiError(403, 'Invite intended for another email')
    if (user.teamId && user.teamId !== invite.teamId) throw new ApiError(409, 'You already belong to a team')
    const consumed = await tx.teamInvite.updateMany({
      where: { id: invite.id, status: 'PENDING' },
      data: { status: 'ACCEPTED', provisionedUserId: userId },
    })
    if (consumed.count !== 1) throw new ApiError(409, 'Invitation already used')
    const role = invite.roleId
      ? await tx.role.findFirst({ where: { id: invite.roleId, teamId: invite.teamId } })
      : await tx.role.findFirst({ where: { name: 'EMPLOYEE', teamId: invite.teamId } })
    if (!role) throw new ApiError(400, 'Invitation role no longer exists')
    const assigned = await tx.user.updateMany({
      where: { id: userId, teamId: user.teamId },
      data: {
        teamId: invite.teamId,
        roleId: role.id,
        departmentId: invite.departmentId,
        extraPermissions: parsePermissionArray(invite.extraPermissions),
      },
    })
    if (assigned.count !== 1) throw new ApiError(409, 'Team membership changed; reload and try again')
  })
}
export const teamsRouter = Router()
teamsRouter.use(authenticate)
teamsRouter.post(
  '/join',
  validate({ body: z.object({ code: z.string().trim().min(8).max(100) }) }),
  async (req, res) => {
    await joinTeam(req.user!.sub, req.body.code)
    res.json({ success: true })
  },
)
