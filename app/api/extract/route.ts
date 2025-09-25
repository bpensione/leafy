import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const { default: pdfParse } = await import('pdf-parse');
    const result = await pdfParse(buffer);
    return NextResponse.json({ text: result.text ?? '' });
  } catch (e) {
    return NextResponse.json({ error: 'Falha ao extrair PDF' }, { status: 500 });
  }
}
