import swaggerJsdoc from 'swagger-jsdoc'
import { env } from './config/env.js'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flexora API',
      version: '1.0.0',
      description: 'CRM and Project Management API for IT companies',
    },
    servers: [{ url: `http://localhost:${env.PORT}/api/v1`, description: 'API v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
