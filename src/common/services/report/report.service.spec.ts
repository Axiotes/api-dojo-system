import * as fs from 'fs';
import * as path from 'path';

import { Test, TestingModule } from '@nestjs/testing';
import * as Handlebars from 'handlebars';

import { ReportService } from './report.service';

import { PuppeteerService } from '@ds-services/puppeteer/puppeteer.service';

describe('ReportService', () => {
  let service: ReportService;
  let puppeteerService: PuppeteerService;

  const pdfBufferMock = Buffer.from('pdf-mock');
  const pageMock = {
    setContent: jest.fn(),
    emulateMediaType: jest.fn(),
    pdf: jest.fn().mockResolvedValue(pdfBufferMock),
    close: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: PuppeteerService,
          useValue: {
            newPage: jest.fn().mockResolvedValue(pageMock),
          },
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    puppeteerService = module.get<PuppeteerService>(PuppeteerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a PDF buffer from HTML', async () => {
    const html = '<h1>Test</h1>';

    const result = await service.htmlToPdf(html);

    expect(puppeteerService.newPage).toHaveBeenCalled();
    expect(pageMock.setContent).toHaveBeenCalledWith(html, {
      waitUntil: 'networkidle0',
    });
    expect(pageMock.emulateMediaType).toHaveBeenCalledWith('screen');
    expect(pageMock.pdf).toHaveBeenCalledWith({
      format: 'A4',
      printBackground: true,
      landscape: false,
      margin: { top: '20mm', right: '12mm', bottom: '20mm', left: '12mm' },
    });
    expect(pageMock.close).toHaveBeenCalled();
    expect(result).toEqual(pdfBufferMock);
  });

  it('should compile the template and call htmlToPdf', async () => {
    const templateString = '<h1>{{title}}</h1>';
    const data = { title: 'Hello' };

    service.htmlToPdf = jest.fn().mockResolvedValue(pdfBufferMock);

    const result = await service.templateToPdf(templateString, data);

    expect(service.htmlToPdf).toHaveBeenCalledWith('<h1>Hello</h1>');
    expect(result).toEqual(pdfBufferMock);
  });

  it('should read and register partials', () => {
    const readdirSyncSpy = jest
      .spyOn(fs, 'readdirSync')
      .mockReturnValue(['partial1.hbs'] as unknown as ReturnType<
        typeof fs.readdirSync
      >);
    const readFileSyncSpy = jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue('<div>{{content}}</div>');
    const registerPartialSpy = jest.spyOn(Handlebars, 'registerPartial');

    service['registerPartials']();

    expect(readdirSyncSpy).toHaveBeenCalledWith(
      path.join(process.cwd(), 'src/templates/pdfs/partials'),
    );
    expect(readFileSyncSpy).toHaveBeenCalledWith(
      path.join(process.cwd(), 'src/templates/pdfs/partials', 'partial1.hbs'),
      'utf-8',
    );
    expect(registerPartialSpy).toHaveBeenCalledWith(
      'partial1',
      '<div>{{content}}</div>',
    );
  });
});
