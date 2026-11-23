/**
 * Checks that each commit in a range that only changes the skills packages ship is typed to release those packages:
 * `feat(<package>)` for a new skill, `fix(<package>)` for a change to one.
 *
 * Usage: node --import tsx bin/check-skill-commits.ts <base> <head>
 *        (run by the pr-commitlint workflow on every pull request)
 *
 * The commitlint rule in `bin/commitlint-skill-changes.cjs` does the same in the commit-msg hook, but it only sees
 * the staged files, and a commit made without the hook skips it. Pull requests are merged with merge commits,
 * so each commit's type reaches `main` and decides the release.
 */
import { execFileSync } from 'node:child_process';

export interface Commit {
    sha: string;
    subject: string;
    files: string[];
}

const PACKAGE_SKILL = /^packages\/([^/]+)\/skills\//;
const RELEASING_TYPES = new Set([ 'feat', 'fix' ]);

/** The directories of the packages whose skills a commit changes, or none, when it also changes other files. */
function packagesWhoseSkillsOnlyChangeIn(commit: Commit): string[] {
    const packages = commit.files.map(file => PACKAGE_SKILL.exec(file)?.[1]);
    return packages.length > 0 && packages.every(name => name !== undefined)
        ? [ ...new Set(packages) ].sort()
        : [];
}

function typeAndScopesOf(subject: string): { type: string, scopes: string[] } {
    const [ , type = '', scope = '' ] = /^(\w+)(?:\(([^)]*)\))?!?:/.exec(subject) ?? [];
    return { type, scopes: scope.split(',').map(name => name.trim()) };
}

function problemWith(commit: Commit): string | undefined {
    const packages = packagesWhoseSkillsOnlyChangeIn(commit);
    if (packages.length === 0) {
        return undefined;
    }

    const { type, scopes } = typeAndScopesOf(commit.subject);
    if (RELEASING_TYPES.has(type) && packages.every(name => scopes.includes(name))) {
        return undefined;
    }

    const scope = packages.join(',');
    return `${ commit.sha.slice(0, 10) } ${ commit.subject }: only changes skills of ${ packages.map(name => `@serenity-js/${ name }`).join(', ') }, `
        + `which are released with the package: use feat(${ scope }) for a new skill, and fix(${ scope }) for a change to one`;
}

/**
 * Problems with the commits that only change package skills, as `<short sha> <subject>: <problem>`.
 */
export function problemsWithSkillCommits(commits: Commit[]): string[] {
    return commits.map(problemWith).filter(problem => problem !== undefined);
}

const USAGE = 'usage: check-skill-commits <base> <head>';

/** The command-line arguments: the base and the head of the range of commits to check. */
export function parseArguments(argv: string[]): { base: string, head: string } {
    if (argv.length !== 2 || argv.some(argument => argument.startsWith('-'))) {
        throw new Error(USAGE);
    }
    const [ base, head ] = argv;
    return { base, head };
}

/** The commits in `base..head`, leaving out merge commits, which bring in changes that were checked where they were made. */
function commitsBetween(base: string, head: string): Commit[] {
    const log = execFileSync('git', [ 'log', '--no-merges', '--format=%x00%H%x09%s', '--name-only', `${ base }..${ head }` ], { encoding: 'utf8' });

    return log.split('\0').filter(Boolean).map(entry => {
        const [ header, ...files ] = entry.split('\n');
        const [ sha, subject ] = header.split('\t');
        return { sha, subject, files: files.filter(Boolean) };
    });
}

if (require.main === module) {
    try {
        const { base, head } = parseArguments(process.argv.slice(2));
        const commits = commitsBetween(base, head);
        const problems = problemsWithSkillCommits(commits);
        if (problems.length > 0) {
            throw new Error(`these commits only change package skills, so they must release the package:\n${ problems.map(problem => `  ${ problem }`).join('\n') }`);
        }
        console.log(`check-skill-commits: ${ commits.length } commit(s) checked`);
    }
    catch (error) {
        console.error(`check-skill-commits: ${ (error as Error).message }`);
        process.exitCode = 1;
    }
}
