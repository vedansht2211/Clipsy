"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function RoomContent() {
    const uploadFile = async () => {

        if (!selectedFile) {
            alert("Please select a file");
            return;
        }

        const formData = new FormData();

        formData.append("file", selectedFile);
        formData.append("code", roomCode || "");

        const res = await fetch("/api/rooms/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        alert("File uploaded");

        fetchRoomData();
    };
    const deleteFile = async () => {

        const res = await fetch("/api/rooms/delete-file", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                code: roomCode,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        alert("File deleted");

        setRoomFile(null);

        fetchRoomData();
    };


    const [roomFile, setRoomFile] = useState<string | null>(null);


    const fetchRoomData = async () => {
        if (!roomCode) return;
        const res = await fetch(`/api/rooms/join?code=${roomCode}`);
        const data = await res.json();
        setText(data.text);
        setRoomFile(data.fileName);
    }
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter();
    const [text, setText] = useState("");
    const searchParams = useSearchParams();
    const roomCode = searchParams.get("code");
    useEffect(() => {
    if (roomCode) {
            fetchRoomData();
        }
    }, [roomCode]);
  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center bg-black-900 gap-6">
        <h1 className="text-3xl font-bold text-white">Room Code - {roomCode}</h1>
        <div className="w-full max-w-4xl flex gap-4">

            <div className="flex-1 h-150  p-6 rounded-xl shadow-md bg-cyan-400/10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Text</h2>

                <button 
                onClick={fetchRoomData}
                className="px-3 py-1 bg-white text-black rounded-full shadow-md hover:scale-105 transition border border-black">
                Refresh
                </button>
            </div>

                <ReactMarkdown>
                    {text}
                </ReactMarkdown>
                <div className="flex flex-row justify-center">
                <button
                onClick={async () => {
                    await fetch("/api/rooms/join", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            action: "saveText",
                            code: roomCode,
                            text: text,
                        }),
                    });
                }}
                className="px-3 py-1 text-white rounded-full shadow-md hover:scale-105 transition border border-white">
                    Save
                </button>
            </div>
            </div>
            

            <div className="flex-1 bg-cyan-400/10 p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Files</h2>

                <button 
                onClick={fetchRoomData}
                className="px-3 py-1 bg-black text-white rounded-full shadow-md hover:scale-105 transition border border-white">
                Refresh
                </button>
            </div>

            <div className="flex flex-col h-120 border rounded-md p-2">

                <div className="mt-auto flex flex-col items-center gap-4">

                    <input
                        className="text-white rounded-md px-4 py-2 cursor-pointer"
                        type="file"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setSelectedFile(e.target.files[0]);
                            }
                        }}
                    />
                    {roomFile && (
                        <div className="flex flex-row gap-4 text-sm border p-2 rounded-md bg-black text-white">
                            {roomFile}
                            <button
                                onClick={() => {
                                    window.open(
                                        `/api/rooms/download?code=${roomCode}`,
                                        "_blank"
                                    );
                                }}
                                disabled={roomFile === null}
                                className="px-4 py-2 bg-cyan-400/10 text-white rounded-full border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                🡇
                            </button>
                            <button
                                onClick={deleteFile}
                                disabled={roomFile === null}
                                className="px-4 py-2 bg-red-600 text-white rounded-full border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                🗑
                            </button>

                        </div>
                    )}

                    {selectedFile && (
                        <div className="text-sm border p-2 rounded-md bg-white text-black">
                            Selected: {selectedFile.name}
                        </div>
                    )}

                    <div className="flex justify-center gap-4">
                        <button 
                            onClick={uploadFile}
                            disabled={roomFile !== null}
                            className="px-4 py-2 bg-gray-500 text-white rounded-full  hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            Upload File
                        </button>
                    </div>

                </div>

            </div>
            </div>

        </div>
        <button 
        onClick={()=>{router.push("/");}}
        className="px-3 py-1 bg-red-600 text-white rounded-full shadow-md hover:scale-105 transition border border-white">
            Leave Room
        </button>

        </div>
  );
}