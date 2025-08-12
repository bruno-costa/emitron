import { buildServer } from './server'
import { closeRedis } from './redis'

const app = buildServer().listen(
    {
        port: 3000,
        idleTimeout: 0,
    }, (server) => {console.log(`emitron up on http://0.0.0.0:${server.port}`)
})

async function shutdown() {
    console.log('shutting down...')
    try { await closeRedis() } catch {}
    try { app.stop() } catch {}
    process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)