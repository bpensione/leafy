import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { title = 'Versao Sugerida', body = '' } = await req.json();

    const sections: Paragraph[] = [];
    sections.push(new Paragraph({ text: String(title), heading: HeadingLevel.TITLE }));
    String(body).split('\n').forEach((line) => {
      sections.push(new Paragraph({ children: [new TextRun(String(line))] }));
    });

    const doc = new Document({ sections: [{ children: sections }] });
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${String(title).replace(/\s+/g, '_')}.docx"`
      }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Falha ao gerar DOCX' }, { status: 500 });
  }
}

