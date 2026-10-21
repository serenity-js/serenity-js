/**
 * Links the skills in this repository into the directories where agents look for them,
 * so that each skill has one source and the links reflect the current branch.
 *
 * Usage: pnpm link-skills (run by `make install`)
 *
 * - Sources: `.agents/contributing-skills/<name>/` and `packages/<package>/skills/<name>/`, each with a `SKILL.md`
 * - Targets: `.agents/skills/`, `.claude/skills/` and `.kiro/skills/`, which are gitignored
 * - Links are relative symlinks, or directory junctions on Windows, which need no extra permissions
 * - Links whose source is gone are removed. Anything else in the target directories, like skills linked by pnpm, is left alone
 * - Nothing is linked unless every skill has a description and a unique name that matches its directory, prefixed with
 *   `serenity-js-contributing-` for contributor skills and `serenity-js-` for the skills packages ship
 */
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, rmSync, symlinkSync } from 'node:fs';
import path from 'node:path';

export const SKILL_DIRECTORIES = [ '.agents/skills', '.claude/skills', '.kiro/skills' ];

const CONTRIBUTOR_PREFIX = 'serenity-js-contributing-';
const PACKAGE_PREFIX = 'serenity-js-';

export interface Skill {
    name: string;
    source: string;
}

export interface LinkReport {
    added: string[];
    removed: string[];
}

function sourceRoots(root: string): string[] {
    const packages = path.join(root, 'packages');
    const packageSkills = existsSync(packages)
        ? readdirSync(packages, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => path.join(packages, entry.name, 'skills'))
        : [];

    return [ path.join(root, '.agents', 'contributing-skills'), ...packageSkills ];
}

/**
 * Whether a link points into one of the places this script links skills from,
 * including packages and skills that no longer exist.
 */
function isSkillSource(root: string, target: string): boolean {
    const [ first, second, third ] = path.relative(root, target).split(path.sep);
    return (first === '.agents' && second === 'contributing-skills')
        || (first === 'packages' && second !== undefined && third === 'skills');
}

export function findSkills(root: string): Skill[] {
    const skills: Skill[] = [];

    for (const sourceRoot of sourceRoots(root).filter(directory => existsSync(directory))) {
        for (const entry of readdirSync(sourceRoot, { withFileTypes: true })) {
            const source = path.join(sourceRoot, entry.name);
            if (entry.isDirectory() && existsSync(path.join(source, 'SKILL.md'))) {
                skills.push({ name: entry.name, source });
            }
        }
    }

    return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function frontmatterOf(markdown: string): Map<string, string> | undefined {
    const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(markdown);
    if (! match) {
        return undefined;
    }
    const fields = new Map<string, string>();
    for (const [ , key, value ] of match[1].matchAll(/^([\w-]+):\s*(.*)$/gm)) {
        fields.set(key, value.trim().replace(/^(["'])(.*)\1$/, '$2'));
    }
    return fields;
}

/** Problems with the skills' frontmatter, as `<path to SKILL.md>: <problem>`. */
export function problemsWith(root: string, skills: Skill[]): string[] {
    const problems: string[] = [];
    const firstSkillNamed = new Map<string, string>();

    for (const { name: directory, source } of skills) {
        const file = path.relative(root, path.join(source, 'SKILL.md')).split(path.sep).join('/');
        const report = (message: string) => problems.push(`${ file }: ${ message }`);
        const contributor = isContributorSkill(root, source);
        const frontmatter = frontmatterOf(readFileSync(path.join(source, 'SKILL.md'), 'utf8'));
        const name = frontmatter?.get('name');

        if (! frontmatter || ! name) {
            report('has no frontmatter with a name and description');
            continue;
        }
        if (! frontmatter.get('description')) {
            report('has no description');
        }
        if (name !== directory) {
            report(`name is ${ name }, but the directory is ${ directory }`);
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
            firstSkillNamed.set(name, path.relative(root, source).split(path.sep).join('/'));
        }
    }

    return problems;
}

function isContributorSkill(root: string, source: string): boolean {
    const [ first, second ] = path.relative(root, source).split(path.sep);
    return first === '.agents' && second === 'contributing-skills';
}

export function linkSkills(root: string, options: { platform?: NodeJS.Platform } = {}): LinkReport {
    const platform = options.platform ?? process.platform;
    const skills = findSkills(root);

    const problems = problemsWith(root, skills);
    if (problems.length > 0) {
        throw new Error(`nothing linked, until these skills are fixed:\n${ problems.map(problem => `  ${ problem }`).join('\n') }`);
    }

    const report: LinkReport = { added: [], removed: [] };

    for (const skillDirectory of SKILL_DIRECTORIES) {
        const directory = path.join(root, skillDirectory);
        mkdirSync(directory, { recursive: true });

        const wanted = new Map(skills.map(skill => [
            skill.name,
            platform === 'win32' ? skill.source : path.relative(directory, skill.source),
        ]));

        // Remove the links this script created whose skill is gone or has moved
        for (const entry of readdirSync(directory)) {
            const link = path.join(directory, entry);
            if (! lstatSync(link).isSymbolicLink()) {
                continue;
            }
            const target = readlinkSync(link);
            const linkedByUs = isSkillSource(root, path.resolve(directory, target));
            if (linkedByUs && path.resolve(directory, target) !== path.resolve(directory, wanted.get(entry) ?? '')) {
                rmSync(link);
                if (! wanted.has(entry)) {
                    report.removed.push(path.join(skillDirectory, entry));
                }
            }
        }

        for (const [ name, target ] of wanted) {
            const link = path.join(directory, name);
            if (lstatSync(link, { throwIfNoEntry: false })) {
                continue;
            }
            symlinkSync(target, link, platform === 'win32' ? 'junction' : 'dir');
            report.added.push(path.join(skillDirectory, name));
        }
    }

    return report;
}

if (require.main === module) {
    try {
        const root = path.resolve(__dirname, '..');
        const { added, removed } = linkSkills(root);
        const skills = findSkills(root).length;
        console.log(`link-skills: ${ skills } skill(s) linked into ${ SKILL_DIRECTORIES.join(', ') }; ${ added.length } link(s) added, ${ removed.length } removed`);
    }
    catch (error) {
        console.error(`link-skills: ${ (error as Error).message }`);
        process.exitCode = 1;
    }
}
