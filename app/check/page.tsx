'use client';

import { useRef, useState } from 'react';
import { LeafIndicator } from '../../components/LeafIndicator';

/* ==================== Categorias ==================== */

type Category =
  | 'obras'
  | 'servicos'
  | 'aquisicoes'
  | 'quimicos'
  | 'saude'
  | 'saneamento'
  | 'residuos'
  | 'energia'
  | 'ti';

const CATEGORIES: { id: Category; label: string; icon: string; help: string[] }[] = [
  { id: 'obras', label: 'Obras', icon: '🔨', help: ['RCD (CONAMA 307)', 'PGRS de obra', 'Reaproveitamento/aterro classe'] },
  { id: 'servicos', label: 'Serviços', icon: '🧹', help: ['PNRS/PGRS', 'MTR + CDF', 'Indicadores e EPIs'] },
  { id: 'aquisicoes', label: 'Aquisições', icon: '🛒', help: ['Logística reversa (embalagens)', 'Rotulagem ambiental', 'Substâncias restritas'] },
  { id: 'quimicos', label: 'Químicos', icon: '⚗️', help: ['FISPQ (NBR 14725)', 'Armazenamento', 'Resposta a emergências'] },
  { id: 'saude', label: 'Saúde', icon: '🏥', help: ['RSS (RDC/ANVISA; CONAMA 358)', 'PGRSS', 'Infectantes'] },
  { id: 'saneamento', label: 'Efluentes', icon: '💧', help: ['CONAMA 430', 'Parâmetros de lançamento', 'Monitoramento'] },
  { id: 'residuos', label: 'Resíduos', icon: '♻️', help: ['PNRS', 'MTR/CDF', 'Rastreabilidade e licenças'] },
  { id: 'energia', label: 'Energia', icon: '🔋', help: ['Eficiência/renováveis', 'Inventário GEE (se aplicável)', 'I-REC (se aplicável)'] },
  { id: 'ti', label: 'TI', icon: '🖥️', help: ['Logística reversa de eletroeletrônicos', 'Baterias', 'Descarte seguro de dados'] },
];

/* ==================== Regras (com tags) ==================== */

type Rule = {
  id: string;
  title: string;
  source: string;
  summary: string;
  patterns: (string | RegExp)[];
  severity: 'info' | 'warn' | 'high';
  weight: number;
  mustHave?: boolean;
  tags: Category[]; // categorias nas quais a regra se aplica
};

const RULES: Rule[] = [
  {
    id: 'pnrs-geral',
    title: 'Política Nacional de Resíduos Sólidos (PNRS)',
    source: 'Lei 12.305/2010; Dec. 10.936/2022',
    summary: 'PGRS, responsabilidade compartilhada, logística reversa e metas.',
    patterns: [
      /pnrs/i,
      /pol[ií]tica nacional de res[íi]duos/i,
      /pgrs|plano de gerenciamento de res[íi]duos/i,
      /responsabilidade compartilhada/i,
      /log[íi]stica reversa/i,
      /metas? (quantitativas|indicadores?)/i
    ],
    severity: 'warn',
    weight: 8,
    tags: ['obras','servicos','aquisicoes','residuos','ti','energia','saneamento','saude','quimicos']
  },
  {
    id: 'mtr',
    title: 'Manifesto de Transporte de Resíduos (MTR) + CDF',
    source: 'SINIR / órgãos estaduais',
    summary: 'Apresentar MTR no transporte e CDF após destinação.',
    patterns: [
      /(\b)mtr(\b)/i,
      /manifesto de transporte de res[íi]duos/i,
      /\bcdf\b/i,
      /certificado de destina[çc][aã]o/i
    ],
    severity: 'high',
    weight: 9,
    mustHave: true,
    tags: ['servicos','residuos','obras','aquisicoes','saude','saneamento']
  },
  {
    id: 'fispq',
    title: 'FISPQ (ABNT NBR 14725)',
    source: 'ABNT NBR 14725',
    summary: 'FISPQ atualizada e compatível para produtos perigosos/químicos.',
    patterns: [/\bfispq\b/i, /nbr\s*14725/i, /perigoso|perigosos/i, /sa[úu]de|seguran[çc]a/i],
    severity: 'high',
    weight: 8,
    tags: ['quimicos','saude','obras','servicos']
  },
  {
    id: 'conama-307',
    title: 'Resíduos da Construção Civil — RCD',
    source: 'CONAMA 307/2002',
    summary: 'Classificação, triagem e destinação adequada (aterro classe, reciclagem).',
    patterns: [/conama\s*307/i, /res[íi]duos da constru[çc][aã]o/i, /aterro classe/i, /rcd/i],
    severity: 'warn',
    weight: 8,
    tags: ['obras']
  },
  {
    id: 'conama-430',
    title: 'Efluentes Líquidos',
    source: 'CONAMA 430/2011',
    summary: 'Parâmetros/condições de lançamento e monitoramento.',
    patterns: [/conama\s*430/i, /efluentes?/i, /lan[çc]amento/i, /monitoramento/i],
    severity: 'warn',
    weight: 7,
    tags: ['saneamento','obras','servicos','saude']
  },
  {
    id: 'iso-14001',
    title: 'Sistema de Gestão Ambiental — ISO 14001',
    source: 'ISO 14001',
    summary: 'SGA certificado vigente (ou controles equivalentes documentados).',
    patterns: [/iso\s*14001/i, /sistema de gest[aã]o ambiental/i, /\bSGA\b/i],
    severity: 'info',
    weight: 3,
    tags: ['obras','servicos','aquisicoes','residuos','energia','ti','saneamento','saude','quimicos']
  }
];

