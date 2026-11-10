// A commitlint rule: a commit that only changes the skills packages ship must release the package,
// because skills are part of a package's public API. A new skill is `feat`, a change to one is `fix`.
//
// commitlint only gives rules the commit message, so the rule looks at the staged files. It applies in the
// commit-msg hook, when there are staged files, and accepts any type when there are none, as when commitlint
// checks a range of existing commits in CI.
const { execFileSync } = require('node:child_process');

const PACKAGE_SKILL = /^packages\/[^/]+\/skills\//;
const RELEASING_TYPES = [ 'feat', 'fix' ];

/** @returns {string[]} */
function stagedFiles() {
    try {
        return execFileSync('git', [ 'diff', '--cached', '--name-only' ], { encoding: 'utf8' }).split('\n').filter(Boolean);
    }
    catch {
        return [];
    }
}

/**
 * @param {() => string[]} files
 * @returns {(parsed: { type?: string | null }) => [ boolean, string? ]}
 */
function skillChangesRelease(files = stagedFiles) {
    return parsed => {
        const changed = files();
        const onlySkills = changed.length > 0 && changed.every(file => PACKAGE_SKILL.test(file));

        return ! onlySkills || RELEASING_TYPES.includes(parsed.type ?? '')
            ? [ true ]
            : [ false, "skills are part of a package's public API and are released with it: use feat(<package>) for a new skill, and fix(<package>) for a change to one" ];
    };
}

module.exports = { skillChangesRelease };
