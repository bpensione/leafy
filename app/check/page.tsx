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
  { id: 'aquisicoes', label: 'Aquisições', icon: '🛒', help: ['Logística reversa de embalagens', 'Rotulagem ambiental', 'Restrições de substâncias'] },
  { id: 'quimicos', label: 'Químicos', icon: '⚗️', help: ['FISPQ (NBR 14725)', 'Armazenamento/segurança', 'Emergência/derramamento'] },
  { id: 'saude', label: 'Saúde', icon: '🏥', help: ['Resíduos de serviços de saúde (RDC/ANVISA, CONAMA 358)', 'PGRSS', 'Infectantes'] },
  { id: 'saneamento', label: 'Efluentes', icon: '💧', help: ['CONAMA 430', 'Parâmetros de lançamento', 'Monitoramento'] },
  { id: 'residuos', label: 'Resíduos', icon: '♻️', help: ['PNRS', 'MTR/CDF', 'Rastreabilidade e licenças'] },
  { id: 'energia', label: 'Energia', icon: '🔋', help: ['Eficiência energética', 'Renováveis', 'Inventário GEE (quando aplicável)'] },
  { id: 'ti', label: 'TI', icon: '🖥️', help: ['Logística reversa de eletroeletrônicos', 'Baterias', 'Segurança de dados no descarte'] },
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
  tags: Category[]; // <- categorias nas quais a regra se aplica
};

const RULES: Rule[] = [
  {
    id: 'pnrs-geral',
    title: 'Política Nacional de Resíduos Sólidos (PNRS)',
    source: 'Lei 12.305/2010; Dec. 10.936/2022',
    summary: 'PGRS, responsabilidade compartilhada, logística reversa e metas.',
    patterns: [/pnrs/i, /pol[ií]tica nacional de res[íi]duos/i, /pgrs|plano de gerenciamento de res[íi]duos/i, /responsabilidade compartilhada/i, /log[íi]stica reversa/i, /metas? (quantitativas|indicadores?)/i],
    severity: 'warn',
    weight: 8,
    tags: ['obras','servicos','aquisicoes','residuos','ti','energia','saneamento','saude','quimicos'],
  },
  {
    id: 'mtr',
    title: 'Manifesto de Transporte de Resíduos (MTR) + CDF',
    source: 'SINIR / órgãos estaduais',
    summary: 'Apresentar MTR no transporte e CDF após destinação.',
    patterns: [/(\b)mtr(\b)/i, /manifesto de transporte de res[íi]duos/i, /\bcdf\b/i, /certificado de destina[çc][aã]o/i],
    severity: 'high',
    weight: 9,
    mustHave: true,
    tags: ['servicos','residuos','obras','aquisicoes','saude','saneamento'],
  },
  {
    id: 'fispq',
    title: 'FISPQ (ABNT NBR 14725)',
    source: 'ABNT NBR 14725',
    summary: 'FISPQ atualizada e compatível para produtos perigosos/químicos.',
    patterns: [/\bfispq\b/i, /nbr\s*14725/i, /perigoso|perigosos/i, /sa[úu]de|seguran[çc]a/i],
    severity: 'high',
    weight: 8,
    tags: ['quimicos','saude','obras','servicos'],
  },
  {
    id: 'conama-307',
    title: 'Resíduos da Construção Civil — RCD',
    source: 'CONAMA 307/2002',
    summary: 'Classificação, triagem e destinação adequada (aterro classe, reciclagem).',
    patterns: [/conama\s*307/i, /res[íi]duos da constru[çc][aã]o/i, /aterro classe/i, /rcd/i],
    severity: 'warn',
    weight: 8,
    tags: ['obras'],
  },
  {
    id: 'conama-430',
    title
