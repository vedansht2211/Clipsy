import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";

export async function GET() {

  try {

    const client = await clientPromise;

    const db = client.db("myApp");

    const rooms = await db.collection("rooms").find().toArray();

    const now = new Date();

    for (const room of rooms) {

      const lastActivity = new Date(room.lastActivity);

      const diff =
        now.getTime() - lastActivity.getTime();

      // 5 MINUTES
      if (diff > 5 * 60 * 1000) {

        // DELETE FILE IF EXISTS
        if (room.fileId) {

          const bucket = new GridFSBucket(db);

          await bucket.delete(
            new ObjectId(room.fileId)
          );
        }

        // DELETE ROOM
        await db.collection("rooms").deleteOne({
          _id: room._id,
        });

        console.log(
          `Deleted inactive room: ${room.code}`
        );
      }
    }

    return Response.json({
      message: "Cleanup completed",
    });

  } catch (err) {

    console.log(err);

    return Response.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}