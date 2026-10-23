/**
 * Links the skills in this repository into the directories where agents look for them,
 * so that each skill has one source and the links reflect the current branch.
 *
 * Usage: pnpm link-skills [--target <directory>]...
 *        (also the root package's postinstall script, which pnpm runs when it installs or changes dependencies)
 *
 * - Sources: `.agents/contributing-skills/<name>/` and `packages/<package>/skills/<name>/`, each with a `SKILL.md`
 * - Targets: `.agents/skills/`, `.claude/skills/` and `.kiro/skills/`, which are gitignored,
 *   or the directories given with `--target`, relative to the working directory, which may be outside the repository
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
    /** Where the link is, as an absolute path, e.g. `<repository>/.claude/skills/<name>` */
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

interface PackageManifest {
    name: string;
    dependsOn: Set<string>;
    /** The package's `test:skills` script, which type-checks the examples in the skills it lists */
    testSkills: string;
}

function packageManifestOf(skill: Skill): PackageManifest | undefined {
    const manifestPath = path.join(skill.source, '..', '..', 'package.json');
    if (skill.kind !== 'package' || ! existsSync(manifestPath)) {
        return undefined;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const dependsOn = new Set(Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies }));
    return { name: manifest.name, dependsOn, testSkills: manifest.scripts?.['test:skills'] ?? '' };
}

function markdownFilesOf(skill: Skill): string[] {
    return readdirSync(skill.source, { recursive: true, encoding: 'utf8' })
        .filter(file => file.endsWith('.md'))
        .sort()
        .map(file => path.join(skill.source, file));
}

/** Who publishes each skill: the name of its package, or `undefined` for contributor skills, which aren't published. */
function publishersOf(skills: Skill[]): Map<string, string | undefined> {
    return new Map(skills.map(skill => [ skill.name, packageManifestOf(skill)?.name ]));
}

function referenceProblem(skill: Skill, manifest: PackageManifest, name: string, publishers: Map<string, string | undefined>): string | undefined {
    if (name === skill.name || ! publishers.has(name)) {
        return undefined;   // the skill itself, or a name that isn't a skill
    }
    const publisher = publishers.get(name);
    if (publisher === undefined) {
        return `refers to ${ name }, a contributor skill, which is not published with the package`;
    }
    return publisher === manifest.name || manifest.dependsOn.has(publisher)
        ? undefined
        : `refers to ${ name }, a skill of ${ publisher }, which ${ manifest.name } does not depend on`;
}

/**
 * Package skills refer to other skills by name, as relative links break once the packages are installed.
 * A skill, and its supporting files, may only refer to skills of its own package, or of a package it depends on.
 */
function problemsWithReferences(root: string, skills: Skill[]): string[] {
    const publishers = publishersOf(skills);

    return skills.flatMap(skill => {
        const manifest = packageManifestOf(skill);
        return manifest
            ? markdownFilesOf(skill).flatMap(file => {
                const mentioned = new Set(readFileSync(file, 'utf8').match(/\bserenity-js-[\da-z-]+/g) ?? []);
                return [ ...mentioned ]
                    .map(name => referenceProblem(skill, manifest, name, publishers))
                    .filter(problem => problem !== undefined)
                    .map(problem => `${ posix(root, file) }: ${ problem }`);
            })
            : [];
    });
}

/** Package skills whose examples aren't type-checked, because the package's `test:skills` script doesn't list them. */
function problemsWithExampleChecks(root: string, skills: Skill[]): string[] {
    return skills.flatMap(skill => {
        const manifest = packageManifestOf(skill);
        return manifest && ! manifest.testSkills.split(/\s+/).includes(`skills/${ skill.name }/SKILL.md`)
            ? [ `${ posix(root, path.join(skill.source, 'SKILL.md')) }: isn't checked by the test:skills script of ${ manifest.name }, which lists each skill to type-check its examples` ]
            : [];
    });
}

/** Problems with the skills' frontmatter, references and example checks, as `<path to file>: <problem>`. */
export function problemsWith(root: string, skills: Skill[]): string[] {
    const duplicates = problemsWithUniqueness(root, skills);

    return [
        ...skills.flatMap(skill =>
            [ ...problemsWithFrontmatter(skill), duplicates.get(skill) ]
                .filter(problem => problem !== undefined)
                .map(problem => `${ posix(root, path.join(skill.source, 'SKILL.md')) }: ${ problem }`),
        ),
        ...problemsWithReferences(root, skills),
        ...problemsWithExampleChecks(root, skills),
    ];
}

