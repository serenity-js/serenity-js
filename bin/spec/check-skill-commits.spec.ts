import { expect } from 'chai';
import { given } from 'mocha-testdata';

import { parseArguments, problemsWithSkillCommits } from '../check-skill-commits';

describe('check-skill-commits', () => {

    const skill = 'packages/core/skills/serenity-js-writing-tasks/SKILL.md';

    function commit(subject: string, files: string[]) {
        return { sha: '1234567890abcdef', subject, files };
    }

    given([
        { description: 'a new skill',      subject: 'feat(core): add a skill for writing tasks' },
        { description: 'a change to one',  subject: 'fix(core): show Answerable parameters in the writing tasks skill' },
    ]).
    it('accepts feat and fix, scoped to the package, for a commit that only changes its skills', ({ subject }) => {
        expect(problemsWithSkillCommits([ commit(subject, [ skill ]) ])).to.deep.equal([]);
    });

    it('rejects any other type for a commit that only changes package skills', () => {
        expect(problemsWithSkillCommits([ commit('docs(core): reword the writing tasks skill', [ skill ]) ])).to.deep.equal([
            '1234567890 docs(core): reword the writing tasks skill: only changes skills of @serenity-js/core, which are released with the package: use feat(core) for a new skill, and fix(core) for a change to one',
        ]);
    });

    it('rejects a scope other than the package whose skills the commit changes', () => {
        expect(problemsWithSkillCommits([ commit('fix(web): reword the writing tasks skill', [ skill ]) ])).to.deep.equal([
            '1234567890 fix(web): reword the writing tasks skill: only changes skills of @serenity-js/core, which are released with the package: use feat(core) for a new skill, and fix(core) for a change to one',
        ]);
    });

    it('accepts a commit that changes the skills of several packages, when its scopes name each of them', () => {
        const files = [ skill, 'packages/web/skills/serenity-js-locating-elements/SKILL.md' ];

        expect(problemsWithSkillCommits([ commit('fix(core,web): refer to skills by name', files) ])).to.deep.equal([]);
        expect(problemsWithSkillCommits([ commit('fix(core): refer to skills by name', files) ])).to.have.length(1);
    });

    given([
        { description: 'other files too',     files: [ skill, 'packages/core/src/index.ts' ] },
        { description: 'contributor skills',  files: [ '.agents/contributing-skills/serenity-js-contributing-core-internals/SKILL.md' ] },
        { description: 'no files',            files: [] },
    ]).
    it('accepts any type for a commit that changes', ({ files }) => {
        expect(problemsWithSkillCommits([ commit('docs(agents): describe the skills', files) ])).to.deep.equal([]);
    });

    it('reports every commit that breaks the rule', () => {
        const problems = problemsWithSkillCommits([
            commit('docs(core): one', [ skill ]),
            commit('fix(core): two', [ skill ]),
            commit('chore(core): three', [ skill ]),
        ]);

        expect(problems).to.have.length(2);
        expect(problems[0]).to.match(/^1234567890 docs\(core\): one: /);
        expect(problems[1]).to.match(/^1234567890 chore\(core\): three: /);
    });

    describe('parseArguments', () => {

        it('takes the base and the head of the range of commits to check', () => {
            expect(parseArguments([ 'abc123', 'def456' ])).to.deep.equal({ base: 'abc123', head: 'def456' });
        });

        it('rejects anything else', () => {
            expect(() => parseArguments([ 'abc123' ])).to.throw('usage: check-skill-commits <base> <head>');
            expect(() => parseArguments([ '--base', 'abc123', 'def456' ])).to.throw('usage: check-skill-commits <base> <head>');
        });
    });
});
