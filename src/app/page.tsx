"use client";
import { useUsername } from "@/hooks/useUsername";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { client } from "../lib/client";



export default function Home() {
  const { username } = useUsername();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wasDestroyed = searchParams.get("destroyed") === "true";
  const error = searchParams.get("error");

  const {mutate: createRoom} = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post();
      if (res.status === 200) {
        router.push(`/room/${res.data?.roomId}`);
      }
    },
  })
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">

        {wasDestroyed && (
          <div className="p-4 bg-red-950/50 border border-red-900 text-center">
            <p className="text-red-500 text-sm font-bold">Your chat room has been destroyed successfully.</p>
            <p className="text-zinc-500 text-sm mt-1">All messages were deleted permanently.</p>

          </div>
        )}
        {error === "room_not_found" && (
          <div className="p-4 bg-red-950/50 border border-red-900 text-center">
            <p className="text-red-500 text-sm font-bold">ROOM NOT FOUND</p>
            <p className="text-zinc-500 text-sm mt-1">This room may have expired or never existed</p>

          </div>
        )}
        {error === "room_full" && (
          <div className="p-4 bg-red-950/50 border border-red-900 text-center">
            <p className="text-red-500 text-sm font-bold">ROOM FULL</p>
            <p className="text-zinc-500 text-sm mt-1">This room is at maximum capacity.</p>

          </div>
        )}
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold tracking-tight text-green-500">last_seen</h1>
          <p className="text-zinc-500">A private, self-destructing chat room</p>
        </div>
        
        <div className="border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
          <div className="space-y-5 p-4">
            <div className="space-y-2">
            <label className="flex items-center text-zinc-500"> Your Identity </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-950 border border-zinc-800 text-sm text-zinc-400 font-mono p-2">{username}</div>
            </div>
          </div> 

          <button onClick={() => createRoom()} className="w-full bg-zinc-100 text-black p-3 text-sm font-bold hover:bg-zinc-50 hover:text-black transition-colors mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Create Secure Room</button>
        </div>
      </div>
        
      </div>
    </main>
  );
}
