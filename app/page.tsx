"use client";
import Image from "next/image";
import {useRouter} from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  useEffect(() => {
        fetch("/api/cleanup");},
        []);
  const [showModal, setShowModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-50 bg-white dark:bg-cyan-400/10">
        
        <div className="flex flex-col items-center gap-6 text-center">
          
            <h1 className="max-w-xs text-center text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Clipsy
            </h1>
          
          <p className="max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Share your clipboard with anyone, anywhere, anytime. No sign-up required.
          </p>
        </div>
        <div className="flex flex-col gap-6 text-base mb-1 font-medium sm:flex-col">
          <button 
            onClick={async () => {

              setLoading(true);

              try {

                const res = await fetch("/api/rooms/join", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    action: "create",
                  }),
                });

                const data = await res.json();

                router.push(`/room?code=${data.code}`);

              } catch (err) {
                console.log(err);
                alert("Failed to create room");
              } finally {
                setLoading(false);
              }

            }}
            className="px-15 py-10 bg-black text-white rounded-full shadow-md hover:scale-105 transition cursor-pointer">
              
            {loading ? "Creating..." : "Create Room"}
          </button>
          <button 
          onClick={()=>setShowModal(true)}
          className="px-15 py-10 bg-white text-black rounded-full shadow-md hover:scale-105 transition cursor-pointer">
            Join Room
          </button>

          <div className={`fixed inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${showModal ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <div className={`bg-black p-6 rounded-xl w-80 transform transition-all duration-300 ${showModal ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}>
                <h2 className="text-xl font-semibold mb-4">
                  Enter Room Code

                </h2>
                <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e)=>setRoomCode(e.target.value)}
                className="w-full border px-3 py-2 rounded-md mb-4 bg-black-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-4">
                  <button
                  onClick={async()=>{
                    const res = await fetch("/api/rooms/join",{
                      method:"POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({action: "join", code:roomCode})
                    });
                    const data= await res.json();
                    if(!res.ok){
                      alert(data.error);
                      return;
                    }
                    router.push(`/room?code=${roomCode}`);
                  }}
                  className="w-full bg-red-500 text-black py-2 rounded-full"
                  >
                  Join

                  </button>
                  <button
                  onClick={()=>setShowModal(false)}
                  className="w-full bg-red-500 text-black py-2 rounded-full"
                  >
                  Close

                  </button>
                  
                </div>
              </div>
            
            </div>
          </div>
        
      </main>
    </div>
    
  );
}
