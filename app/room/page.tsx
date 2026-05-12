import { Suspense } from "react";
import RoomClient from "./RoomClient";

export const dynamic = "force-dynamic";

export default function RoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomClient />
    </Suspense>
  );
}