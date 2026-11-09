import type { RequestHandler } from 'express'
import * as authService from './auth.service.js'
import { ApiError } from '../../utils/api-error.js'

export const register: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.register(req.body)
    res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const login: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const result = await authService.refreshSession(req.body.refreshToken)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const logout: RequestHandler = async (req, res, next) => {
  try {
    await authService.logoutSession(req.body?.refreshToken)
    res.json({ success: true, data: { ok: true } })
  } catch (err) {
    next(err)
  }
}

export const me: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user?.sub) {
      throw new ApiError(401, 'Unauthorized')
    }
    const user = await authService.getMe(req.user.sub)
    res.json({ success: true, data: { user } })
  } catch (err) {
    next(err)
  }
}

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user?.sub) {
      throw new ApiError(401, 'Unauthorized')
    }
    const user = await authService.updateProfile(req.user.sub, req.body)
    res.json({ success: true, data: { user } })
  } catch (err) {
    next(err)
  }
}
