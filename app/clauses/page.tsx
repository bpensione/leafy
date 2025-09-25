'use client';
import { useState } from 'react';

const THEMES = [
  { key: 'residuos', label: 'Resíduos — MTR/CDF' },
  { key: 'quimicos', label: 'Químicos — FISPQ' },
  { key: 'metas', label: 'Metas e Indicadores' },
  { key: 'equivalencia', label: 'Equivalência técnica' },
  { key: 'auditoria', label: 'Auditoria e monitoramento' },
  { key: 'penalidades', label: 'Penalidades' },
];

export default function ClausesPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [output, setOutput] = useState('');

  function toggle(key: string) {
    setSelected((prev) => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev, key]);
  }

  function generate() {
    const blocks: string[] = [];
    if (selected.includes('residuos')) blocks.push('1. Resíduos: A contratada deverá comprovar a destinação adequada dos resíduos ... mediante apresentação de MTR/CDF válidos.');
    if (selected.includes('quimicos')) blocks.push('2. Produtos químicos: Será obrigatória a apresentação das FISPQ correspondentes ...');
    if (selected.includes('metas')) blocks.push('3. Metas e Indicadores: Definem-se metas mensuráveis com unidade, baseline e prazo ...');
    if (selected.includes('equivalencia')) blocks.push('4. Equivalência técnica: Especificações por desempenho, admitindo soluções equivalentes ...');
    if (selected.includes('auditoria')) blocks.push('5. Auditoria e monitoramento: A contratante poderá auditar documentos e resultados ...');
    if (selected.includes('penalidades')) blocks.push('6. Penalidades: O descumprimento sujeita a contratada às penalidades previstas ...');
    setOutput(blocks.join('\n\n'));
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Gerador de Cláusulas (protótipo)</h1>
      <div className="grid gap-2">
        {THEMES.map(t => (
          <label key={t.key} className="flex items-center gap-2">
            <input type="checkbox" checked={selected.includes(t.key)} onChange={()=>toggle(t.key)} />
            {t.label}
          </label>
        ))}
      </div>
      <button onClick={generate} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500">
        Gerar
      </button>
      <textarea className="w-full h-64 p-3 rounded-xl bg-neutral-900 border border-neutral-800" value={output} readOnly />
    </div>
  );
}
