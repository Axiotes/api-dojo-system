import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

import { Report } from '@ds-types/report.type';

@Injectable()
export class ReportService {
  public async createPdf(
    buildContent: (doc: PDFDocument) => void,
    filename: string,
  ): Promise<Report> {
    const doc = new PDFDocument();
    const chunks = [];

    return new Promise((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const result = Buffer.concat(chunks);

        resolve({
          filename,
          mimeType: 'application/pdf',
          file: result,
        });
      });

      buildContent(doc);

      doc.end();
    });
  }

  public teacherReport(doc: PDFDocument): void {
    doc.fontSize(20).text('Relatório de Professores', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Testes de geração de PDF', { align: 'center' });
  }
}
