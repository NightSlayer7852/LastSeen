"use client";
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { client } from '@/lib/client';
import { useUsername } from '@/hooks/useUsername';
export default function Page() {
    const params = useParams();
    const roomId = params.roomId as string;
    const [timeRemainin, setTimeRemaining] = useState<number | null>(21);
    const [input, setInput] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { username } = useUsername();

    const { mutate: sendMessage, isPending } = useMutation({
        mutationFn: async ({ text }: { text: string }) => {
            await client.messages.post(
                {
                    sender: username,
                    text,
                },
                { query: { roomId } }
            );
        },
    });


    return <main className='flex flex-col h-screen max-h-screen overflow-hidden'>
        <header className='border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30 backdrop-blur-md'>
            <div className='flex items-center gap-4'>
                <div className='flex flex-col'>
                    <span className='text-xs text-zinc-500 uppercase' >Room ID</span>
                    <div className='flex items-center'>
                        <span className='text-md text-green-500'>{roomId}</span>
                        <button className='ml-2 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded px-2 py-1' onClick={() => { navigator.clipboard.writeText(roomId) }}>Copy</button>
                    
                    </div>
                </div>

                <div className='h-8 w-px bg-zinc-800'></div>
                <div className='flex flex-col items-center'>
                    <span className='text-xs text-zinc-500 uppercase' >Self-destruct</span>
                    <span className={`flex items-center text-sm font-bold gap-2 ${timeRemainin !== null && timeRemainin < 60 ? 'text-red-500' : 'text-amber-500'}`}>
                        {timeRemainin !== null ? `${Math.floor(timeRemainin / 60)}:${timeRemainin % 60}` : '--:--'}
                    </span>
                </div>

                <button className='text-xs text-zinc-500 hover:bg-red-500 hover:text-white bg-zinc-800 rounded px-2 py-1 uppercase'>Destroy Now</button>
            </div>
        </header>


        <div className='flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin'></div>
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