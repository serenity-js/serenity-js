import * as fs from 'node:fs';
import type * as nodeOS from 'node:os';
import * as path from 'node:path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function stub(name: 'os', overrides?: Record<string, any>): typeof nodeOS
export function stub(name: 'process', overrides?: Record<string, any>): NodeJS.Process

export function stub(name: string, overrides: Record<string, any> = {}): any {
    const data = {
        ... JSON.parse(fs.readFileSync(path.resolve(__dirname, `./${name}.json`), { encoding: 'utf8' })),
        ...overrides,
    };

    return Object.keys(data).reduce((acc, field) => {
        return field.endsWith('()')
            ? { ...acc, [field.split('(')[0]]: () => data[field] }
            : { ...acc, [field]: data[field] }
    }, {}) as unknown;
}
