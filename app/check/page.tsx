'use client';
import { useState } from 'react';
import { RULES } from '../../lib/rules';         
import { analyzeText } from '../../lib/analyzer';
import { LeafIndicator } from '../../components/LeafIndicator';

export default function CheckPage() {
  const [text, setText] = useState('');
  const [report, setReport] = useState<ReturnType<typeof analyzeText> | null>(null);

  function run() {
    const r = analyzeText(text, RULES);
    setReport(r);
  }

  const state: 'red' | 'yellow' | 'green' =
    !report ? 'yellow' : report.score >= 75 ? 'green' : report.score >= 40 ? 'yellow' : 'red';

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Green Check por Normas (protótipo)</h1>

      <textarea
        className="w-full h-56 p-3 rounded-xl bg-neutral-900 border border-neutral-800"
        placeholder="Cole aqui o texto do ETP/TR/Edital…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={run}
        disabled={!text}
        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
      >
        Avaliar
      </button>

      {report && (
        <div className="grid gap-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 flex items-center gap-3">
            <LeafIndicator state={state} />
            <div className="font-medium">Score: {report.score}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-neutral-800 rounded-xl overflow-hidden">
              <thead className="bg-neutral-900">
                <tr>
                  <th className="text-left p-2">Norma</th>
                  <th className="text-left p-2">Evidências</th>
                  <th className="text-left p-2">Comentário</th>
                  <th className="text-left p-2">Severidade</th>
                </tr>
              </thead>
              <tbody>
                {report.findings.map((f) => (
                  <tr key={f.ruleId} className="border-t border-neutral-800 align-top">
                    <td className="p-2">{f.title}</td>
                    <td className="p-2 text-neutral-300">
                      {f.matched ? (f.evidence.join(', ') || '—') : '—'}
                    </td>
                    <td className="p-2">{f.comment}</td>
                    <td className="p-2">
                      {f.matched ? 'OK' : f.severity === 'high' ? 'ALTA' : f.severity === 'warn' ? 'MÉDIA' : 'INFO'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-neutral-400">
            *Este resultado é indicativo e depende do texto fornecido. Revise as normas aplicáveis e consulte sua
            assessoria jurídica antes de decidir.
          </p>
        </div>
      )}
    </div>
  );
}
