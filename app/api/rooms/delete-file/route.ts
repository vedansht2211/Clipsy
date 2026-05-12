import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const code = body.code;

    const client = await clientPromise;

    const db = client.db("myApp");

    const room = await db.collection("rooms").findOne({ code });

    if (!room || !room.fileId) {
      return Response.json(
        { error: "No file found" },
        { status: 404 }
      );
    }

    const bucket = new GridFSBucket(db);

    await bucket.delete(new ObjectId(room.fileId));

    await db.collection("rooms").updateOne(
      { code },
      {
        $set: {
          fileId: null,
          fileName: null,
          lastActivity: new Date(),
        },
      }
    );

    return Response.json({
      message: "File deleted",
    });

  } catch (err) {

    console.log(err);

    return Response.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}