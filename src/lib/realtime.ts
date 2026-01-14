import { z } from 'zod'
import { Realtime, InferRealtimeEvents } from '@upstash/realtime'
import { redis } from '@/lib/redis'

const message = z.object({
    id: z.string(),
    sender: z.string(),
    text: z.string().min(1),
    timestamp: z.number(),
    roomId: z.string(),
    token: z.string().optional()
})
const schema = {
    chat: {
        message,
        destroy: z.object({
            isDestroyed: z.literal(true),
        })


    }
}

export const realtime = new Realtime({ schema, redis })
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>
export type Message = z.infer<typeof message>