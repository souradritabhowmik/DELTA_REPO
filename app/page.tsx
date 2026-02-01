"use client";
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Page() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState<any>(null);
  const [ai, setAi] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history when the app starts
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const d = await res.json();
        setHistory(d);
      }
    } catch (e) { console.error("History failed to load"); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const execute = async () => {
    if (!ticker) return;
    setLoading(true);
    setAi("");
    try {
      const res = await fetch(`/api/analyze?ticker=${ticker}`);
      const d = await res.json();
      setData(d);
      const aiRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ticker: d.ticker, 
          price: d.price, 
          news: d.news, 
          change: d.change 
        }),
      });
      const aiD = await aiRes.json();
      setAi(aiD.analysis);
      fetchHistory(); // Refresh the list after saving new data
    } catch (e) { 
      setAi("connection dropped. please try again."); 
    }
    setLoading(false);
  };

  const loadFromHistory = (item: any) => {
    setData({
      ticker: item.ticker,
      price: item.price,
      change: item.change || 0,
      news: [] // We don't save full news arrays to keep DB small
    });
    setAi(item.analysis);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-black font-sans lowercase pb-10 px-8 relative overflow-x-hidden">
      <style>{`
        @keyframes floatGlow {
          0%, 100% { transform: translateY(0px); box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
          50% { 
            transform: translateY(-15px); 
            box-shadow: 0 25px 50px rgba(0,0,0,0.08), 0 0 20px rgba(255,255,255,0.6); 
            border-color: rgba(255,255,255,0.8);
          }
        }
        .glow-card { animation: floatGlow 6s ease-in-out infinite; background: #e5e5e5; border: 1px solid rgba(255,255,255,0.4); }
        .sidebar-anim { transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* History Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white/90 backdrop-blur-md shadow-2xl z-50 p-10 sidebar-anim ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-12">
          <h3 className="text-2xl font-black uppercase tracking-tighter italic">history</h3>
          <button onClick={() => setShowHistory(false)} className="text-[10px] font-bold uppercase opacity-30 hover:opacity-100">close</button>
        </div>
        <div className="space-y-6 overflow-y-auto h-[75vh] scrollbar-hide">
          {history.length === 0 && <p className="opacity-20 italic">no stories saved yet.</p>}
          {history.map((item, i) => (
            <button 
              key={i} 
              onClick={() => loadFromHistory(item)}
              className="w-full text-left p-6 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group"
            >
              <p className="text-2xl font-black uppercase tracking-tighter group-hover:tracking-normal transition-all">{item.ticker}</p>
              <p className="text-xs font-bold opacity-30">{new Date(item.timestamp).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </div>

      <header className="max-w-[1400px] mx-auto py-12 border-b border-gray-300 mb-12 flex justify-between items-start">
        <div>
          <button 
            onClick={() => setShowHistory(true)}
            className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-all mb-4 block"
          >
            ● view past stories with MongoDB
          </button>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">delta</h1>
          <p className="text-base font-bold opacity-50 mt-2 tracking-tight">{`simplifying finance: the story behind the charts.`}</p>
        </div>
        
        <div className="flex bg-white/60 p-2 rounded-2xl border border-gray-300 self-center shadow-inner">
          <input 
            placeholder="ticker" className="bg-transparent px-5 py-2 outline-none w-36 text-xl font-bold"
            value={ticker} onChange={(e) => setTicker(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && execute()}
          />
          <button onClick={execute} className="bg-white px-8 py-2 rounded-xl text-sm font-black uppercase shadow-sm active:scale-95 transition-all">
            {loading ? "..." : "go"}
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        
        {/* Left Card */}
        <div className="glow-card p-12 rounded-[3rem] flex flex-col justify-between h-[650px]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-9xl font-black uppercase tracking-tighter leading-none">{`${data?.ticker || "---"}`}</h2>
              <div className="text-right">
                <p className="text-5xl font-bold">{`$${data?.price?.toFixed(2) || "0.00"}`}</p>
                <p className={`text-2xl font-black mt-1 ${data?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {`${data?.change >= 0 ? '+' : ''}${data?.change?.toFixed(2) || "0.00"}%`}
                </p>
              </div>
            </div>
            <div className="w-full h-40 bg-white/20 rounded-3xl flex items-center justify-center mb-10 border border-white/10 overflow-hidden shadow-inner">
               <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full px-8">
                 <polyline fill="none" stroke="black" strokeWidth="7" strokeLinejoin="round" points="0,140 150,120 300,160 450,70 600,110 800,30 1000,60" />
               </svg>
            </div>
          </div>

          <div className="space-y-6 flex-grow overflow-hidden">
            <p className="text-xs font-black uppercase opacity-40 tracking-[0.2em] border-b border-black/10 pb-2">{`real-time market stimuli`}</p>
            <div className="space-y-5">
              {data?.news?.length > 0 ? data.news.slice(0, 3).map((n: any, i: number) => (
                <p key={i} className="text-xl font-bold leading-snug italic border-l-4 border-black pl-6 py-1">{`${n.headline.toLowerCase()}`}</p>
              )) : <p className="text-xl font-bold italic opacity-10">no recent news for this entry.</p>}
            </div>
          </div>
          <p className="text-[10px] font-black uppercase opacity-20 tracking-widest mt-6">{`verified financial data feed`}</p>
        </div>

        {/* Right Card */}
        <div className="glow-card p-12 rounded-[3rem] [animation-delay:0.8s] flex flex-col h-[650px]">
          <h3 className="text-xs font-black uppercase opacity-40 tracking-[0.2em] border-b border-black/10 pb-2 mb-8">{`mentor breakdown`}</h3>
          <div className="flex-grow overflow-y-auto pr-4 scrollbar-hide">
            {loading ? (
              <p className="animate-pulse text-2xl font-bold text-gray-400">{`decoding the story behind the numbers...`}</p>
            ) : (
              <div className="prose prose-2xl prose-zinc max-w-none text-black leading-[2.1] font-medium">
                <ReactMarkdown>{ai || "enter a ticker to reveal the story."}</ReactMarkdown>
              </div>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-black/5">
            <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">{`simplified literacy engine v3.0`}</p>
          </div>
        </div>
      </main>
    </div>
  );
}