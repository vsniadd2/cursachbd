import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env.js'
import { requestLogger } from './middleware/request-logger.js'
import { errorHandler } from './middleware/error-handler.js'
import { v1Router } from './routes/v1/index.js'
import { swaggerSpec } from './swagger.js'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  )
  app.use(requestLogger)
  app.use(express.json({ limit: '1mb' }))

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/api/docs.json', (_req, res) => {
    res.json(swaggerSpec)
  })

  app.use('/api/v1', v1Router)

  app.use(errorHandler)

  return app
}
