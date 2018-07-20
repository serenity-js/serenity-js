import 'mocha';

import { given } from 'mocha-testdata';
import { expect } from '../expect';

import { ArbitraryTag, IssueTag, ManualTag, Tag, Tags } from '../../src/domain';

describe('Tag', () => {

    given<string, Tag[]>(
        [ '@manual',                    [ new ManualTag()                                  ] ],
        [ '@issue:ABC-123',             [ new IssueTag('ABC-123')                          ] ],
        [ '@issues:ABC-123',            [ new IssueTag('ABC-123')                          ] ],
        [ '@issue:ABC-123,DEF-456',     [ new IssueTag('ABC-123'), new IssueTag('DEF-456') ] ],
        [ '@issues:ABC-123,DEF-456',    [ new IssueTag('ABC-123'), new IssueTag('DEF-456') ] ],
        [ '@regression',                [ new ArbitraryTag('regression')                   ] ],
    ).
    it('can be constructed from a string', (stringTag: string, expectedResults: Tag[]) => {
        const results = Tags.from(stringTag);

        expect(results).to.have.lengthOf(expectedResults.length);

        results.forEach((result: Tag, i: number) => {
            expect(result).to.equal(expectedResults[i]);
        });
    });
});
