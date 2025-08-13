import Redis from 'ioredis'
import {CHANNEL_PREFIX, REDIS_URL, REPLAY_MAX} from './config'

const redisClient = new Redis(REDIS_URL)

function bufferKey(queue: string) {
    return `${CHANNEL_PREFIX}:buffer:${queue}`
}

export async function pushReplay(queue: string, msg: string) {
    const key = bufferKey(queue)
    await redisClient.lpush(key, msg)
    await redisClient.ltrim(key, 0, REPLAY_MAX - 1)
}

export async function getRecent(queue: string, count: number) {
    const key = bufferKey(queue)
    const list = await redisClient.lrange(key, 0, count - 1)
    return list.reverse()
}

export async function clearReplay(queue: string) {
    const key = bufferKey(queue)
    return (await redisClient.del(key)) === 1;
}
