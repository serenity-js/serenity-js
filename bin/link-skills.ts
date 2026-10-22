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

type SkillKind = 'contributor' | 'package';

export interface Skill {
    name: string;
    source: string;
    kind: SkillKind;
}

export interface LinkReport {
    added: string[];
    removed: string[];
}

interface Link {
    /** Where the link is, relative to the repository root, e.g. `.claude/skills/<name>` */
    path: string;
    /** What the link points to, as written into the link */
    target: string;
}

// ---------------------------------------------------------------------------------------------------------------------
// Finding skills

function subdirectoriesOf(directory: string): string[] {
    return existsSync(directory)
        ? readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name)
        : [];
}

function skillsIn(directory: string, kind: SkillKind): Skill[] {
    return subdirectoriesOf(directory)
        .map(name => ({ name, source: path.join(directory, name), kind }))
        .filter(skill => existsSync(path.join(skill.source, 'SKILL.md')));
}

export function findSkills(root: string): Skill[] {
    const packages = path.join(root, 'packages');

    return [
        ...skillsIn(path.join(root, '.agents', 'contributing-skills'), 'contributor'),
        ...subdirectoriesOf(packages).flatMap(name => skillsIn(path.join(packages, name, 'skills'), 'package')),
    ].sort((a, b) => a.name.localeCompare(b.name));
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

// ---------------------------------------------------------------------------------------------------------------------
// Checking skills

function frontmatterOf(markdown: string): Map<string, string> | undefined {
    const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(markdown);
    return match ? new Map(
        [ ...match[1].matchAll(/^([\w-]+):\s*(.*)$/gm) ]
            .map(([ , key, value ]) => [ key, value.trim().replace(/^(["'])(.*)\1$/, '$2') ]),
    ) : undefined;
}

type Rule = (skill: Skill, name: string, frontmatter: Map<string, string>) => string | undefined;

const rules: Rule[] = [
    (_, __, frontmatter) =>
        frontmatter.get('description') ? undefined : 'has no description',
    (skill, name) =>
        name === skill.name ? undefined : `name is ${ name }, but the directory is ${ skill.name }`,
    (skill, name) =>
        skill.kind === 'contributor' && ! name.startsWith(CONTRIBUTOR_PREFIX)
            ? `contributor skill names start with ${ CONTRIBUTOR_PREFIX }` : undefined,
    (skill, name) =>
        skill.kind === 'package' && ! name.startsWith(PACKAGE_PREFIX)
            ? `skill names start with ${ PACKAGE_PREFIX }` : undefined,
    (skill, name) =>
        skill.kind === 'package' && name.startsWith(CONTRIBUTOR_PREFIX)
            ? `${ CONTRIBUTOR_PREFIX } is reserved for contributor skills in .agents/contributing-skills` : undefined,
];

function posix(root: string, absolutePath: string): string {
    return path.relative(root, absolutePath).split(path.sep).join('/');
}

function problemsWithFrontmatter(skill: Skill): string[] {
    const frontmatter = frontmatterOf(readFileSync(path.join(skill.source, 'SKILL.md'), 'utf8'));
    const name = frontmatter?.get('name');

    return frontmatter && name
        ? rules.map(rule => rule(skill, name, frontmatter)).filter(problem => problem !== undefined)
        : [ 'has no frontmatter with a name and description' ];
}

function problemsWithUniqueness(root: string, skills: Skill[]): Map<Skill, string> {
    const firstWithName = new Map<string, Skill>();
    const problems = new Map<Skill, string>();

    for (const skill of skills) {
        const first = firstWithName.get(skill.name);
        if (first) {
            problems.set(skill, `${ skill.name } is also the name of ${ posix(root, first.source) }`);
        }
        firstWithName.set(skill.name, first ?? skill);
    }

    return problems;
}

/** Problems with the skills' frontmatter, as `<path to SKILL.md>: <problem>`. */
export function problemsWith(root: string, skills: Skill[]): string[] {
    const duplicates = problemsWithUniqueness(root, skills);

    return skills.flatMap(skill =>
        [ ...problemsWithFrontmatter(skill), duplicates.get(skill) ]
            .filter(problem => problem !== undefined)
            .map(problem => `${ posix(root, path.join(skill.source, 'SKILL.md')) }: ${ problem }`),
    );
}

// ---------------------------------------------------------------------------------------------------------------------
// Linking skills

function wantedLinks(root: string, skillDirectory: string, skills: Skill[], platform: NodeJS.Platform): Link[] {
    const directory = path.join(root, skillDirectory);
    return skills.map(skill => ({
        path: path.join(skillDirectory, skill.name),
        target: platform === 'win32' ? skill.source : path.relative(directory, skill.source),
    }));
}

/** The links in a skill directory that this script created, leaving out anything else, like pnpm's. */
function existingLinks(root: string, skillDirectory: string): Link[] {
    const directory = path.join(root, skillDirectory);
    return readdirSync(directory)
        .map(entry => path.join(skillDirectory, entry))
        .filter(link => lstatSync(path.join(root, link)).isSymbolicLink())
        .map(link => ({ path: link, target: readlinkSync(path.join(root, link)) }))
        .filter(link => isSkillSource(root, path.resolve(directory, link.target)));
}

function resolve(root: string, link: Link): string {
    return path.resolve(root, path.dirname(link.path), link.target);
}

function sync(root: string, skillDirectory: string, wanted: Link[], platform: NodeJS.Platform): LinkReport {
    mkdirSync(path.join(root, skillDirectory), { recursive: true });

    const wantedByPath = new Map(wanted.map(link => [ link.path, link ]));
    const outdated = existingLinks(root, skillDirectory)
        .filter(link => ! wantedByPath.has(link.path) || resolve(root, link) !== resolve(root, wantedByPath.get(link.path)!));
    outdated.forEach(link => rmSync(path.join(root, link.path)));

    const missing = wanted.filter(link => ! lstatSync(path.join(root, link.path), { throwIfNoEntry: false }));
    missing.forEach(link => symlinkSync(link.target, path.join(root, link.path), platform === 'win32' ? 'junction' : 'dir'));

    return {
        added: missing.map(link => link.path),
        removed: outdated.filter(link => ! wantedByPath.has(link.path)).map(link => link.path),
    };
}

export function linkSkills(root: string, options: { platform?: NodeJS.Platform } = {}): LinkReport {
    const platform = options.platform ?? process.platform;
    const skills = findSkills(root);

    const problems = problemsWith(root, skills);
    if (problems.length > 0) {
        throw new Error(`nothing linked, until these skills are fixed:\n${ problems.map(problem => `  ${ problem }`).join('\n') }`);
    }

    const reports = SKILL_DIRECTORIES.map(skillDirectory =>
        sync(root, skillDirectory, wantedLinks(root, skillDirectory, skills, platform), platform),
    );

    return {
        added: reports.flatMap(report => report.added),
        removed: reports.flatMap(report => report.removed),
    };
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
