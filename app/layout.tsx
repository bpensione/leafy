import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leafy — verde de verdade",
  description: "Green Check + Gerador de Cláusulas para aquisições públicas sustentáveis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="border-b border-neutral-800 sticky top-0 z-50 bg-neutral-950/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
            <img src="/logo.svg" alt="Leafy" className="w-8 h-8" />
            <Link href="/" className="font-semibold">Leafy</Link>
            <nav className="ml-auto flex gap-4 text-sm">
              <Link href="/check" className="hover:underline">Green Check</Link>
              <Link href="/clauses" className="hover:underline">Gerador de Cláusulas</Link>
              <Link href="/about" className="hover:underline">Sobre</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-neutral-400">
          Leafy — verde de verdade • © {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
