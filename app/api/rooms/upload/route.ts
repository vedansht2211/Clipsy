import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {

    const formData = await req.formData();

    const file = formData.get("file") as File;
    const code = formData.get("code") as string;

    if (!file || !code) {
      return Response.json(
        { error: "Missing file or room code" },
        { status: 400 }
      );
    }

    // 2MB LIMIT
    if (file.size > 2 * 1024 * 1024) {
      return Response.json(
        { error: "File exceeds 2MB limit" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db("myApp");

    const room = await db.collection("rooms").findOne({ code });

    if (!room) {
      return Response.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // ONLY ONE FILE PER ROOM
    if (room.fileId) {
      return Response.json(
        { error: "Room already has a file" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const bucket = new GridFSBucket(db);

    const uploadStream = bucket.openUploadStream(file.name);

    uploadStream.end(buffer);

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    await db.collection("rooms").updateOne(
      { code },
      {
        $set: {
          fileId: uploadStream.id,
          fileName: file.name,
          lastActivity: new Date(),
        },
      }
    );

    return Response.json({
      message: "File uploaded",
      fileName: file.name,
    });

  } catch (err) {

    console.log(err);

    return Response.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}