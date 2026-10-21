import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { expect } from 'chai';

import { checkAgentGuidance } from '../check-agent-guidance';

describe('check-agent-guidance', () => {

    let root: string;

    beforeEach(() => {
        root = mkdtempSync(path.join(tmpdir(), 'check-agent-guidance-'));
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
    });

    function file(relativePath: string, content: string): void {
        const absolute = path.join(root, relativePath);
        mkdirSync(path.dirname(absolute), { recursive: true });
        writeFileSync(absolute, content);
    }

    function skill(directory: string, frontmatter: string, body = ''): void {
        file(path.join(directory, 'SKILL.md'), `---\n${ frontmatter }\n---\n\n${ body }`);
    }

    function problems(): string[] {
        return checkAgentGuidance(root).map(({ file, message }) => `${ file }: ${ message }`);
    }

    describe('links', () => {

        it('accepts guidance whose relative links resolve', () => {
            file('AGENTS.md', '# Agents\n\nSee [the workflow](docs/agents/development-workflow.md#pre-commit-checklist).\n');
            file('docs/agents/development-workflow.md', '# Workflow\n\n## Pre-Commit Checklist\n\nBack to [the index](../../AGENTS.md).\n');

            expect(problems()).to.deep.equal([]);
        });

        it('reports a relative link to a file that does not exist', () => {
            file('AGENTS.md', 'See [the workflow](docs/agents/workflow.md).\n');

            expect(problems()).to.deep.equal([
                'AGENTS.md: link to docs/agents/workflow.md, which does not exist',
            ]);
        });

        it('reports a link to a heading that does not exist', () => {
            file('AGENTS.md', 'See [the checklist](docs/agents/development-workflow.md#checklist).\n');
            file('docs/agents/development-workflow.md', '# Workflow\n\n## Pre-Commit Checklist\n');

            expect(problems()).to.deep.equal([
                'AGENTS.md: link to docs/agents/development-workflow.md#checklist, which has no heading with that anchor',
            ]);
        });

        it('matches anchors the way GitHub creates them from headings', () => {
            file('AGENTS.md', [
                '[a](docs/agents/a.md#shell-edits-on-macos-sed-has-no-b)',
                '[b](docs/agents/a.md#ispresent-vs-isvisible-for-conditional-interactions)',
                '[c](docs/agents/a.md#notes-1)',
                '[d](#agents--guidance)',
                '# Agents — guidance',
            ].join('\n'));
            file('docs/agents/a.md', [
                '### Shell edits on macOS: `sed` has no `\\b`',
                '### `isPresent()` vs `isVisible()` for conditional interactions',
                '## Notes',
                '## Notes',
            ].join('\n'));

            expect(problems()).to.deep.equal([]);
        });

        it('checks the links of contributor skills, their references and the skills packages ship', () => {
            skill('.agents/contributing-skills/serenity-js-contributing-example', 'name: serenity-js-contributing-example\ndescription: "An example"', '[gone](references/gone.md)');
            file('.agents/contributing-skills/serenity-js-contributing-example/references/more.md', '[gone](../../missing.md)');
            skill('packages/core/skills/serenity-js-example', 'name: serenity-js-example\ndescription: "An example"', '[gone](./gone.md)');

            expect(problems()).to.deep.equal([
                '.agents/contributing-skills/serenity-js-contributing-example/SKILL.md: link to references/gone.md, which does not exist',
                '.agents/contributing-skills/serenity-js-contributing-example/references/more.md: link to ../../missing.md, which does not exist',
                'packages/core/skills/serenity-js-example/SKILL.md: link to ./gone.md, which does not exist',
            ]);
        });

        it('ignores external links, and links in code', () => {
            file('AGENTS.md', [
                '[site](https://serenity-js.org) [mail](mailto:someone@example.org)',
                '`[not a link](missing.md)`',
                '```markdown',
                '[not a link either](missing.md)',
                '```',
            ].join('\n'));

            expect(problems()).to.deep.equal([]);
        });

        it('reports a missing file in a link with a title, or in angle brackets', () => {
            file('AGENTS.md', '[a](missing-a.md "Title") [b](<missing b.md>)\n');

            expect(problems()).to.deep.equal([
                'AGENTS.md: link to missing-a.md, which does not exist',
                'AGENTS.md: link to missing b.md, which does not exist',
            ]);
        });
    });

    describe('skills', () => {

        it('accepts a skill whose name matches its directory', () => {
            skill('.agents/contributing-skills/serenity-js-contributing-example', 'name: serenity-js-contributing-example\ndescription: "Use when …"');

            expect(problems()).to.deep.equal([]);
        });

        it('reports a skill whose name differs from its directory', () => {
            skill('.agents/contributing-skills/serenity-js-contributing-example', 'name: serenity-js-contributing-other\ndescription: "Use when …"');

            expect(problems()).to.deep.equal([
                '.agents/contributing-skills/serenity-js-contributing-example/SKILL.md: name is serenity-js-contributing-other, but the directory is serenity-js-contributing-example',
            ]);
        });

        it('reports a skill without frontmatter, or without a name or description', () => {
            file('.agents/contributing-skills/serenity-js-contributing-a/SKILL.md', '# No frontmatter\n');
            skill('.agents/contributing-skills/serenity-js-contributing-b', 'name: serenity-js-contributing-b');

            expect(problems()).to.deep.equal([
                '.agents/contributing-skills/serenity-js-contributing-a/SKILL.md: has no frontmatter with a name and description',
                '.agents/contributing-skills/serenity-js-contributing-b/SKILL.md: has no description',
            ]);
        });

        it('reports contributor skills not prefixed with serenity-js-contributing-, and package skills not prefixed with serenity-js-', () => {
            skill('.agents/contributing-skills/serenity-js-example', 'name: serenity-js-example\ndescription: "Use when …"');
            skill('packages/core/skills/writing-tasks', 'name: writing-tasks\ndescription: "Use when …"');

            expect(problems()).to.deep.equal([
                '.agents/contributing-skills/serenity-js-example/SKILL.md: contributor skill names start with serenity-js-contributing-',
                'packages/core/skills/writing-tasks/SKILL.md: skill names start with serenity-js-',
            ]);
        });

        it('reports a package skill that uses the contributor prefix', () => {
            skill('packages/core/skills/serenity-js-contributing-example', 'name: serenity-js-contributing-example\ndescription: "Use when …"');

            expect(problems()).to.deep.equal([
                'packages/core/skills/serenity-js-contributing-example/SKILL.md: serenity-js-contributing- is reserved for contributor skills in .agents/contributing-skills',
            ]);
        });

        it('reports two skills with the same name', () => {
            skill('packages/core/skills/serenity-js-example', 'name: serenity-js-example\ndescription: "Use when …"');
            skill('packages/web/skills/serenity-js-example', 'name: serenity-js-example\ndescription: "Use when …"');

            expect(problems()).to.deep.equal([
                'packages/web/skills/serenity-js-example/SKILL.md: serenity-js-example is also the name of packages/core/skills/serenity-js-example',
            ]);
        });
    });
});
