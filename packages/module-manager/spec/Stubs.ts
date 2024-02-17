import * as fs from 'node:fs';
import * as path from 'node:path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Stubs {
    static from(relativePathToStubsDirectory: string): Stubs {
        return new Stubs(path.resolve(__dirname, relativePathToStubsDirectory));
    }

    private constructor(private readonly pathToStubsDirectory: string) {
    }

    get<T>(name: string, overrides: Record<string, any> = {}): T {
        const data = {
            ... JSON.parse(fs.readFileSync(path.resolve(this.pathToStubsDirectory, `./${name}.json`), { encoding: 'utf8' })),
            ...overrides,
        };

        return Object.keys(data).reduce((acc, field) => {
            return field.endsWith('()')
                ? { ...acc, [field.split('(')[0]]: () => data[field] }
                : { ...acc, [field]: data[field] }
        }, {}) as unknown as T;
    }

    getAsJson(name: string, overrides: Record<string, any> = {}): string {
        return JSON.stringify(this.get(name, overrides), undefined, 4);
    }
}
