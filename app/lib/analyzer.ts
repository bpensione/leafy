// lib/analyzer.ts
import type { Rule } from "./rules";

export type Finding = {
  ruleId: string;
  title: string;
  matched: boolean;
  evidence: string[];     // trechos encontrados
  comment: string;        // comentário gerado
  severity: "info" | "warn" | "high";
  weight: number;
};

export type Report = {
  findings: Finding[];
  score: number;          // 0–100
};

export function analyzeText(text: string, rules: Rule[]): Report {
  const findings: Finding[] = [];
  let total = 0;
  let got = 0;

  const normText = text || "";
  for (const r of rules) {
    let evidence: string[] = [];
    let matched = false;

    for (const p of r.patterns) {
      if (typeof p === "string") {
        if (normText.toLowerCase().includes(p.toLowerCase())) {
          matched = true;
          evidence.push(p);
        }
      } else {
        const m = normText.match(p);
        if (m) {
          matched = true;
          // guarda um trecho amigável
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
  // Penaliza falta de “mustHave”
  const missMust = findings.some(f => !f.matched && rules.find(r => r.id === f.ruleId)?.mustHave);
  const score = Math.max(0, missMust ? raw - 20 : raw);

  return { findings, score };
}
