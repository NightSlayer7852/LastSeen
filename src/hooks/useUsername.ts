import { useEffect, useState } from "react";
import { nanoid } from "nanoid";


const ANIMALS = [ "lion", "tiger", "bear", "eagle", "shark", "wolf", "fox", "owl", "panda", "zebra" ];
const STORAGE_KEY = "userName";

const generateUserName = () => {
  const word = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `anonymous-${word}-${nanoid(5)}`;
}
export const useUsername = () => {
    const [username, setUsername] = useState("");
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setUsername(stored);
            return;
        }
        const generate = generateUserName();
        localStorage.setItem(STORAGE_KEY, generate);
        setUsername(generate);
    }, []);
    return {username};
}