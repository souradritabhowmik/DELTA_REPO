import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("delta_db");
    
    // Fetch the 10 most recent analyses from your 'history' collection
    const history = await db.collection("history")
      .find({})
      .sort({ timestamp: -1 }) // Newest first
      .limit(10)
      .toArray();

    return NextResponse.json(history);
  } catch (e) {
    console.error("Database fetch error:", e);
    return NextResponse.json({ error: "Could not load history" }, { status: 500 });
  }
}
