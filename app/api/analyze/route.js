import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/mongodb";

// Vercel will pull these from your Project Settings
const FINNHUB_KEY = process.env.FINNHUB_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY; 

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase() || 'AAPL';
  try {
    const now = Math.floor(Date.now() / 1000);
    const start = now - (14 * 24 * 60 * 60); 
    const [quoteRes, newsRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`),
      fetch(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=2026-01-15&to=2026-02-01&token=${FINNHUB_KEY}`)
    ]);
    const q = await quoteRes.json();
    const n = await newsRes.json();
    return NextResponse.json({
      ticker,
      price: q.c || 0,
      change: q.dp || 0,
      news: n.slice(0, 5).map(i => ({ headline: i.headline }))
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Analyze ${body.ticker} ($${body.price}). News: ${body.news.map(n => n.headline).join(", ")}. Give 5 jot notes, 3 sentences each. Friendly mentor tone.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    try {
      const client = await clientPromise;
      const db = client.db("delta_db");
      await db.collection("history").insertOne({
        ticker: body.ticker, price: body.price, analysis: text, timestamp: new Date()
      });
    } catch (dbE) { console.error("DB Save Skip"); }

    return NextResponse.json({ analysis: text });
  } catch (e) {
    return NextResponse.json({ analysis: "AI is thinking. Try in 10s." });
  }
}