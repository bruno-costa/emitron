export const REDIS_URL = process.env.REDIS_URL ?? 'redis://redis:6379'
export const CHANNEL_PREFIX = process.env.CHANNEL_PREFIX ?? 'emitron'
export const HEARTBEAT_MS = Number(process.env.HEARTBEAT_MS ?? 15000)
export const RETRY_MS = Number(process.env.RETRY_MS ?? 10000)
export const REPLAY_MAX = Number(process.env.REPLAY_MAX ?? 100)