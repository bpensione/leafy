'use client';
import { useState, useRef } from 'react';
import { LeafIndicator } from '@/components/LeafIndicator';

// Carregamos dinamicamente o pdf.js só no cliente
const pdfjsLibPromise = import('pdfjs-dist/build/pdf.mjs');
const pdfjsWorkerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.min.mjs`;

export default function CheckPage() {
  const [text, setText] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [state, setState] = useState<'red' | 'yellow' | 'green'>('yellow');
  const [loading, setLoading] = useState(false);
  const [pagesInfo, setPagesInfo] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function extractPdfText(file: File) {
    setLoading(true);
    setScore(null);
    setPagesInfo('');
    try {
      const { getDocument, GlobalWorkerOptions } = await pdfjsLibPromise;
      GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

      const buf = await file.arrayBuffer();
      const pdf = await getDocument({ data: buf }).promise;

      let out = '';
      const maxPages = Math.min(pdf.numPages, 30); // limite de segurança
      for (let p = 1; p <= maxPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const pageText = content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ');
        out += `\n\n--- Página ${p} ---\n` + pageText;
      }
      setPagesInfo(`PDF lido: ${pdf.numPages} páginas (processadas: ${maxPages}).`);
      setText(out.trim());
    } catch (e) {
      console.error(e);
      alert('Falha ao ler o PDF. Verifique se o arquivo não está protegido por senha.');
    } finally {
      setLoading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') extractPdfText(f);
  }

  function runMock() {
    const hits = ['FISPQ', 'MTR', 'meta', 'equivalência']
      .reduce((acc, k) => acc + (text.toLowerCase().includes(k.toLowerCase()) ? 1 : 0), 0);
    const s = Math.round((hits / 4) * 100);
    setScore(s);
    setState(s >= 75 ? 'green' : s >= 40 ? 'yellow' : 'red');
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Green Check (PDF ou texto)</h1>

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="block text-sm"
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700"
        >
          Escolher PDF
        </button>
      </div>

      {loading && <div className="text-sm text-neutral-400">Lendo PDF…</div>}
      {pagesInfo && <div className="text-sm text-neutral-400">{pagesInfo}</div>}

      <textarea
        className="w-full h-56 p-3 rounded-xl bg-neutral-900 border border-neutral-800"
        placeholder="Cole texto do ETP/TR/Edital ou carregue um PDF"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={runMock}
        disabled={!text}
        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
      >
        Avaliar
      </button>

      {score !== null && (
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40">
          <div className="flex items-center gap-3 mb-2">
            <LeafIndicator state={state} />
            <div className="font-medium">Score: {score}</div>
          </div>
          <p className="text-neutral-300 text-sm">
            *Demo: procura por FISPQ, MTR, meta, equivalência. (Texto extraído do PDF aparece acima)
          </p>
        </div>
      )}
    </div>
  );
}
