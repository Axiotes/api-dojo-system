import * as fs from 'fs';
import * as path from 'path';

import * as Handlebars from 'handlebars';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateService {
  public compileEmailTemplate<T>(templateName: string, data: T): string {
    const templatePath = path.join(
      process.cwd(),
      'src/templates/emails',
      `${templateName}.hbs`,
    );

    this.registerPartials('emails');

    const templateString = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateString, { noEscape: true });

    return template(data);
  }

  private registerPartials(type: 'emails' | 'pdfs'): void {
    const partialsPath = path.join(
      process.cwd(),
      `src/templates/${type}/partials`,
    );

    if (!fs.existsSync(partialsPath)) return;

    const files = fs.readdirSync(partialsPath);

    files.forEach((file) => {
      const name = path.parse(file).name;
      const filePath = path.join(partialsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      Handlebars.registerPartial(name, content);
    });
  }
}