/* ==================== Sugestões por Regra ==================== */
const SUGGESTIONS: Record<string, string> = {
  'pnrs-geral': `A contratada cumprirá integralmente a Política Nacional de Resíduos Sólidos (Lei 12.305/2010; Decreto 10.936/2022),
mantendo PGRS atualizado e aderente às atividades, com metas quantitativas, indicadores e definição de responsabilidades,
incluindo, quando aplicável, logística reversa de produtos e embalagens.`,

  'mtr': `Todo transporte de resíduos será acompanhado do Manifesto de Transporte de Resíduos (MTR) e, após a destinação,
será apresentado o Certificado/Comprovante de Destinação Final (CDF) emitido pelo sistema competente (SINIR/órgãos estaduais).
A ausência de MTR ou de CDF sujeitará a contratada às sanções previstas.`,

  'fispq': `Para produtos químicos/perigosos utilizados ou fornecidos, a contratada apresentará FISPQ atualizada conforme ABNT NBR 14725,
assegurando comunicação de perigos, procedimentos de segurança, armazenamento adequado e atendimento a emergências.`,

  'conama-307': `Para resíduos da construção civil (RCD), será realizada classificação, triagem e destinação adequada,
priorizando reaproveitamento/reciclagem e utilizando aterros classe apropriados apenas quando não houver alternativa.`,

  'conama-430': `Os efluentes líquidos gerados atenderão integralmente à Resolução CONAMA 430/2011, incluindo limites de lançamento,
condições e monitoramento, com planos de amostragem e relatórios laboratoriais quando aplicável.`,

  'iso-14001': `A contratada manterá Sistema de Gestão Ambiental (SGA) conforme ISO 14001 com certificação vigente ou controles equivalentes
documentados, assegurando conformidade legal e melhoria contínua do desempenho ambiental.`
};

/* ==================== Analisador ==================== */

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
      weight: r.weight
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

/* ==================== Hints por categoria (para a API filtrar páginas) ==================== */

function hintsForCategory(cat: Category): string[] {
  const rulesForCat = RULES.filter((r) => !r.tags || r.tags.includes(cat));
  const literals = rulesForCat.flatMap((r) =>
    r.patterns.filter((p) => typeof p === 'string') as string[]
  );
  const extras = rulesForCat.map((r) => r.title);
  return Array.from(new Set([...literals, ...extras]))
    .map((s) => s.trim())
    .filter((s) => s.length >= 3)
    .slice(0, 80);
}

/* ==================== Página ==================== */