// ---------------------------------------------------------------------------------------------------------------------
// Linking skills

/**
 * How a path in a skill directory is reported: relative to the repository, e.g. `.kiro/skills/<name>`,
 * or as it is when no relative path reaches it, as for a directory on another Windows drive.
 */
export function displayPath(root: string, absolutePath: string, paths: path.PlatformPath = path): string {
    const relative = paths.relative(root, absolutePath);
    return paths.isAbsolute(relative) ? absolutePath : relative;
}

function wantedLinks(directory: string, skills: Skill[], platform: NodeJS.Platform): Link[] {
    return skills.map(skill => ({
        path: path.join(directory, skill.name),
        target: platform === 'win32' ? skill.source : path.relative(directory, skill.source),
    }));
}

/** The links in a skill directory that this script created, leaving out anything else, like pnpm's. */
function existingLinks(root: string, directory: string): Link[] {
    return readdirSync(directory)
        .map(entry => path.join(directory, entry))
        .filter(link => lstatSync(link).isSymbolicLink())
        .map(link => ({ path: link, target: readlinkSync(link) }))
        .filter(link => isSkillSource(root, resolve(link)));
}

function resolve(link: Link): string {
    return path.resolve(path.dirname(link.path), link.target);
}

function sync(root: string, directory: string, wanted: Link[], platform: NodeJS.Platform): LinkReport {
    mkdirSync(directory, { recursive: true });

    const wantedByPath = new Map(wanted.map(link => [ link.path, link ]));
    const outdated = existingLinks(root, directory)
        .filter(link => ! wantedByPath.has(link.path) || resolve(link) !== resolve(wantedByPath.get(link.path)!));
    outdated.forEach(link => rmSync(link.path));

    const missing = wanted.filter(link => ! lstatSync(link.path, { throwIfNoEntry: false }));
    missing.forEach(link => symlinkSync(link.target, link.path, platform === 'win32' ? 'junction' : 'dir'));

    return {
        added: missing.map(link => displayPath(root, link.path)),
        removed: outdated.filter(link => ! wantedByPath.has(link.path)).map(link => displayPath(root, link.path)),
    };
}

const USAGE = 'usage: link-skills [--target <directory>]...';

/** The command-line arguments: no arguments, or `--target <directory>` one or more times. */
export function parseArguments(argv: string[], cwd: string): { targets?: string[] } {
    if (argv.length === 0) {
        return { targets: undefined };
    }
    const isValid = (argument: string, index: number) => index % 2 === 0 ? argument === '--target' : ! argument.startsWith('--');
    if (argv.length % 2 !== 0 || ! argv.every(isValid)) {
        throw new Error(USAGE);
    }
    return { targets: argv.filter((_, index) => index % 2 === 1).map(directory => path.resolve(cwd, directory)) };
}

export function linkSkills(root: string, options: { platform?: NodeJS.Platform, targets?: string[] } = {}): LinkReport {
    const platform = options.platform ?? process.platform;
    const directories = (options.targets ?? SKILL_DIRECTORIES).map(directory => path.resolve(root, directory));
    const skills = findSkills(root);

    const problems = problemsWith(root, skills);
    if (problems.length > 0) {
        throw new Error(`nothing linked, until these skills are fixed:\n${ problems.map(problem => `  ${ problem }`).join('\n') }`);
    }

    const reports = directories.map(directory => sync(root, directory, wantedLinks(directory, skills, platform), platform));

    return {
        added: reports.flatMap(report => report.added),
        removed: reports.flatMap(report => report.removed),
    };
}

if (require.main === module) {
    try {
        const root = path.resolve(__dirname, '..');
        const { targets } = parseArguments(process.argv.slice(2), process.cwd());
        const { added, removed } = linkSkills(root, { targets });
        const skills = findSkills(root).length;
        console.log(`link-skills: ${ skills } skill(s) linked into ${ (targets ?? SKILL_DIRECTORIES).join(', ') }; ${ added.length } link(s) added, ${ removed.length } removed`);
    }
    catch (error) {
        console.error(`link-skills: ${ (error as Error).message }`);
        process.exitCode = 1;
    }
}
