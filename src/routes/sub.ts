import type { Elysia } from 'elysia'
import { HEARTBEAT_MS, RETRY_MS } from '../config'
import { addSubscriber, removeSubscriber, hasSubscribers } from '../queues'
import { subscribe as redisSubscribe, unsubscribe as redisUnsubscribe } from '../redis'
import type { Sender } from '../types'

export function registerSubRoutes(app: Elysia) {
    return app.get('/sub/:queue', async ({ params, request, set }) => {
        const { queue } = params

        // Garante inscrição no canal Redis (se ainda não inscrito)
        await redisSubscribe(queue)

        set.headers['Content-Type'] = 'text/event-stream; charset=utf-8';
        set.headers['Cache-Control'] = 'no-cache, no-transform';
        set.headers['Connection'] = 'keep-alive';
        set.headers['X-Accel-Buffering'] = 'no';

        const enc = new TextEncoder()
        let hb: Timer | number | undefined
        let sender: Sender | null = null

        const stream = new ReadableStream({
            start(controller) {
                // dica ao client para reconectar
                controller.enqueue(enc.encode(`retry: ${RETRY_MS}\n\n`))

                sender = (payload: string) => {
                    controller.enqueue(enc.encode(`data: ${payload}\n\n`))
                }

                addSubscriber(queue, sender)

                // heartbeat (comentários SSE) para manter conexões
                hb = setInterval(() => {
                    try {
                        controller.enqueue(enc.encode(`: hb ${Date.now()}\n\n`))
                    } catch {}
                }, HEARTBEAT_MS)
            },
            cancel() {
                cleanup()
            }
        })

        function cleanup() {
            if (sender) removeSubscriber(queue, sender)
            if (hb) clearInterval(hb as number)

            // se ninguém mais escuta localmente, opcionalmente desinscreve do Redis
            if (!hasSubscribers(queue)) {
                redisUnsubscribe(queue).catch(() => {})
            }
        }

        // cliente desconectou
        request.signal.addEventListener('abort', cleanup)

        return new Response(stream)
    })
}
