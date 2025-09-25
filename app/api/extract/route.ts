// app/api/extract/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // força Node (serverless) – necessário para pdf-parse

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });
    }

    // Converte para Buffer
    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    // Import dinâmico para funcionar bem em ESM
    const { default: pdfParse } = await import('pdf-parse');
    const result = await pdfParse(buffer);

    // result.text contém o texto do PDF
    return NextResponse.json({ text: result.text ?? '' });
  } catch (e: any) {
    console.error('extract error', e);
    return NextResponse.json({ error: 'Falha ao extrair PDF' }, { status: 500 });
  }
}
