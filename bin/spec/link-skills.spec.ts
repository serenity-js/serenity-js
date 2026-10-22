import { existsSync, lstatSync, mkdirSync, mkdtempSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { expect } from 'chai';

import { findSkills, linkSkills, SKILL_DIRECTORIES } from '../link-skills';

describe('link-skills', () => {

    let root: string;

    beforeEach(() => {
        root = mkdtempSync(path.join(tmpdir(), 'link-skills-'));
    });

    afterEach(() => {
        rmSync(root, { recursive: true, force: true });
    });

    function skill(directory: string): string {
        const source = path.join(root, directory);
        mkdirSync(source, { recursive: true });
        writeFileSync(path.join(source, 'SKILL.md'), `---\nname: ${ path.basename(directory) }\ndescription: "A skill"\n---\n`);
        return source;
    }

    function linkTarget(skillDirectory: string, name: string): string {
        const link = path.join(root, skillDirectory, name);
        expect(lstatSync(link).isSymbolicLink(), `${ link } is a link`).to.equal(true);
        return readlinkSync(link);
    }

    it('links each contributor skill into the skill directory of every supported agent', () => {
        skill('.agents/contributing-skills/serenity-js-contributing-example');

        linkSkills(root);

        expect(SKILL_DIRECTORIES).to.deep.equal([ '.agents/skills', '.claude/skills', '.kiro/skills' ]);
        for (const directory of SKILL_DIRECTORIES) {
            expect(existsSync(path.join(root, directory, 'serenity-js-contributing-example', 'SKILL.md'))).to.equal(true);
        }
    });

    it('links the skills that packages ship', () => {
        skill('packages/core/skills/serenity-js-writing-tasks');

        linkSkills(root);

        expect(existsSync(path.join(root, '.claude/skills/serenity-js-writing-tasks/SKILL.md'))).to.equal(true);
    });

    it('ignores directories without a SKILL.md', () => {
        mkdirSync(path.join(root, '.agents/contributing-skills/not-a-skill'), { recursive: true });

        expect(findSkills(root)).to.deep.equal([]);
    });

    it('links with relative paths, so that the clone can be moved', () => {
        skill('.agents/contributing-skills/serenity-js-contributing-example');

        linkSkills(root, { platform: 'darwin' });

        expect(linkTarget('.kiro/skills', 'serenity-js-contributing-example'))
            .to.equal(path.join('..', '..', '.agents', 'contributing-skills', 'serenity-js-contributing-example'));
    });

    it('links with absolute paths on Windows, where the links are directory junctions', () => {
        const source = skill('.agents/contributing-skills/serenity-js-contributing-example');

        linkSkills(root, { platform: 'win32' });

        expect(path.resolve(linkTarget('.kiro/skills', 'serenity-js-contributing-example'))).to.equal(source);
        expect(path.isAbsolute(linkTarget('.kiro/skills', 'serenity-js-contributing-example'))).to.equal(true);
    });

    it('reports the links it adds', () => {
        skill('.agents/contributing-skills/serenity-js-contributing-example');

        const report = linkSkills(root);

        expect(report.added).to.deep.equal([
            '.agents/skills/serenity-js-contributing-example',
            '.claude/skills/serenity-js-contributing-example',
            '.kiro/skills/serenity-js-contributing-example',
        ]);
        expect(report.removed).to.deep.equal([]);
    });

    it('changes nothing when run again', () => {
        skill('.agents/contributing-skills/serenity-js-contributing-example');
        linkSkills(root);

        const report = linkSkills(root);

        expect(report).to.deep.equal({ added: [], removed: [] });
    });

    it('removes the links of a skill whose source is gone', () => {
        const source = skill('.agents/contributing-skills/serenity-js-contributing-example');
        linkSkills(root);
        rmSync(source, { recursive: true });

        const report = linkSkills(root);

        expect(report.removed).to.deep.equal([
            '.agents/skills/serenity-js-contributing-example',
            '.claude/skills/serenity-js-contributing-example',
            '.kiro/skills/serenity-js-contributing-example',
        ]);
        expect(existsSync(path.join(root, '.claude/skills/serenity-js-contributing-example'))).to.equal(false);
        expect(lstatSync(path.join(root, '.claude/skills'), { throwIfNoEntry: false })?.isDirectory()).to.equal(true);
    });

    it('replaces a link that points to a skill that moved', () => {
        skill('packages/web/skills/serenity-js-example');
        linkSkills(root);
        rmSync(path.join(root, 'packages/web/skills'), { recursive: true });
        skill('packages/core/skills/serenity-js-example');

        const report = linkSkills(root, { platform: 'darwin' });

        expect(report.added).to.have.length(3);
        expect(linkTarget('.claude/skills', 'serenity-js-example'))
            .to.equal(path.join('..', '..', 'packages', 'core', 'skills', 'serenity-js-example'));
    });

    it('removes the links of skills whose package is gone', () => {
        const removedPackage = path.join(root, 'packages/removed');
        skill('packages/removed/skills/serenity-js-removed');
        linkSkills(root);
        rmSync(removedPackage, { recursive: true });

        const report = linkSkills(root);

        expect(report.removed).to.deep.equal([
            '.agents/skills/serenity-js-removed',
            '.claude/skills/serenity-js-removed',
            '.kiro/skills/serenity-js-removed',
        ]);
    });

    it('replaces a link to a skill that moved out of a package that is gone', () => {
        skill('packages/old/skills/serenity-js-example');
        linkSkills(root);
        rmSync(path.join(root, 'packages/old'), { recursive: true });
        skill('packages/new/skills/serenity-js-example');

        const report = linkSkills(root, { platform: 'darwin' });

        expect(report.added).to.have.length(3);
        expect(linkTarget('.claude/skills', 'serenity-js-example'))
            .to.equal(path.join('..', '..', 'packages', 'new', 'skills', 'serenity-js-example'));
    });

    it('leaves alone the skills it did not link, such as those installed by pnpm', () => {
        const installed = path.join(root, 'node_modules/some-package/skills/some-skill');
        mkdirSync(installed, { recursive: true });
        mkdirSync(path.join(root, '.claude/skills/my-own-skill'), { recursive: true });
        symlinkSync(installed, path.join(root, '.claude/skills/pnpm-some-package-some-skill'), 'dir');

        const report = linkSkills(root);

        expect(report).to.deep.equal({ added: [], removed: [] });
        expect(existsSync(path.join(root, '.claude/skills/my-own-skill'))).to.equal(true);
        expect(existsSync(path.join(root, '.claude/skills/pnpm-some-package-some-skill'))).to.equal(true);
    });

    describe('refuses to link', () => {

        function frontmatter(directory: string, content: string): void {
            mkdirSync(path.join(root, directory), { recursive: true });
            writeFileSync(path.join(root, directory, 'SKILL.md'), content);
        }

        function problems(): string {
            try {
                linkSkills(root);
            }
            catch (error) {
                return (error as Error).message;
            }
            throw new Error('linkSkills should have refused to link the skills');
        }

        it('two skills with the same name', () => {
            skill('packages/core/skills/serenity-js-example');
            skill('packages/web/skills/serenity-js-example');

            expect(problems()).to.include('packages/web/skills/serenity-js-example/SKILL.md: serenity-js-example is also the name of packages/core/skills/serenity-js-example');
        });

        it('a skill whose name differs from its directory', () => {
            frontmatter('.agents/contributing-skills/serenity-js-contributing-example', '---\nname: serenity-js-contributing-other\ndescription: "Use when …"\n---\n');

            expect(problems()).to.include('.agents/contributing-skills/serenity-js-contributing-example/SKILL.md: name is serenity-js-contributing-other, but the directory is serenity-js-contributing-example');
        });

        it('a skill without frontmatter, a name or a description', () => {
            frontmatter('.agents/contributing-skills/serenity-js-contributing-a', '# No frontmatter\n');
            frontmatter('.agents/contributing-skills/serenity-js-contributing-b', '---\nname: serenity-js-contributing-b\n---\n');

            const message = problems();

            expect(message).to.include('.agents/contributing-skills/serenity-js-contributing-a/SKILL.md: has no frontmatter with a name and description');
            expect(message).to.include('.agents/contributing-skills/serenity-js-contributing-b/SKILL.md: has no description');
        });

        it('contributor skills not prefixed with serenity-js-contributing-, and package skills not prefixed with serenity-js-', () => {
            skill('.agents/contributing-skills/serenity-js-example');
            skill('packages/core/skills/writing-tasks');

            const message = problems();

            expect(message).to.include('.agents/contributing-skills/serenity-js-example/SKILL.md: contributor skill names start with serenity-js-contributing-');
            expect(message).to.include('packages/core/skills/writing-tasks/SKILL.md: skill names start with serenity-js-');
        });

        it('a package skill that uses the contributor prefix', () => {
            skill('packages/core/skills/serenity-js-contributing-example');

            expect(problems()).to.include('packages/core/skills/serenity-js-contributing-example/SKILL.md: serenity-js-contributing- is reserved for contributor skills in .agents/contributing-skills');
        });

        it('anything, until every problem is fixed', () => {
            skill('.agents/contributing-skills/serenity-js-contributing-fine');
            skill('packages/core/skills/writing-tasks');

            problems();

            expect(existsSync(path.join(root, '.claude/skills/serenity-js-contributing-fine'))).to.equal(false);
        });
    });
});
