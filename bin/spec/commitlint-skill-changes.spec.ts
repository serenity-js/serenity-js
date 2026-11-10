import { expect } from 'chai';

import { skillChangesRelease } from '../commitlint-skill-changes.cjs';

describe('commitlint rule: skill changes release the package', () => {

    const rule = (stagedFiles: string[]) => skillChangesRelease(() => stagedFiles);

    it('accepts feat for a commit that only changes package skills', () => {
        expect(rule([ 'packages/core/skills/serenity-js-writing-tasks/SKILL.md' ])({ type: 'feat' }))
            .to.deep.equal([ true ]);
    });

    it('accepts fix for a commit that only changes package skills', () => {
        expect(rule([ 'packages/core/skills/serenity-js-writing-tasks/SKILL.md', 'packages/web/skills/x/references/y.md' ])({ type: 'fix' }))
            .to.deep.equal([ true ]);
    });

    it('rejects any other type for a commit that only changes package skills', () => {
        const [ valid, message ] = rule([ 'packages/core/skills/serenity-js-writing-tasks/SKILL.md' ])({ type: 'docs' });

        expect(valid).to.equal(false);
        expect(message).to.equal(
            "skills are part of a package's public API and are released with it: use feat(<package>) for a new skill, and fix(<package>) for a change to one",
        );
    });

    it('accepts any type when the commit also changes other files', () => {
        expect(rule([ 'packages/core/skills/serenity-js-writing-tasks/SKILL.md', 'packages/core/src/index.ts' ])({ type: 'refactor' }))
            .to.deep.equal([ true ]);
    });

    it('accepts any type for contributor skills, which are not published', () => {
        expect(rule([ '.agents/contributing-skills/serenity-js-contributing-core-internals/SKILL.md' ])({ type: 'docs' }))
            .to.deep.equal([ true ]);
    });

    it('accepts any type when nothing is staged, as when commitlint checks commits that already exist', () => {
        expect(rule([])({ type: 'docs' })).to.deep.equal([ true ]);
    });
});
