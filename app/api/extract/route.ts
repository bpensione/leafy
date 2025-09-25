// app/api/extract/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // garante ambiente Node para o pdf-parse

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });
    }

    // Converte para Buffer (Node)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Import dinâmico para funcionar bem com ESM
    const { default: pdfParse } = await import('pdf-parse');
    const result = await pdfParse(buffer);

    return NextResponse.json({ text: result.text ?? '' });
  } catch (err) {
    console.error('extract error', err);
    return NextResponse.json({ error: 'Falha ao extrair PDF' }, { status: 500 });
  }
}
