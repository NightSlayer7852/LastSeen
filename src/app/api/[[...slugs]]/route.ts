import { Elysia } from 'elysia'
import { nanoid } from 'nanoid'
import { redis } from '@/lib/redis'
import { authMiddleware } from './auth'
import { z } from 'zod'
import { Message } from '@/lib/realtime'
import { realtime } from '@/lib/realtime'

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

const messages = new Elysia({ prefix: "/messages" }).use(authMiddleware).post('/', async ({ body, auth }) => {
    const { sender, text } = body;
    const { roomId } = auth;
    const roomExists = await redis.exists(`room:${roomId}`);
    if (!roomExists) {
        return { error: "Room does not exist" };
    }
    const message:Message = {
        id: nanoid(),
        sender,
        text,
        timestamp: Date.now(),
        roomId,
    };

    await redis.rpush(`messages:${roomId}`, { ...message, token: auth.token });
    await realtime.channel(roomId).emit('chat.message', message);

    const remaining = await redis.ttl(`room:${roomId}`);
    await redis.expire(`messages:${roomId}`, remaining);
    await redis.expire(`history:${roomId}`, remaining);
    await redis.expire(roomId, remaining);
}, {
    query: z.object({
        roomId: z.string().min(10).max(10)
    }),
    body : z.object({
        sender: z.string().max(100),
        text: z.string().min(1000)
    }),}
)

const app = new Elysia({ prefix: '/api' }).use(room).use(messages)

export const GET = app.fetch
export const POST = app.fetch

export type App = typeof app