// app/page.tsx
import Link from "next/link";
import { LeafIndicator } from "../components/LeafIndicator"; // relativo (sem @/)


export default function Page() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40">
        <div className="flex items-center gap-3 mb-4">
          <LeafIndicator state="green" />
          <h2 className="text-xl font-semibold">Green Check</h2>
        </div>
        <p className="text-neutral-300 mb-4">
          Avalie ETP/TR/Edital colando o texto (protótipo). Regras BR serão aplicadas numa próxima etapa.
        </p>
        <Link href="/check" className="underline">Abrir verificador →</Link>
      </section>
      <section className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Gerador de Cláusulas</h2>
        </div>
        <p className="text-neutral-300 mb-4">
          Monte cláusulas temáticas (protótipo). Escolha temas e gere um texto base em PT-BR.
        </p>
        <Link href="/clauses" className="underline">Abrir gerador →</Link>
      </section>
    </div>
  );
}
