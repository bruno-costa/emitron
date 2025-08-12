import type { Elysia } from 'elysia'
import { t } from 'elysia'
import { publish } from '../redis'
import { countSubscribers } from '../queues'

export function registerPubRoutes(app: Elysia) {
    return app.post(
        '/pub/:queue',
        async ({ params, body }) => {
            const { queue } = params
            const payload = (body as any)?.data
            const message = JSON.stringify(payload)

            const receivers = await publish(queue, message)
            const local = countSubscribers(queue)

            return { queue, redisReceivers: receivers, localSubscribers: local }
        },
        {
            body: t.Object({
                data: t.Unknown()
            })
        }
    )
}
