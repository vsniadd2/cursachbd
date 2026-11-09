import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { authenticate } from '../../middleware/authenticate.js'
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  updateProfileSchema,
} from './auth.schema.js'
import * as authController from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', validate({ body: registerSchema }), authController.register)
authRouter.post('/login', validate({ body: loginSchema }), authController.login)
authRouter.post('/refresh', validate({ body: refreshSchema }), authController.refresh)
authRouter.post('/logout', validate({ body: logoutSchema }), authController.logout)
authRouter.get('/me', authenticate, authController.me)
authRouter.patch('/me', authenticate, validate({ body: updateProfileSchema }), authController.updateProfile)
