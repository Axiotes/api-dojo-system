import * as fs from 'node:fs';
import * as path from 'node:path';

export const logoBase64 = (): string => {
  const logoPath = path.join(process.cwd(), 'src/assets/logo.png');
  const logoBase64 = fs.readFileSync(logoPath, 'base64');

  return `data:image/png;base64,${logoBase64}`;
};
