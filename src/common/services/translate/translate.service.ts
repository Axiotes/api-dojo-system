import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { Message } from '@ds-enums/message.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { Languages } from '@ds-types/languages.type';

@Injectable()
export class TranslateService {
  constructor(private readonly i18n: I18nService) {}

  public async translate(
    key: { i18nFile: I18nFiles; module: ModuleName; message: Message },
    options?: { lang?: Languages; args?: Record<string, string>[] },
  ): Promise<string> {
    const messageKey = `${key.i18nFile.toLocaleLowerCase()}.${key.module}.${key.message}`;

    if (!options) options = { lang: 'pt-BR' };
    if (!options.lang) options.lang = 'pt-BR';

    return await this.i18n.translate(messageKey, options);
  }
}
