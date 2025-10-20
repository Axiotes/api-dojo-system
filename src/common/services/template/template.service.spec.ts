import * as fs from 'fs';

import * as Handlebars from 'handlebars';
import { Test, TestingModule } from '@nestjs/testing';

import { TemplateService } from './template.service';

import { TemplateType } from '@ds-enums/template-type.enum';

jest.mock('fs');

describe('TemplateService', () => {
  let service: TemplateService;

  beforeEach(async () => {
    jest.spyOn(Handlebars, 'compile').mockImplementation();
    jest.spyOn(Handlebars, 'registerPartial').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateService],
    }).compile();

    service = module.get<TemplateService>(TemplateService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compile email template successfully', () => {
    const mockTemplateString = '<h1>{{title}}</h1>';
    const compiledOutput = '<h1>Hello Arthur</h1>';

    const compileFn = jest.fn(
      (data: { title: string }) => `<h1>${data.title}</h1>`,
    );

    (
      fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>
    ).mockReturnValue(mockTemplateString);
    (
      Handlebars.compile as jest.MockedFunction<typeof Handlebars.compile>
    ).mockReturnValue(compileFn);

    const result = service.compileEmailTemplate<{ title: string }>('welcome', {
      title: 'Hello Arthur',
    });

    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('src/templates/emails/welcome.hbs'),
      'utf-8',
    );

    expect(Handlebars.compile).toHaveBeenCalledWith(mockTemplateString, {
      noEscape: true,
    });

    expect(result).toEqual(compiledOutput);
  });

  it('should register partials if folder exists', () => {
    const existsSyncMock = fs.existsSync as jest.MockedFunction<
      typeof fs.existsSync
    >;
    const readdirSyncMock = fs.readdirSync as unknown as jest.MockedFunction<
      (path: string) => string[]
    >;
    const readFileSyncMock = fs.readFileSync as jest.MockedFunction<
      typeof fs.readFileSync
    >;
    const registerPartialMock =
      Handlebars.registerPartial as jest.MockedFunction<
        typeof Handlebars.registerPartial
      >;

    existsSyncMock.mockReturnValue(true);
    readdirSyncMock.mockReturnValue(['header.hbs', 'footer.hbs']);
    readFileSyncMock.mockReturnValue('<div>partial</div>');

    (
      service as unknown as { registerPartials: (type: TemplateType) => void }
    ).registerPartials(TemplateType.EMAIL);

    expect(readdirSyncMock).toHaveBeenCalled();
    expect(registerPartialMock).toHaveBeenCalledTimes(2);
    expect(registerPartialMock).toHaveBeenCalledWith(
      'header',
      '<div>partial</div>',
    );
  });
});
