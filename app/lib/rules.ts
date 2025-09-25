// lib/rules.ts
export type Rule = {
  id: string;
  title: string;
  source: string;      // norma/ato
  refs?: { label: string; url?: string }[];
  summary: string;     // o que costuma exigir/verificar
  patterns: (string | RegExp)[];  // palavras/expressões que servem de evidência
  severity: "info" | "warn" | "high";
  weight: number;      // impacto no score (0–10)
  mustHave?: boolean;  // se “faltou”, sempre apontar
};

export const RULES: Rule[] = [
  {
    id: "pnrs-geral",
    title: "Política Nacional de Resíduos Sólidos (PNRS)",
    source: "Lei nº 12.305/2010 (PNRS) e Decreto 10.936/2022",
    summary:
      "Verifica menções a plano de gerenciamento de resíduos, responsabilidade compartilhada, logística reversa e metas.",
    patterns: [
      /pnrs/i,
      /pol[ií]tica nacional de res[íi]duos/i,
      /plano de gerenciamento de res[íi]duos|pgrs/i,
      /responsabilidade compartilhada/i,
      /log[íi]stica reversa/i,
      /metas? (quantitativas|indicadores?)/i
    ],
    severity: "warn",
    weight: 8,
  },
  {
    id: "mtr",
    title: "Manifesto de Transporte de Resíduos (MTR)",
    source: "SINIR / sistemas estaduais (ex.: FEPAM, IEMA, FEAM)",
    summary:
      "Exige apresentação de MTR/CDF para transporte e destinação final de resíduos.",
    patterns: [/mtr\b/i, /manifesto de transporte de res[íi]duos/i, /\bcdf\b/i],
    severity: "high",
    weight: 9,
    mustHave: true,
  },
  {
    id: "fispq",
    title: "FISPQ (ficha de informações de segurança de produtos químicos)",
    source: "ABNT NBR 14725 (classificação, rotulagem e FISPQ)",
    summary:
      "Para produtos perigosos/químicos, requer FISPQ atualizada e compatível com o fornecido.",
    patterns: [/\bfispq\b/i, /nbr\s*14725/i, /s[aá]ude,? seguran[çc]a/i],
    severity: "high",
    weight: 8,
  },
  {
    id: "conama-307",
    title: "Resíduos da Construção Civil",
    source: "CONAMA 307/2002 e alterações",
    summary:
      "Classificação de RCD, exigência de destinação adequada e triagem.",
    patterns: [/conama\s*307/i, /res[íi]duos da constru[çc][aã]o/i, /aterro classe/i],
    severity: "warn",
    weight: 6,
  },
  {
    id: "conama-430",
    title: "Efluentes Líquidos",
    source: "CONAMA 430/2011",
    summary:
      "Parâmetros e condições para lançamento de efluentes; planos de monitoramento.",
    patterns: [/conama\s*430/i, /efluentes?/i, /lan[çc]amento/i, /monitoramento/i],
    severity: "warn",
    weight: 5,
  },
  {
    id: "iso-14001",
    title: "Sistema de Gestão Ambiental",
    source: "ISO 14001",
    summary:
      "Exige ou pontua empresas com SGA ISO 14001 (certificação válida).",
    patterns: [/iso\s*14001/i, /sistema de gest[aã]o ambiental/i, /\bSGA\b/i],
    severity: "info",
    weight: 3,
  },
];
