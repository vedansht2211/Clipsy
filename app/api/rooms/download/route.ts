import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);

    const code = searchParams.get("code");

    const client = await clientPromise;

    const db = client.db("myApp");

    const room = await db.collection("rooms").findOne({ code });

    if (!room || !room.fileId) {
      return new Response("No file found", {
        status: 404,
      });
    }

    const bucket = new GridFSBucket(db);

    const downloadStream = bucket.openDownloadStream(
      new ObjectId(room.fileId)
    );

    const chunks: Uint8Array[] = [];

    return await new Promise((resolve, reject) => {

      downloadStream.on("data", (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on("error", reject);

      downloadStream.on("end", () => {

        const buffer = Buffer.concat(chunks);

        resolve(
          new Response(buffer, {
            headers: {
              "Content-Disposition":
                `attachment; filename="${room.fileName}"`,
              "Content-Type": "application/octet-stream",
            },
          })
        );

      });

    });

  } catch (err) {

    console.log(err);

    return new Response("Download failed", {
      status: 500,
    });
  }
}