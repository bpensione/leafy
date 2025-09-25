'use client';
import { useState } from 'react';
import { LeafIndicator } from '@/components/LeafIndicator';

export default function CheckPage() {
  const [text, setText] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [state, setState] = useState<'red' | 'yellow' | 'green'>('yellow');

  function runMock() {
    const hits = ['FISPQ','MTR','meta','equivalência']
      .reduce((acc, k)=> acc + (text.toLowerCase().includes(k.toLowerCase()) ? 1 : 0), 0);
    const s = Math.round((hits/4)*100);
    setScore(s);
    setState(s >= 75 ? 'green' : s >= 40 ? 'yellow' : 'red');
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Green Check (protótipo)</h1>
      <textarea
        className="w-full h-56 p-3 rounded-xl bg-neutral-900 border border-neutral-800"
        placeholder="Cole aqui o texto do ETP/TR/Edital…"
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />
      <button onClick={runMock} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500">
        Avaliar
      </button>
      {score !== null && (
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
          <div className="flex items-center gap-3 mb-2">
            <LeafIndicator state={state} />
            <div className="font-medium">Score: {score}</div>
          </div>
          <p className="text-neutral-300 text-sm">*Demo: procure por FISPQ, MTR, meta, equivalência.</p>
        </div>
      )}
    </div>
  );
}
