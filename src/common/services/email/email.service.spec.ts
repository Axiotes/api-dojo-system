import * as fs from 'fs';

import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

import { EmailService } from './email.service';

import { TemplateService } from '@ds-services/template/template.service';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let templateService: TemplateService;

  const sendMailMock = jest.fn().mockResolvedValue(true);

  beforeEach(async () => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    } as unknown as nodemailer.Transporter);

    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string | number> = {
          EMAIL_HOST: 'smtp.example.com',
          EMAIL_PORT: 587,
          EMAIL_USER: 'user@example.com',
          EMAIL_PASSWORD: 'password',
        };
        return values[key];
      }),
    } as unknown as jest.Mocked<ConfigService>;

    templateService = {
      compileEmailTemplate: jest.fn().mockReturnValue('<html>Email</html>'),
    } as unknown as jest.Mocked<TemplateService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: configService },
        { provide: TemplateService, useValue: templateService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send multiple email successfully', async () => {
    await service.multipleEmail({
      recipients: ['test1@example.com', 'test2@example.com'],
      subject: 'Test Email',
      template: 'welcome',
      context: { name: 'Arthur' },
    });

    expect(templateService.compileEmailTemplate).toHaveBeenCalledWith(
      'welcome',
      { name: 'Arthur' },
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Test Email',
        bcc: ['test1@example.com', 'test2@example.com'],
        html: '<html>Email</html>',
      }),
    );
  });

  it('should throw InternalServerErrorException if sending fails', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP failed'));

    await expect(
      service.multipleEmail({
        recipients: ['a@b.com'],
        subject: 'Fail test',
        template: 'error',
        context: {},
      }),
    ).rejects.toThrow(new InternalServerErrorException('Error sending email'));
  });

  it('should send single email successfully', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('logo'));

    await service.singleEmail({
      recipient: 'single@example.com',
      subject: 'Single Email',
      template: 'template',
      context: {},
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'single@example.com',
        attachments: expect.arrayContaining([
          expect.objectContaining({
            filename: 'logo-white.png',
            cid: 'dojo-logo',
          }),
        ]),
      }),
    );
  });
});
