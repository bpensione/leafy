'use client';
import { useState } from 'react';
import { LeafIndicator } from '../../components/LeafIndicator'; // mantém este relativo

// --------------------- REGRAS (em linha) ---------------------
type Rule = {
  id: string;
  title: string;
  source: string;
  refs?: { label: string; url?: string }[];
  summary: string;
  patterns: (string | RegExp)[];
  severity: 'info' | 'warn' | 'high';
  weight: number;
  mustHave?: boolean;
};

const RULES: Rule[] = [
  {
    id: 'pnrs-geral',
    title: 'Política Nacional de Resíduos Sólidos (PNRS)',
    source: 'Lei nº 12.305/2010 e Decreto 10.936/2022',
    summary:
      'Verifica menções a PGRS, responsabilidade compartilhada, logística reversa e metas.',
    patterns: [
      /pnrs/i,
      /pol[ií]tica nacional de res[íi]duos/i,
      /plano de gerenciamento de res[íi]duos|pgrs/i,
      /responsabilidade compartilhada/i,
      /log[íi]stica reversa/i,
      /metas? (quantitativas|indicadores?)/i,
    ],
    severity: 'warn',
    weight: 8,
  },
  {
    id: 'mtr',
    title: 'Manifesto de Transporte de Resíduos (MTR)',
    source: 'SINIR / órgãos estaduais',
    summary: 'Exige apresentação de MTR/CDF para transporte e destinação final.',
    patterns: [/(\b)mtr(\b)/i, /manifesto de transporte de res[íi]duos/i, /\bcdf\b/i],
    severity: 'high',
    weight: 9,
    mustHave: true,
  },
  {
    id: 'fispq',
    title: 'FISPQ (produtos químicos)',
    source: 'ABNT NBR 14725',
    summary: 'Para produtos perigosos/químicos, requer FISPQ atualizada e compatível.',
    patterns: [/\bfispq\b/i, /nbr\s*14725/i, /s[aá]ude,? seguran[çc]a/i],
    severity: 'high',
    weight: 8,
  },
  {
    id: 'conama-307',
    title: 'Resíduos da Construção Civil',
    source: 'CONAMA 307/2002',
    summary: 'Classificação de RCD, destinação adequada e triagem.',
    patterns: [/conama\s*307/i, /res[íi]duos da constru[çc][aã]o/i, /aterro classe/i],
    severity: 'warn',
    weight: 6,
  },
  {
    id: 'conama-430',
    title: 'Efluentes Líquidos',
    source: 'CONAMA 430/2011',
    summary: 'Parâmetros para lançamento de efluentes; planos de monitoramento.',
    patterns: [/conama\s*430/i, /efluentes?/i, /lan[çc]amento/i, /monitoramento/i],
    severity: 'warn',
    weight: 5,
  },
  {
    id: 'iso-14001',
    title: 'Sistema de Gestão Ambiental (SGA)',
    source: 'ISO 14001',
    summary: 'Pontua/valida empresas com SGA ISO 14001 (certificação vigente).',
    patterns: [/iso\s*14001/i, /sistema de gest[aã]o ambiental/i, /\bSGA\b/i],
    severity: 'info',
    weight: 3,
  },
];

// --------------------- ANALISADOR (em linha) ---------------------
type Finding = {
  ruleId: string;
  title: string;
  matched: boolean;
  evidence: string[];
  comment: string;
  severity: 'info' | 'warn' | 'high';
  weight: number;
};

type Report = { findings: Finding[]; score: number };

function analyzeText(text: string, rules: Rule[]): Report {
  const findings: Finding[] = [];
  let total = 0;
  let got = 0;
  const normText = text || '';

  for (const r of rules) {
    let evidence: string[] = [];
    let matched = false;

    for (const p of r.patterns) {
      if (typeof p === 'string') {
        if (normText.toLowerCase().includes(p.toLowerCase())) {
          matched = true;
          evidence.push(p);
        }
      } else {
        const m = normText.match(p);
        if (m) {
          matched = true;
          evidence.push(m[0]);
        }
      }
    }

    const comment = matched
      ? `Atende parcialmente/totalmente: ${r.summary}`
      : r.mustHave
      ? `🔴 Ausência de menção exigida: ${r.title}. ${r.summary}`
      : `⚠️ Não identificado: ${r.title}. ${r.summary}`;

    findings.push({
      ruleId: r.id,
      title: `${r.title} — ${r.source}`,
      matched,
      evidence,
      comment,
      severity: r.severity,
      weight: r.weight,
    });

    total += r.weight;
    if (matched) got += r.weight;
  }

  const raw = total > 0 ? Math.round((got / total) * 100) : 0;
  const missMust = findings.some(
    (f) => !f.matched && RULES.find((r) => r.id === f.ruleId)?.mustHave
  );
  const score = Math.max(0, missMust ? raw - 20 : raw);

  return { findings, score };
}

// --------------------- PÁGINA ---------------------
export default function CheckPage() {
  const [text, setText] = useState('');
  const [report, setReport] = useState<Report | null>(null);

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
            *Resultado indicativo com base no texto fornecido. Revise normas aplicáveis e consulte sua assessoria
            jurídica antes de decidir.
          </p>
        </div>
      )}
    </div>
  );
}
