import fs from "fs";
import { PDFDocument } from "pdf-lib";

export async function mergePdfFiles(inputPaths: string[], outputPath: string): Promise<void> {
  const mergedPdf = await PDFDocument.create();

  for (const inputPath of inputPaths) {
    const bytes = fs.readFileSync(inputPath);
    const pdf = await PDFDocument.load(bytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedBytes);
}


export async function mergePdfFilesOCR(paths: string[]): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const path of paths) {
    const pdfBytes = fs.readFileSync(path);
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => mergedPdf.addPage(p));
  }

return Buffer.from(await mergedPdf.save());
}
