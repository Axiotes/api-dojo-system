import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PuppeteerService implements OnModuleDestroy {
  private browserPromise: Promise<puppeteer.Browser> | null = null;

  private async launchBrowser(): Promise<puppeteer.Browser> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    return browser;
  }

  public async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browserPromise) {
      this.browserPromise = this.launchBrowser();
    }

    const browser = await this.browserPromise;

    if (!browser.isConnected()) {
      this.browserPromise = this.launchBrowser();
      return this.browserPromise;
    }

    return browser;
  }

  public async newPage(): Promise<puppeteer.Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    page.setDefaultTimeout(30_000);
    page.setDefaultNavigationTimeout(30_000);

    try {
      await page.emulateTimezone('America/Recife');
    } catch (error) {
      console.log(error);
    }

    return page;
  }

  async onModuleDestroy(): Promise<void> {
    try {
      const browser = await this.getBrowser();
      await browser.close();
    } catch (error) {
      console.error('Error closing browser:', error);
    }
  }
}
