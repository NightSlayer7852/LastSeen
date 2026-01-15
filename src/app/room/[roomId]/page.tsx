"use client";
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { client } from '@/lib/client';
import { useUsername } from '@/hooks/useUsername';
import { format } from 'date-fns';
import { useRealtime } from '@/lib/realtime-client';
import {useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const router = useRouter();
    const params = useParams();
    const roomId = params.roomId as string;
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [input, setInput] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { username } = useUsername();
    const [copyText, setCopyText] = useState("COPY");
    const base = typeof window === "undefined" ? "" : window.location.origin;
    

    const {data : ttlData} = useQuery({
        queryKey: ['ttl', roomId],
        queryFn: async () => {
            const res = await client.room.ttl.get({ query: { roomId } });
            return res.data;
        },
    })
    useEffect(() => {
        if (ttlData?.ttl !== undefined) {
            setTimeRemaining(ttlData.ttl);
        }
    }, [ttlData]);
    useEffect(() => {
        if (timeRemaining === null) return;
        if (timeRemaining <= 0) {
            router.push('/?destroyed=true');
            return;
        }
        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeRemaining, router]);


    const {data : messages, refetch} = useQuery({
        queryKey: ['messages', roomId],
        queryFn: async () => {
            const res = await client.messages.get({ query: { roomId } });
            return res.data;
        }
    })

    const { mutate: sendMessage, isPending } = useMutation({
        mutationFn: async ({ text }: { text: string }) => {
            await client.messages.post(
                {
                    sender: username,
                    text,
                },
                { query: { roomId } }
            );
        }
    });

    const { mutate: destroyRoom } = useMutation({
        mutationFn: async () => {
            await client.room.delete({}, { query: { roomId } });
        },
        onSuccess: () => {
            router.push('/?destroyed=true');
        }
    });

    useRealtime({
        channels: [roomId], 
        events: ['chat.message', 'chat.destroy'],
        onData: ({ event }: { event: string }) => {
            if (event === 'chat.message') { 
                refetch();
            }

            if (event === 'chat.destroy') {
                router.push('/?destroyed=true');
            }
        }
    });

    return <main className='flex flex-col h-screen max-h-screen overflow-hidden'>
        <header className='border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30 backdrop-blur-md'>
            <div className='flex items-center gap-4'>
                <div className='flex flex-col'>
                    <span className='text-xs text-zinc-500 uppercase' >Room ID</span>
                    <div className='flex items-center'>
                        <span className='text-md text-green-500'>{roomId}</span>
                        <button className='ml-2 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded px-2 py-1 cursor-pointer' onClick={() => { navigator.clipboard.writeText(`${base}/room/${roomId}`); setCopyText("COPIED"); setTimeout(() => setCopyText("COPY"), 2000); }}>{copyText}</button>        
                    </div>
                </div>

                <div className='h-8 w-px bg-zinc-800'></div>
                <div className='flex flex-col items-center'>
                    <span className='text-xs text-zinc-500 uppercase' >Self-destruct</span>
                    <span className={`flex items-center text-sm font-bold gap-2 ${timeRemaining !== null && timeRemaining < 60 ? 'text-red-500' : 'text-amber-500'}`}>
                        {timeRemaining !== null ? `${Math.floor(timeRemaining / 60)}:${timeRemaining % 60}` : '--:--'}
                    </span>
                </div>

                <button onClick={() => destroyRoom()} className='text-xs text-zinc-500 hover:bg-red-500 hover:text-white bg-zinc-800 rounded px-2 py-1 uppercase cursor-pointer'>Destroy Now</button>
            </div>
        </header>
{/* messages */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar thin">
            {messages?.messages.length == 0 && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-zinc-600 text-sm font-mono ">No messages yet, start the conversation!</p>
                </div >)
            }
            {messages?.messages.map((message) => (
                <div key={message.id} className="flex flex-col items-start">
                    <div className='max-w-[80%] group'>
                        <div className='flex items-baseline gap-3 mb-1'>
                            <span className={`text-xs font-bold ${message.sender === username ? 'text-green-500' : 'text-blue-400'}`}>{message.sender === username ? "You" : message.sender}</span>
                            <span className="text-[10px] text-zinc-600">{format(message.timestamp, "HH:mm")}</span>
                        </div>
                        <span className={`text-xs font-mono text-zinc-300`}>{message.text}</span>
                    </div>
                </div>))}
        </div>

        {/* Input */}
        <div className='border-t border-zinc-800 p-4 bg-zinc-900/30 backdrop-blur-md'>
            <div className='flex items-center gap-4'>
                <div className='flex-1 relative group'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-green-500 animate-pulse'>{">"}</span>
                    <input autoFocus type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder='Type message...' onKeyDown={(e) => {
                        if (e.key === 'Enter' && input.trim().length > 0) {
                            e.preventDefault();
                            sendMessage({ text: input });
                            inputRef.current?.focus();
                            setInput('');
                     } } } className='w-full bg-black rounded py-2 focus:outline-none placeholder:text-zinc-700 text-sm pl-8 pr-4 text-zinc-400' />
                </div>
                <button onClick= {() => { sendMessage({ text : input}); inputRef.current?.focus(); setInput(''); }} disabled = {input.trim().length === 0 || isPending} className=' text-white bg-zinc-800 hover:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed pointer-cursor px-6 py-2 text-sm ' >SEND</button>
            </div>
        </div>
    </main>
}