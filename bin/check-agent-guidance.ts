/**
 * Checks the agent guidance: that every relative link resolves, including links to headings,
 * and that every skill has a name matching its directory, the right prefix, and a description.
 *
 * Usage: pnpm lint:agent-guidance (part of `pnpm lint`)
 *
 * Checked: `AGENTS.md`, `CLAUDE.md`, `docs/agents/**`, `.agents/contributing-skills/**` and `packages/<package>/skills/**`
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export interface Problem {
    file: string;
    message: string;
}

const CONTRIBUTOR_PREFIX = 'serenity-js-contributing-';
const PACKAGE_PREFIX = 'serenity-js-';

function markdownFilesIn(directory: string): string[] {
    if (! existsSync(directory)) {
        return [];
    }
    return readdirSync(directory, { withFileTypes: true, recursive: true })
        .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
        .map(entry => path.join(entry.parentPath, entry.name))
        .sort();
}

function packageSkillDirectories(root: string): string[] {
    const packages = path.join(root, 'packages');
    if (! existsSync(packages)) {
        return [];
    }
    return readdirSync(packages, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(packages, entry.name, 'skills'))
        .filter(directory => existsSync(directory));
}

function guidanceFiles(root: string): string[] {
    return [
        ...[ 'AGENTS.md', 'CLAUDE.md' ].map(file => path.join(root, file)).filter(file => existsSync(file)),
        ...markdownFilesIn(path.join(root, 'docs', 'agents')),
        ...markdownFilesIn(path.join(root, '.agents', 'contributing-skills')),
        ...packageSkillDirectories(root).flatMap(directory => markdownFilesIn(directory)),
    ];
}

/** Markdown with fenced code blocks and inline code blanked out, so that examples aren't mistaken for links. */
function withoutCode(markdown: string): string {
    return markdown
        .replaceAll(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '')
        .replaceAll(/`[^`\n]*`/g, '');
}

function linksIn(markdown: string): string[] {
    const links: string[] = [];
    for (const [ , destination ] of withoutCode(markdown).matchAll(/\]\(\s*(<[^>]*>|[^)\s]+)(?:\s+"[^"]*")?\s*\)/g)) {
        links.push(destination.startsWith('<') ? destination.slice(1, -1) : destination);
    }
    return links;
}

/** The anchors GitHub generates for the headings of a Markdown document. */
export function anchorsIn(markdown: string): Set<string> {
    const anchors = new Set<string>();
    const occurrences = new Map<string, number>();

    for (const [ , heading ] of markdown.replaceAll(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, '').matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
        const slug = heading
            .toLowerCase()
            .replaceAll(/[^\p{L}\p{N}\p{M} _-]/gu, '')
            .replaceAll(' ', '-');
        const seen = occurrences.get(slug) ?? 0;
        occurrences.set(slug, seen + 1);
        anchors.add(seen === 0 ? slug : `${ slug }-${ seen }`);
    }

    return anchors;
}

function checkLinks(root: string, file: string, markdown: string): Problem[] {
    const problems: Problem[] = [];
    const relativeFile = path.relative(root, file);

    for (const link of linksIn(markdown)) {
        if (/^[a-z][\d+.a-z-]*:/i.test(link)) {
            continue;   // https:, mailto: and other external links
        }

        const [ target, anchor ] = link.split('#', 2);
        const resolved = target === '' ? file : path.resolve(path.dirname(file), decodeURIComponent(target));

        if (! existsSync(resolved)) {
            problems.push({ file: relativeFile, message: `link to ${ link }, which does not exist` });
            continue;
        }

        if (anchor && statSync(resolved).isFile() && resolved.endsWith('.md') && ! anchorsIn(readFileSync(resolved, 'utf8')).has(anchor)) {
            problems.push({ file: relativeFile, message: `link to ${ link }, which has no heading with that anchor` });
        }
    }

    return problems;
}

function frontmatterOf(markdown: string): Map<string, string> | undefined {
    const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(markdown);
    if (! match) {
        return undefined;
    }
    const fields = new Map<string, string>();
    for (const [ , key, value ] of match[1].matchAll(/^([\w-]+):\s*(.*)$/gm)) {
        fields.set(key, value.trim().replace(/^(["'])(.*)\1$/, '$2'));
    }
    return fields;
}

function checkSkills(root: string): Problem[] {
    const problems: Problem[] = [];
    const firstSkillNamed = new Map<string, string>();

    const skillSources = [
        { directory: path.join(root, '.agents', 'contributing-skills'), contributor: true },
        ...packageSkillDirectories(root).map(directory => ({ directory, contributor: false })),
    ];

    for (const { directory, contributor } of skillSources.filter(({ directory }) => existsSync(directory))) {
        for (const entry of readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory())) {
            const skillFile = path.join(directory, entry.name, 'SKILL.md');
            if (! existsSync(skillFile)) {
                continue;
            }

            const file = path.relative(root, skillFile);
            const report = (message: string) => problems.push({ file, message });
            const frontmatter = frontmatterOf(readFileSync(skillFile, 'utf8'));
            const name = frontmatter?.get('name');

            if (! frontmatter || ! name) {
                report('has no frontmatter with a name and description');
                continue;
            }
            if (! frontmatter.get('description')) {
                report('has no description');
            }
            if (name !== entry.name) {
                report(`name is ${ name }, but the directory is ${ entry.name }`);
            }
            if (contributor && ! name.startsWith(CONTRIBUTOR_PREFIX)) {
                report(`contributor skill names start with ${ CONTRIBUTOR_PREFIX }`);
            }
            if (! contributor && ! name.startsWith(PACKAGE_PREFIX)) {
                report(`skill names start with ${ PACKAGE_PREFIX }`);
            }
            if (! contributor && name.startsWith(CONTRIBUTOR_PREFIX)) {
                report(`${ CONTRIBUTOR_PREFIX } is reserved for contributor skills in .agents/contributing-skills`);
            }

            const first = firstSkillNamed.get(name);
            if (first) {
                report(`${ name } is also the name of ${ first }`);
            }
            else {
                firstSkillNamed.set(name, path.relative(root, path.dirname(skillFile)));
            }
        }
    }

    return problems;
}

export function checkAgentGuidance(root: string): Problem[] {
    const linkProblems = guidanceFiles(root).flatMap(file => checkLinks(root, file, readFileSync(file, 'utf8')));
    return [ ...linkProblems, ...checkSkills(root) ];
}

if (require.main === module) {
    const root = path.resolve(__dirname, '..');
    const problems = checkAgentGuidance(root);
    for (const { file, message } of problems) {
        console.error(`${ file }: ${ message }`);
    }
    if (problems.length > 0) {
        console.error(`check-agent-guidance: ${ problems.length } problem(s) found`);
        process.exitCode = 1;
    }
    else {
        console.log(`check-agent-guidance: ${ guidanceFiles(root).length } file(s) checked, no problems found`);
    }
}
