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
        skill('.agents/contributing-skills/serenity-js-example');
        linkSkills(root);
        rmSync(path.join(root, '.agents/contributing-skills'), { recursive: true });
        skill('packages/core/skills/serenity-js-example');

        const report = linkSkills(root, { platform: 'darwin' });

        expect(report.added).to.have.length(3);
        expect(linkTarget('.claude/skills', 'serenity-js-example'))
            .to.equal(path.join('..', '..', 'packages', 'core', 'skills', 'serenity-js-example'));
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

    it('refuses to link two skills with the same name', () => {
        skill('.agents/contributing-skills/serenity-js-example');
        skill('packages/core/skills/serenity-js-example');

        expect(() => linkSkills(root)).to.throw(/serenity-js-example.*\.agents\/contributing-skills.*packages\/core\/skills/s);
    });
});
