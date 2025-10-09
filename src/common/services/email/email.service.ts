import * as fs from 'fs';
import * as path from 'path';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { SingleEmail } from '@ds-types/single-email.type';
import { MultipleEmail } from '@ds-types/multiple-email.type';
import { TemplateService } from '@ds-services/template/template.service';

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {}

  public emailTransport(): nodemailer.transporter {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    return transporter;
  }

  public async multipleEmail(email: MultipleEmail): Promise<void> {
    const { recipients, subject, template, context } = email;

    const transporter = this.emailTransport();

    const html = this.templateService.compileEmailTemplate(template, context);

    const options: nodemailer.SendMailOptions = {
      from: '"Dojo System" <project.dojo.system@gmail.com>',
      to: 'project.dojo.system@gmail.com',
      bcc: recipients,
      subject,
      html,
    };

    try {
      await transporter.sendMail(options);
    } catch {
      throw new InternalServerErrorException('Error sending email');
    }
  }

  public async singleEmail<T>(email: SingleEmail<T>): Promise<void> {
    const { recipient, subject, template, context } = email;

    const transporter = this.emailTransport();
    const html = this.templateService.compileEmailTemplate(template, context);
    const logoPath = path.join(process.cwd(), 'src/assets/logo-white.png');

    const options: nodemailer.SendMailOptions = {
      from: '"Dojo System" <project.dojo.system@gmail.com>',
      to: recipient,
      subject,
      html,
      attachments: [
        {
          filename: 'logo-white.png',
          content: fs.readFileSync(logoPath),
          cid: 'dojo-logo',
        },
      ],
    };

    try {
      await transporter.sendMail(options);
    } catch {
      throw new InternalServerErrorException('Error sending email');
    }
  }
}
