import * as fs from 'node:fs';
import * as path from 'node:path';

import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

import { PuppeteerService } from '@ds-services/puppeteer/puppeteer.service';

@Injectable()
export class ReportService {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  public async htmlToPdf(html: string): Promise<Buffer> {
    const page = await this.puppeteerService.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('screen');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        landscape: false,
        margin: {
          top: '20mm',
          right: '12mm',
          bottom: '20mm',
          left: '12mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  public async templateToPdf<T>(
    templateString: string,
    data: T,
  ): Promise<Buffer> {
    this.registerPartials();

    const template = Handlebars.compile(templateString, {
      noEscape: true,
    });
    const html = template(data);

    return await this.htmlToPdf(html);
  }

  private registerPartials(): void {
    const partialsPath = path.join(
      process.cwd(),
      'src/templates/pdfs/partials',
    );
    const files = fs.readdirSync(partialsPath);

    files.forEach((file) => {
      const name = path.parse(file).name;
      const filePath = path.join(partialsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      Handlebars.registerPartial(name, content);
    });
  }
}
