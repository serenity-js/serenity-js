/**
 * Type-checks every `typescript`, `ts` and `tsx` example in the skills a package ships, in `SKILL.md` and in its
 * supporting files, with `typescript-docs-verifier`, against the compiled package.
 *
 * Usage: node --import tsx ../../bin/test-skills.ts
 *        (each package's `test:skills` script, run in the package's directory)
 *
 * It finds the Markdown files itself, so a new skill or supporting file is checked without changing the script,
 * and it fails when there are none, so a package can't run it with its skills gone unnoticed.
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { compileSnippets } from 'typescript-docs-verifier';

const SKILLS = 'skills';

/** Every Markdown file under the package's `skills/`, as sorted POSIX paths relative to the package, e.g. `skills/<name>/SKILL.md`. */
export function markdownFilesIn(packageRoot: string): string[] {
    const skills = path.join(packageRoot, SKILLS);
    return existsSync(skills)
        ? readdirSync(skills, { recursive: true, encoding: 'utf8' })
            .filter(file => file.endsWith('.md'))
            .map(file => [ SKILLS, ...file.split(path.sep) ].join('/'))
            .sort()
        : [];
}

async function testSkills(packageRoot: string): Promise<string> {
    const files = markdownFilesIn(packageRoot);
    if (files.length === 0) {
        throw new Error(`no Markdown files under ${ SKILLS }/ in ${ packageRoot }`);
    }

    const results = await compileSnippets({ markdownFiles: files });
    const failures = results.filter(result => result.error);
    if (failures.length > 0) {
        throw new Error(`${ failures.length } of ${ results.length } example(s) don't compile:\n\n${ failures
            .map(result => `${ result.file }, example ${ result.index }:\n${ result.error!.message }\n\n${ result.snippet }`)
            .join('\n\n') }`);
    }

    return `${ results.length } example(s) in ${ files.length } file(s) compiled`;
}

if (require.main === module) {
    testSkills(process.cwd())
        .then(summary => console.log(`test-skills: ${ summary }`))
        .catch(error => {
            console.error(`test-skills: ${ (error as Error).message }`);
            process.exitCode = 1;
        });
}
