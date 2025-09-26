import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const hintsRaw = form.get('hints') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo ausente.' }, { status: 400 });
    }

    const name = (file as any).name || 'arquivo';
    const mime = file.type || '';
    const buf = Buffer.from(await file.arrayBuffer());

    // ===== DOCX (.docx) =====
    const isDocx =
      /officedocument\.wordprocessingml\.document/i.test(mime) || /\.docx$/i.test(name);

    if (isDocx) {
      const mammoth = await import('mammoth'); // precisa de "mammoth" no package.json
      const { value } = await mammoth.extractRawText({ buffer: buf });
      const text = (value || '').trim();
      if (!text) {
        return NextResponse.json({ error: 'DOCX sem texto extraído.' }, { status: 422 });
      }
      return NextResponse.json({
        text,
        kind: 'docx',
        pagesProcessed: undefined,
        pagesSelected: [],
        totalPages: undefined,
      });
    }

    // ===== PDF (.pdf) =====
    const isPdf = /pdf/i.test(mime) || /\.pdf$/i.test(name);
    if (isPdf) {
      // usa pdf-parse (já deve estar instalado no projeto)
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(buf); // result.text é texto contínuo
      const text = String(result.text || '').trim();

      // (Opcional) no futuro dá pra usar "hintsRaw" para tentar filtrar trechos
      // Por enquanto retornamos o texto inteiro para análise no client.
      return NextResponse.json({
        text,
        kind: 'pdf',
        pagesProcessed: result.numpages,
        pagesSelected: [],
        totalPages: result.numpages,
      });
    }

    return NextResponse.json(
      { error: 'Tipo de arquivo inválido (envie PDF ou DOCX).' },
      { status: 415 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Falha ao processar arquivo.' }, { status: 500 });
  }
}
