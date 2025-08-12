import Redis from 'ioredis'
import { CHANNEL_PREFIX, REDIS_URL } from './config'
import { broadcast } from './queues'

const redisPub = new Redis(REDIS_URL)
const redisSub = new Redis(REDIS_URL)

const subscribedChannels = new Set<string>()

function chan(queue: string) {
    return `${CHANNEL_PREFIX}:${queue}`
}

export async function publish(queue: string, message: string) {
    return redisPub.publish(chan(queue), message)
}

export async function subscribe(queue: string) {
    const c = chan(queue)
    if (subscribedChannels.has(c)) return
    await redisSub.subscribe(c)
    subscribedChannels.add(c)
}

export async function unsubscribe(queue: string) {
    const c = chan(queue)
    if (!subscribedChannels.has(c)) return
    await redisSub.unsubscribe(c)
    subscribedChannels.delete(c)
}

redisSub.on('message', (channel, message) => {
    const queue = channel.slice(channel.indexOf(':') + 1)
    broadcast(queue, message)
})

export async function pingRedis() {
    try {
        await redisPub.ping()
        return true
    } catch {
        return false
    }
}

export async function closeRedis() {
    try { await redisSub.quit() } catch {}
    try { await redisPub.quit() } catch {}
}
