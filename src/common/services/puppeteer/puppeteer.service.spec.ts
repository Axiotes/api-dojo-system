import { Test, TestingModule } from '@nestjs/testing';
import * as puppeteer from 'puppeteer';

import { PuppeteerService } from './puppeteer.service';

describe('PuppeteerService', () => {
  let service: PuppeteerService;

  const browserMock = {
    isConnected: jest.fn(),
    newPage: jest.fn(),
    close: jest.fn(),
  } as unknown as puppeteer.Browser;
  const pageMock = {
    setDefaultTimeout: jest.fn(),
    setDefaultNavigationTimeout: jest.fn(),
    emulateTimezone: jest.fn(),
  } as unknown as puppeteer.Page;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuppeteerService],
    }).compile();

    service = module.get<PuppeteerService>(PuppeteerService);

    jest.clearAllMocks();

    jest.spyOn(puppeteer, 'launch').mockResolvedValue(browserMock);
    browserMock.newPage = jest.fn().mockResolvedValue(pageMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('launchBrowser should call puppeteer.launch with correct options', async () => {
    const spyLaunch = jest.spyOn(puppeteer, 'launch');
    const browser = await service['launchBrowser']();

    expect(spyLaunch).toHaveBeenCalledWith({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    expect(browser).toBe(browserMock);
  });

  it('getBrowser should return cached browser if connected', async () => {
    browserMock.isConnected = jest.fn().mockReturnValue(true);

    const browser1 = await service.getBrowser();
    const browser2 = await service.getBrowser();

    expect(browser1).toBe(browserMock);
    expect(browser2).toBe(browserMock);
    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
  });

  it('getBrowser should relaunch if browser is disconnected', async () => {
    browserMock.isConnected = jest.fn().mockReturnValue(false);

    const browserNewMock = {
      isConnected: jest.fn().mockReturnValue(true),
    } as unknown as puppeteer.Browser;
    jest
      /* eslint-disable-next-line */
      .spyOn(service as any, 'launchBrowser')
      .mockResolvedValueOnce(browserNewMock);

    const browser = await service.getBrowser();

    expect(browser).toBe(browserNewMock);
  });

  it('newPage should return a page and set timeouts', async () => {
    browserMock.isConnected = jest.fn().mockReturnValue(true);

    const page = await service.newPage();

    expect(browserMock.newPage).toHaveBeenCalled();
    expect(page.setDefaultTimeout).toHaveBeenCalledWith(30_000);
    expect(page.setDefaultNavigationTimeout).toHaveBeenCalledWith(30_000);
    expect(page.emulateTimezone).toHaveBeenCalledWith('America/Recife');
    expect(page).toBe(pageMock);
  });

  it('onModuleDestroy should close the browser', async () => {
    browserMock.isConnected = jest.fn().mockReturnValue(true);

    await service.onModuleDestroy();

    expect(browserMock.close).toHaveBeenCalled();
  });

  it('onModuleDestroy should catch errors when closing', async () => {
    browserMock.close = jest.fn().mockRejectedValueOnce(new Error('fail'));
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await service.onModuleDestroy();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error closing browser:',
      expect.any(Error),
    );
  });
});