export default function CheckPage() {
  const [category, setCategory] = useState<Category>('servicos'); // default
  const [text, setText] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [uploading, setUploading] = useState(false);
  const [suggested, setSuggested] = useState<string>('');    // texto sugerido
  const [improving, setImproving] = useState<boolean>(false); // loading do botão
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function uploadPdf(file: File) {
    setUploading(true);
    setReport(null);
    setSuggested('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      // Envia "hints" para a API filtrar páginas relevantes
      fd.append('hints', JSON.stringify(hintsForCategory(category)));

      const res = await fetch('/api/extract', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || `Falha ao extrair PDF (status ${res.status}).`);
        return;
      }
      setText((data?.text as string) || '');
    } catch (err) {
      console.error(err);
      alert('Falha ao extrair PDF. Verifique o arquivo e tente novamente.');
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') uploadPdf(f);
  }

  function run() {
    const rulesForCat = RULES.filter((r) => !r.tags || r.tags.includes(category));
    const r = analyzeText(text, rulesForCat);
    setReport(r);
    setSuggested('');
  }

  function proposeBetterVersion() {
    if (!report) return;
    setImproving(true);

    try {
      const missing = report.findings.filter((f) => !f.matched);
      const mustMissing = missing.filter((f) => {
        const rule = RULES.find((r) => r.id === f.ruleId);
        return rule?.mustHave;
      });

      const header =
        `PROPOSTA DE MELHORIA — Versão Sugerida\n\nResumo do que faltou (segundo as normas configuradas):\n` +
        (missing.length ? missing.map((f) => `• ${f.title}`).join('\n') : '• Nada crítico; apenas refinamentos.');

      const ordered = [
        ...mustMissing,
        ...missing.filter((f) => !RULES.find((r) => r.id === f.ruleId)?.mustHave)
      ];

      const clauses = ordered
        .map((f) => {
          const base = SUGGESTIONS[f.ruleId] || `Inserir cláusula reforçando: ${f.title}.`;
          return `\n\n### ${f.title}\n${base}`;
        })
        .join('');

      const integrated =
        `\n\n==== TEXTO INTEGRADO SUGERIDO ====\n\n${
          ordered.map((f) => SUGGESTIONS[f.ruleId] || '').filter(Boolean).join('\n\n')
        }\n\n(Adapte nomes, prazos e sanções conforme o edital/contrato.)`;

      setSuggested(`${header}${clauses}${integrated}`);
    } finally {
      setImproving(false);
    }
  }

  const state: 'red' | 'yellow' | 'green' =
    !report ? 'yellow' : report.score >= 75 ? 'green' : report.score >= 40 ? 'yellow' : 'red';

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Green Check por Normas (protótipo)</h1>

      {/* Seletor de categoria */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1 rounded-full border text-sm ${
              category === c.id
                ? 'bg-emerald-700 border-emerald-600'
                : 'bg-neutral-900 border-neutral-700 hover:border-neutral-600'
            }`}
            title={c.help.join(' • ')}
          >
            <span className="mr-1">{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Upload de PDF (server-side) */}
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="block text-sm"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700"
        >
          Escolher PDF
        </button>
        {uploading && <span className="text-sm text-neutral-400">Extraindo PDF…</span>}
      </div>

      {/* Texto (manual ou extraído) */}
      <textarea
        className="w-full h-56 p-3 rounded-xl bg-neutral-900 border border-neutral-800"
        placeholder="Cole texto do ETP/TR/Edital ou envie um PDF"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={run}
          disabled={!text || uploading}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
        >
          Avaliar
        </button>

        <button
          onClick={proposeBetterVersion}
          disabled={!report || improving}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
        >
          {improving ? 'Gerando...' : 'Sugerir versão melhor'}
        </button>
      </div>

      {report && (
        <div className="grid gap-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 flex items-center gap-3">
            <LeafIndicator state={state} />
            <div className="font-medium">
              Score: {report.score}{' '}
              <span className="ml-2 text-xs opacity-70">
                ({CATEGORIES.find((x) => x.id === category)?.label})
              </span>
            </div>
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

          {suggested && (
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Versão sugerida</h2>
                <button
                  onClick={() => navigator.clipboard.writeText(suggested)}
                  className="px-3 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-sm"
                >
                  Copiar
                </button>
              </div>
              <textarea
                className="w-full h-80 p-3 rounded-xl bg-neutral-900 border border-neutral-800"
                value={suggested}
                onChange={(e) => setSuggested(e.target.value)}
              />
            </div>
          )}

          <p className="text-xs text-neutral-400">
            *Resultado indicativo com base no texto fornecido. Revise normas aplicáveis e consulte sua assessoria
            jurídica antes de decidir.
          </p>
        </div>
      )}
    </div>
  );
}
