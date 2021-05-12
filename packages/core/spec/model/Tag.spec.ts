import 'mocha';

import { given } from 'mocha-testdata';

import { ArbitraryTag, BrowserTag, CapabilityTag, ContextTag, FeatureTag, IssueTag, ManualTag, Tag, Tags, ThemeTag } from '../../src/model';
import { expect } from '../expect';

/**
 * @test {Tag}
 * @test {ArbitraryTag}
 * @test {BrowserTag}
 * @test {CapabilityTag}
 * @test {ContextTag}
 * @test {FeatureTag}
 */
describe('Tag', () => {

    given<string, Tag[]>(
        [ '@manual',                    [ new ManualTag()                                  ] ],
        [ '@issue:ABC-123',             [ new IssueTag('ABC-123')                          ] ],
        [ '@issues:ABC-123',            [ new IssueTag('ABC-123')                          ] ],
        [ '@issue:ABC-123,DEF-456',     [ new IssueTag('ABC-123'), new IssueTag('DEF-456') ] ],
        [ '@issues:ABC-123,DEF-456',    [ new IssueTag('ABC-123'), new IssueTag('DEF-456') ] ],
        [ '@regression',                [ new ArbitraryTag('regression')                   ] ],
        [ '@known_issues',              [ new ArbitraryTag('known_issues')                 ] ],
    ).
    it('can be constructed from a string', (stringTag: string, expectedResults: Tag[]) => {
        const results = Tags.from(stringTag);

        expect(results).to.have.lengthOf(expectedResults.length);

        results.forEach((result: Tag, i: number) => {
            expect(result).to.equal(expectedResults[i]);
        });
    });

    given([
        new ArbitraryTag('wip'),
        new BrowserTag('chrome', '80.0.3987.87'),
        new CapabilityTag('checkout'),
        new ContextTag('mac osx'),
        new FeatureTag('testability'),
        new IssueTag('abc-123'),
        new ManualTag(),
        new ThemeTag('sales'),
    ]).
    it('can be deserialised from a JSON object', (tag: Tag) => {
        expect(Tag.fromJSON(tag.toJSON())).to.equal(tag);
    });
});
