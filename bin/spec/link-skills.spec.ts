import { existsSync, lstatSync, mkdirSync, mkdtempSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { expect } from 'chai';

import { displayPath, findSkills, linkSkills, parseArguments, SKILL_DIRECTORIES } from '../link-skills';

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

    describe('given target directories', () => {

        let workspace: string;

        beforeEach(() => {
            // a workspace that holds the repository as serenity-js, next to a directory of its own skills
            workspace = root;
            root = path.join(workspace, 'serenity-js');
            mkdirSync(root);
        });

        afterEach(() => {
            root = workspace;
        });

        it('links into those directories instead, even outside the repository', () => {
            skill('.agents/contributing-skills/serenity-js-contributing-example');
            const target = path.join(workspace, '.kiro/skills');

            const report = linkSkills(root, { platform: 'darwin', targets: [ target ] });

            expect(readlinkSync(path.join(target, 'serenity-js-contributing-example')))
                .to.equal(path.join('..', '..', 'serenity-js', '.agents', 'contributing-skills', 'serenity-js-contributing-example'));
            expect(report.added).to.deep.equal([ path.join('..', '.kiro', 'skills', 'serenity-js-contributing-example') ]);
            for (const directory of SKILL_DIRECTORIES) {
                expect(existsSync(path.join(root, directory)), directory).to.equal(false);
            }
        });

        it('leaves alone the skills already there that it did not link', () => {
            skill('.agents/contributing-skills/serenity-js-contributing-example');
            const target = path.join(workspace, '.kiro/skills');
            const teamSkill = path.join(target, 'change-project-templates');
            mkdirSync(teamSkill, { recursive: true });
            writeFileSync(path.join(teamSkill, 'SKILL.md'), '---\nname: change-project-templates\ndescription: "Team"\n---\n');

            linkSkills(root, { targets: [ target ] });

            expect(lstatSync(teamSkill).isDirectory()).to.equal(true);
        });

        it('removes the links of skills whose source is gone', () => {
            const source = skill('.agents/contributing-skills/serenity-js-contributing-example');
            const target = path.join(workspace, '.kiro/skills');
            linkSkills(root, { targets: [ target ] });
            rmSync(source, { recursive: true });

            const report = linkSkills(root, { targets: [ target ] });

            expect(report.removed).to.deep.equal([ path.join('..', '.kiro', 'skills', 'serenity-js-contributing-example') ]);
        });
    });

    describe('parseArguments', () => {

        it('links into the default directories without arguments', () => {
            expect(parseArguments([], '/work')).to.deep.equal({ targets: undefined });
        });

        it('takes one or more --target directories, relative to the working directory', () => {
            expect(parseArguments([ '--target', '../.kiro/skills', '--target', '/abs/skills' ], '/work/serenity-js'))
                .to.deep.equal({ targets: [ '/work/.kiro/skills', '/abs/skills' ] });
        });

        it('rejects anything else', () => {
            expect(() => parseArguments([ '--target' ], '/work')).to.throw('usage: link-skills [--target <directory>]...');
            expect(() => parseArguments([ '--force' ], '/work')).to.throw('usage: link-skills [--target <directory>]...');
        });

        it('rejects an option where a directory is required', () => {
            expect(() => parseArguments([ '--target', '--target' ], '/work')).to.throw('usage: link-skills [--target <directory>]...');
        });
    });

    describe('displayPath', () => {

        it('shows a skill directory relative to the repository', () => {
            expect(displayPath('/work/serenity-js', '/work/.kiro/skills/a-skill', path.posix)).to.equal('../.kiro/skills/a-skill');
        });

        it('shows the full path of a skill directory on another Windows drive, which no relative path reaches', () => {
            expect(displayPath('C:\\repo', 'D:\\skills\\a-skill', path.win32)).to.equal('D:\\skills\\a-skill');
        });
    });

    describe('refuses to link', () => {

        function frontmatter(directory: string, content: string): void {
            mkdirSync(path.join(root, directory), { recursive: true });
            writeFileSync(path.join(root, directory, 'SKILL.md'), content);
        }

        function packageJson(directory: string, manifest: Record<string, unknown>): void {
            mkdirSync(path.join(root, directory), { recursive: true });
            writeFileSync(path.join(root, directory, 'package.json'), JSON.stringify(manifest));
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

        it('a package skill that refers to a skill of a package it does not depend on', () => {
            packageJson('packages/core', { name: '@serenity-js/core', scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-writing-tasks/SKILL.md skills/serenity-js-writing-questions/SKILL.md skills/serenity-js-example/SKILL.md' } });
            packageJson('packages/web', { name: '@serenity-js/web', dependencies: { '@serenity-js/core': '3.0.0' }, scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-locating-elements/SKILL.md skills/serenity-js-example/SKILL.md' } });
            skill('packages/web/skills/serenity-js-locating-elements');
            frontmatter('packages/core/skills/serenity-js-writing-tasks',
                '---\nname: serenity-js-writing-tasks\ndescription: "Use when …"\n---\n\nSee the serenity-js-locating-elements skill.\n');

            expect(problems()).to.include('packages/core/skills/serenity-js-writing-tasks/SKILL.md: refers to serenity-js-locating-elements, a skill of @serenity-js/web, which @serenity-js/core does not depend on');
        });

        it('nothing because of references to skills of the same package, or of its dependencies', () => {
            packageJson('packages/core', { name: '@serenity-js/core', scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-writing-tasks/SKILL.md skills/serenity-js-writing-questions/SKILL.md skills/serenity-js-example/SKILL.md' } });
            packageJson('packages/web', { name: '@serenity-js/web', peerDependencies: { '@serenity-js/core': '3.0.0' }, scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-locating-elements/SKILL.md skills/serenity-js-example/SKILL.md' } });
            skill('packages/core/skills/serenity-js-writing-tasks');
            skill('packages/core/skills/serenity-js-writing-questions');
            frontmatter('packages/web/skills/serenity-js-locating-elements',
                '---\nname: serenity-js-locating-elements\ndescription: "Use when …"\n---\n\nSee serenity-js-writing-tasks, and serenity-js-locating-elements itself.\n');
            frontmatter('packages/core/skills/serenity-js-writing-questions',
                '---\nname: serenity-js-writing-questions\ndescription: "Use when …"\n---\n\nSee serenity-js-writing-tasks.\n');

            expect(() => linkSkills(root)).not.to.throw();
        });

        it('nothing because of names that are not skills, or references in contributor skills', () => {
            packageJson('packages/core', { name: '@serenity-js/core', scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-writing-tasks/SKILL.md skills/serenity-js-writing-questions/SKILL.md skills/serenity-js-example/SKILL.md' } });
            packageJson('packages/web', { name: '@serenity-js/web', dependencies: { '@serenity-js/core': '3.0.0' }, scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-locating-elements/SKILL.md skills/serenity-js-example/SKILL.md' } });
            skill('packages/web/skills/serenity-js-locating-elements');
            frontmatter('packages/core/skills/serenity-js-writing-tasks',
                '---\nname: serenity-js-writing-tasks\ndescription: "Use when …"\n---\n\nThe serenity-js-monorepo is not a skill.\n');
            frontmatter('.agents/contributing-skills/serenity-js-contributing-core-internals',
                '---\nname: serenity-js-contributing-core-internals\ndescription: "Use when …"\n---\n\nSee serenity-js-locating-elements.\n');

            expect(() => linkSkills(root)).not.to.throw();
        });

        it("a package skill whose examples the package's test:skills script does not check", () => {
            packageJson('packages/core', { name: '@serenity-js/core', scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-a/SKILL.md' } });
            skill('packages/core/skills/serenity-js-a');
            skill('packages/core/skills/serenity-js-b');

            const message = problems();

            expect(message).to.include("packages/core/skills/serenity-js-b/SKILL.md: isn't checked by the test:skills script of @serenity-js/core, which lists each skill to type-check its examples");
            expect(message).not.to.include('serenity-js-a/SKILL.md');
        });

        it('a package skill whose package has no test:skills script', () => {
            packageJson('packages/core', { name: '@serenity-js/core' });
            skill('packages/core/skills/serenity-js-a');

            expect(problems()).to.include("packages/core/skills/serenity-js-a/SKILL.md: isn't checked by the test:skills script of @serenity-js/core");
        });

        it('a package skill that refers to a contributor skill, which users do not get', () => {
            packageJson('packages/core', { name: '@serenity-js/core', scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-writing-tasks/SKILL.md skills/serenity-js-writing-questions/SKILL.md skills/serenity-js-example/SKILL.md' } });
            skill('.agents/contributing-skills/serenity-js-contributing-core-internals');
            frontmatter('packages/core/skills/serenity-js-writing-tasks',
                '---\nname: serenity-js-writing-tasks\ndescription: "Use when …"\n---\n\nSee serenity-js-contributing-core-internals.\n');

            expect(problems()).to.include('packages/core/skills/serenity-js-writing-tasks/SKILL.md: refers to serenity-js-contributing-core-internals, a contributor skill, which is not published with the package');
        });

        it("a reference that is out of reach in one of the skill's supporting files", () => {
            packageJson('packages/core', { name: '@serenity-js/core', scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-writing-tasks/SKILL.md skills/serenity-js-writing-questions/SKILL.md skills/serenity-js-example/SKILL.md' } });
            packageJson('packages/web', { name: '@serenity-js/web', dependencies: { '@serenity-js/core': '3.0.0' }, scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-locating-elements/SKILL.md skills/serenity-js-example/SKILL.md' } });
            skill('packages/web/skills/serenity-js-locating-elements');
            skill('packages/core/skills/serenity-js-writing-tasks');
            mkdirSync(path.join(root, 'packages/core/skills/serenity-js-writing-tasks/references'));
            writeFileSync(path.join(root, 'packages/core/skills/serenity-js-writing-tasks/references/more.md'), 'See serenity-js-locating-elements.\n');

            expect(problems()).to.include('packages/core/skills/serenity-js-writing-tasks/references/more.md: refers to serenity-js-locating-elements, a skill of @serenity-js/web, which @serenity-js/core does not depend on');
        });

        it("only the duplicate, when another package has a skill with the same name, rather than the skill's own name as a reference", () => {
            packageJson('packages/core', { name: '@serenity-js/core', scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-writing-tasks/SKILL.md skills/serenity-js-writing-questions/SKILL.md skills/serenity-js-example/SKILL.md' } });
            packageJson('packages/web', { name: '@serenity-js/web', dependencies: { '@serenity-js/core': '3.0.0' }, scripts: { 'test:skills': 'typescript-docs-verifier --input-files skills/serenity-js-locating-elements/SKILL.md skills/serenity-js-example/SKILL.md' } });
            skill('packages/core/skills/serenity-js-example');
            skill('packages/web/skills/serenity-js-example');

            const message = problems();

            expect(message).to.include('serenity-js-example is also the name of packages/core/skills/serenity-js-example');
            expect(message).not.to.include('refers to');
        });

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
