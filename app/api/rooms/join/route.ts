import clientPromise from "@/lib/mongodb";

async function generateCode(db: any) {
  let code = "";
  let exists = true;

  while (exists) {
    code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const room = await db.collection("rooms").findOne({ code });

    if (!room) {
      exists = false;
    }
  }

  return code;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("myApp");

    // CREATE ROOM
    if (body.action === "create") {

      const code = await generateCode(db);
      lastActivity: new Date(),

      await db.collection("rooms").insertOne({
        code: code,
        users: [],
        text: "",
        fileId: null,
        fileName: null,
        createdAt: new Date(),
        lastActivity: new Date(),
      });

      return Response.json({ code });
    }

    // SAVE TEXT
    if (body.action === "saveText") {
      await db.collection("rooms").updateOne(
        { code: body.code },
        {
          $set: {
            text: body.text,
            lastActivity: new Date(),
          },
        }
      );

      return Response.json({
        message: "Text saved",
      });
    }
    // JOIN ROOM
    if (body.action === "join") {

      const room = await db.collection("rooms").findOne({
        code: body.code,
      });

      if (!room) {

        return Response.json(
          { error: "Room not found" },
          { status: 404 }
        );
      }

      return Response.json({
        message: "Room exists",
      });
    }

    return Response.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (err) {
    console.log(err);

    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const code = searchParams.get("code");

    const client = await clientPromise;
    const db = client.db("myApp");

    const room = await db.collection("rooms").findOne({ code });

    if (!room) {
      return Response.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return Response.json({
      text: room.text,
      fileName: room.fileName,
    });

  } catch (err) {
    console.log(err);

    return Response.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}