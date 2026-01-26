import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { OpenAPIObject } from '@nestjs/swagger';

import { I18nFiles } from '@ds-enums/i18n-files.enum';
import { UserMessage } from '@ds-enums/user-message.enum';
import { ModuleName } from '@ds-enums/module-name.enum';
import { Languages } from '@ds-types/languages.type';

@Injectable()
export class TranslateService {
  constructor(private readonly i18n: I18nService) {}

  public translate(
    key: { i18nFile: I18nFiles; module: ModuleName; message: UserMessage },
    options?: { lang?: Languages; args?: Record<string, string> },
  ): string {
    const messageKey = `${key.i18nFile.toLocaleLowerCase()}.${key.module}.${key.message}`;

    const lang = options?.lang ?? 'pt-BR';
    const args = options?.args ?? {};

    return this.i18n.translate(messageKey, { lang, args });
  }

  public translateSwaggerDocument(
    document: OpenAPIObject,
    lang: Languages,
  ): OpenAPIObject {
    const paths = document.paths;

    for (const pathKey of Object.keys(paths)) {
      const path = paths[pathKey];

      for (const methodKey of Object.keys(path)) {
        const operation = path[methodKey];

        if (!operation) continue;

        if (operation.summary) {
          operation.summary = this.safeTranslateKey(operation.summary, lang);
        }

        if (operation.description) {
          operation.description = this.safeTranslateKey(
            operation.description,
            lang,
          );
        }

        if (operation.tags) {
          operation.tags = operation.tags.map((tag) =>
            this.safeTranslateKey(tag, lang),
          );
        }
      }
    }

    return document;
  }

  private safeTranslateKey(key: string, lang: Languages): string {
    try {
      const result = this.i18n.translate(key, { lang });
      return typeof result === 'string' ? result : key;
    } catch {
      return key;
    }
  }
}
