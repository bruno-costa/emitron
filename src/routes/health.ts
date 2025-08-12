import type { Elysia } from 'elysia'
import { pingRedis } from '../redis'

export function registerHealthRoutes(app: Elysia) {
    return app.get('/health', async () => {
        const redis = await pingRedis()
        return { ok: true, redis: redis ? 'up' : 'down' }
    })
}
