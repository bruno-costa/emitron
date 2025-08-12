import type { Sender } from './types'

const localSubs = new Map<string, Set<Sender>>()

export function ensureQueue(queue: string) {
    if (!localSubs.has(queue)) localSubs.set(queue, new Set())
    return localSubs.get(queue)!
}

export function addSubscriber(queue: string, sender: Sender) {
    ensureQueue(queue).add(sender)
}

export function removeSubscriber(queue: string, sender: Sender) {
    localSubs.get(queue)?.delete(sender)
}

export function countSubscribers(queue: string) {
    return localSubs.get(queue)?.size ?? 0
}

export function hasSubscribers(queue: string) {
    return countSubscribers(queue) > 0
}

export function broadcast(queue: string, message: string) {
    const subs = localSubs.get(queue)
    if (!subs || subs.size === 0) {
        return 0
    }
    let delivered = 0
    for (const send of subs) {
        try {
            send(message)
            delivered++
        } catch {}
    }
    return delivered
}
