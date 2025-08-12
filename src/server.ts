import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import { registerSubRoutes } from './routes/sub'
import { registerPubRoutes } from './routes/pub'
import { registerHealthRoutes } from './routes/health'

export function buildServer() {
    const app = new Elysia()
        .use(cors())

    registerSubRoutes(app)
    registerPubRoutes(app)
    registerHealthRoutes(app)

    return app
}