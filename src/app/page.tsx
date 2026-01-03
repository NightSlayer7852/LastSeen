"use client";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { client } from "../lib/client";

const ANIMALS = [ "lion", "tiger", "bear", "eagle", "shark", "wolf", "fox", "owl", "panda", "zebra" ];
const STORAGE_KEY = "userName";

const generateUserName = () => {
  const word = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `anonymous-${word}-${nanoid(5)}`;
}

export default function Home() {
  const [userName, setUserName] = useState("");
  const router = useRouter();
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUserName(stored);
      return;
    }
    const generate = generateUserName();
    localStorage.setItem(STORAGE_KEY, generate);
    setUserName(generate);
  }, []);


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
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-bold tracking-tight text-green-500">private_chat</h1>
          <p className="text-zinc-500">A private, self-destructing chat room</p>
        </div>
        
        <div className="border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
          <div className="space-y-5 p-4">
            <div className="space-y-2">
            <label className="flex items-center text-zinc-500"> Your Identity </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-950 border border-zinc-800 text-sm text-zinc-400 font-mono p-2">{userName}</div>
            </div>
          </div> 

          <button onClick={() => createRoom()} className="w-full bg-zinc-100 text-black p-3 text-sm font-bold hover:bg-zinc-50 hover:text-black transition-colors mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Create Secure Room</button>
        </div>
      </div>
        
      </div>
    </main>
  );
}
