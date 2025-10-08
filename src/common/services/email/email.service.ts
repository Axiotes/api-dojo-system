import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import { SingleEmail } from '@ds-types/single-email.type';
import { MultipleEmail } from '@ds-types/multiple-email.type';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

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
    const { recipients, subject, html } = email;

    const transporter = this.emailTransport();

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

  public async sigleEmail(email: SingleEmail): Promise<void> {
    const { recipient, subject, html } = email;

    const transporter = this.emailTransport();

    const options: nodemailer.SendMailOptions = {
      from: '"Dojo System" <project.dojo.system@gmail.com>',
      to: recipient,
      subject,
      html,
    };

    try {
      await transporter.sendMail(options);
    } catch {
      throw new InternalServerErrorException('Error sending email');
    }
  }
}
