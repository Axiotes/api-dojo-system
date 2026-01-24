import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { Message } from '@ds-enums/message.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { Languages } from '@ds-types/languages.type';

@Injectable()
export class TranslateService {
  constructor(private readonly i18n: I18nService) {}

  public translate(
    key: { i18nFile: I18nFiles; module: ModuleName; message: Message },
    options?: { lang?: Languages; args?: Record<string, string> },
  ): string {
    const messageKey = `${key.i18nFile.toLocaleLowerCase()}.${key.module}.${key.message}`;

    const lang = options?.lang ?? 'pt-BR';
    const args = options?.args ?? {};

    return this.i18n.translate(messageKey, { lang, args });
  }
}
