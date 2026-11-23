import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { expect } from 'chai';

import { markdownFilesIn } from '../test-skills';

describe('test-skills', function () {

    this.timeout(60_000);

    const script = path.resolve(import.meta.dirname, '..', 'test-skills.ts');

    let root: string;

    beforeEach(() => {
        root = mkdtempSync(path.join(tmpdir(), 'test-skills-'));
        writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: '@serenity-js/example', version: '1.0.0', main: 'index.js' }));
        writeFileSync(path.join(root, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: true, noEmit: true } }));
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
    });

    function file(relativePath: string, contents: string): void {
        mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
        writeFileSync(path.join(root, relativePath), contents);
    }

    function example(code: string): string {
        return `# Example\n\n\`\`\`typescript\n${ code }\n\`\`\`\n`;
    }

    // the fixture package is outside the repository, so tsx is loaded from here, rather than resolved from the package
    function testSkills(): { exitCode: number, output: string } {
        try {
            const output = execFileSync(process.execPath, [ '--import', import.meta.resolve('tsx'), script ], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
            return { exitCode: 0, output };
        }
        catch (error) {
            const { status, stdout, stderr } = error as { status: number, stdout: string, stderr: string };
            return { exitCode: status, output: `${ stdout }${ stderr }` };
        }
    }

    describe('markdownFilesIn', () => {

        it("finds every Markdown file under the package's skills, including supporting files", () => {
            file('skills/serenity-js-b/SKILL.md', '');
            file('skills/serenity-js-a/SKILL.md', '');
            file('skills/serenity-js-a/references/more.md', '');
            file('skills/serenity-js-a/scripts/check.sh', '');
            file('README.md', '');

            expect(markdownFilesIn(root)).to.deep.equal([
                'skills/serenity-js-a/SKILL.md',
                'skills/serenity-js-a/references/more.md',
                'skills/serenity-js-b/SKILL.md',
            ]);
        });

        it('finds nothing in a package without skills', () => {
            expect(markdownFilesIn(root)).to.deep.equal([]);
        });
    });

    it('passes when every example in every skill compiles', () => {
        file('skills/serenity-js-a/SKILL.md', example('const greeting: string = "hello";'));
        file('skills/serenity-js-a/references/more.md', example('const answer: number = 42;'));

        const { exitCode, output } = testSkills();

        expect(output).to.include('test-skills: 2 example(s) in 2 file(s) compiled');
        expect(exitCode).to.equal(0);
    });

    it("fails when an example in one of a skill's supporting files doesn't compile", () => {
        file('skills/serenity-js-a/SKILL.md', example('const greeting: string = "hello";'));
        file('skills/serenity-js-a/references/more.md', example('const answer: number = "forty-two";'));

        const { exitCode, output } = testSkills();

        expect(output).to.include('skills/serenity-js-a/references/more.md, example 1');
        expect(output).to.include("Type 'string' is not assignable to type 'number'");
        expect(exitCode).to.equal(1);
    });

    describe('with examples that import the package', () => {

        // conditions nested as the Serenity/JS packages have them: { import: { types, default }, require: { types, default } }
        const entry = (directory: string) => ({
            import:  { types: `./esm/${ directory }index.d.ts`, default: `./esm/${ directory }index.js` },
            require: { types: `./lib/${ directory }index.d.ts`, default: `./lib/${ directory }index.js` },
        });

        beforeEach(() => {
            writeFileSync(path.join(root, 'package.json'), JSON.stringify({
                name: '@serenity-js/example', version: '1.0.0', main: './lib/index.js', types: './lib/index.d.ts',
                exports: { '.': entry(''), './errors': entry('errors/') },
            }));
            for (const format of [ 'esm', 'lib' ]) {
                file(`${ format }/index.d.ts`, 'export interface Greeting { text: string; }\nexport declare function greet(name: string): Greeting;\n');
                file(`${ format }/index.js`, '');
                file(`${ format }/errors/index.d.ts`, 'export declare class GreetingError extends Error {}\n');
                file(`${ format }/errors/index.js`, '');
            }
        });

        it("compiles examples that import the package's entry point and a subpath, through their nested export conditions", () => {
            file('skills/serenity-js-a/SKILL.md', example("import { greet, type Greeting } from '@serenity-js/example';\n\nconst greeting: Greeting = greet('Alice');"));
            file('skills/serenity-js-a/references/errors.md', example("import { GreetingError } from '@serenity-js/example/errors';\n\nconst error: Error = new GreetingError();"));

            const { exitCode, output } = testSkills();

            expect(output).to.include('test-skills: 2 example(s) in 2 file(s) compiled');
            expect(exitCode).to.equal(0);
        });

        it('fails when an example uses a type it imports from the package wrongly', () => {
            file('skills/serenity-js-a/SKILL.md', example("import { greet, type Greeting } from '@serenity-js/example';\n\nconst greeting: Greeting = greet(42);"));

            const { exitCode, output } = testSkills();

            expect(output).to.include('skills/serenity-js-a/SKILL.md, example 1');
            expect(output).to.include("Argument of type 'number' is not assignable to parameter of type 'string'");
            expect(exitCode).to.equal(1);
        });
    });

    it('fails when the package has no skills to check', () => {
        const { exitCode, output } = testSkills();

        expect(output).to.include('test-skills: no Markdown files under skills/');
        expect(exitCode).to.equal(1);
    });
});
