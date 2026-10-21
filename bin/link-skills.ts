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
 */
import { existsSync, lstatSync, mkdirSync, readdirSync, readlinkSync, rmSync, symlinkSync } from 'node:fs';
import path from 'node:path';

export const SKILL_DIRECTORIES = [ '.agents/skills', '.claude/skills', '.kiro/skills' ];

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

function isWithin(directory: string, candidate: string): boolean {
    const relative = path.relative(directory, candidate);
    return relative !== '' && ! relative.startsWith('..') && ! path.isAbsolute(relative);
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

function duplicatesIn(root: string, skills: Skill[]): string[] {
    const sourcesByName = new Map<string, string[]>();
    for (const { name, source } of skills) {
        sourcesByName.set(name, [ ...(sourcesByName.get(name) ?? []), path.relative(root, path.dirname(source)) ]);
    }

    return [ ...sourcesByName ]
        .filter(([ , sources ]) => sources.length > 1)
        .map(([ name, sources ]) => `${ name } is in ${ sources.join(' and ') }`);
}

export function linkSkills(root: string, options: { platform?: NodeJS.Platform } = {}): LinkReport {
    const platform = options.platform ?? process.platform;
    const skills = findSkills(root);

    const duplicates = duplicatesIn(root, skills);
    if (duplicates.length > 0) {
        throw new Error(`Skill names must be unique: ${ duplicates.join('; ') }`);
    }

    const roots = sourceRoots(root);
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
            const linkedByUs = roots.some(sourceRoot => isWithin(sourceRoot, path.resolve(directory, target)));
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
