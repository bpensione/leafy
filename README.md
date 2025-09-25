# Leafy — plataforma (build estável p/ Vercel)

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind**.  
Config simplificada para evitar erros de build.

## Estrutura
- `app/` (rotas: `/`, `/check`, `/clauses`, `/about` + `globals.css`)
- `components/LeafIndicator.tsx`
- `public/logo.svg`
- `postcss.config.cjs`, `tailwind.config.js`
- `next.config.mjs`, `tsconfig.json`, `package.json`, `next-env.d.ts`

## Local
```bash
npm i
npm run dev
# http://localhost:3000
```

## Vercel
- Importe o repositório (Root Directory: `./`, Framework: Next.js).
- Build padrão: `npm run build`.
- Node 20.x (já definido em `package.json`).

