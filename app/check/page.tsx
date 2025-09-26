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

  'con
