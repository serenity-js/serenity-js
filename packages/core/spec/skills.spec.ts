import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';

import { describe, it } from 'mocha';

import { expect } from './expect';

describe('The skills of @serenity-js/core', function () {

    this.timeout(30_000);

    const packageRoot = path.resolve(import.meta.dirname, '..');

    function filesUnder(directory: string): string[] {
        return readdirSync(path.join(packageRoot, directory), { recursive: true, withFileTypes: true })
            .filter(entry => entry.isFile())
            .map(entry => path.relative(packageRoot, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
            .sort();
    }

    function filesInTarball(): string[] {
        // on Windows, npm is npm.cmd, which Node only starts with a shell; the arguments are constants, so that's safe
        const [ tarball ] = JSON.parse(execFileSync('npm', [ 'pack', '--dry-run', '--json', '--ignore-scripts' ], {
            cwd: packageRoot,
            encoding: 'utf8',
            shell: process.platform === 'win32',
        }));
        return (tarball.files as Array<{ path: string }>).map(file => file.path);
    }

    it('are published with the package', () => {
        const skills = filesUnder('skills');
        const published = new Set(filesInTarball());

        expect(skills).to.include('skills/serenity-js-writing-tasks/SKILL.md');
        expect(skills.filter(file => ! published.has(file)), 'files under skills/ missing from the tarball').to.deep.equal([]);
    });
});
