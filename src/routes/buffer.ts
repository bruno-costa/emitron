import type { Elysia } from 'elysia'
import { clearReplay } from '../replay'

export function registerBufferRoutes(app: Elysia) {
    return app.delete('/buffer/:queue', async ({ params, set }) => {
        const removed = await clearReplay(params.queue)

        set.status = 200
        return {
            ok: true,
            queue: params.queue,
            removed,
            message: removed
                ? `Buffer de "${params.queue}" limpo`
                : `Nenhum buffer encontrado para "${params.queue}"`
        }
    })
}
