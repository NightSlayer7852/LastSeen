import { Elysia } from 'elysia'
import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'

const ROOM_TTL_SECONDS = 60 * 10

const room = new Elysia({ prefix: '/room' }).post('/create', async () => {
    const roomId = nanoid(10)

    await redis.hset(`room:${roomId}`, {
        connected: [],
        createdAt: Date.now()
    })
    await redis.expire(`room:${roomId}`, ROOM_TTL_SECONDS)
    return { roomId }
})



const app = new Elysia({ prefix: '/api' })
    .get('/', 'Hello Nextjs').use(room)

export const GET = app.fetch
export const POST = app.fetch

export type App = typeof app