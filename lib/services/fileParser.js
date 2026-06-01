import { extractText, getDocumentProxy } from 'unpdf';

function isPdf(file) {
  const name = file.name.toLowerCase();
  return file.type === 'application/pdf' || name.endsWith('.pdf');
}

async function extractPdfText(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const cleaned = text
    ?.replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleaned) {
    throw new Error(
      'Could not extract text from PDF. It may be image-only or password-protected.'
    );
  }

  return cleaned;
}

export async function extractTextFromUpload(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isPdf(file)) {
    return extractPdfText(buffer);
  }

  return buffer.toString('utf-8');
}
