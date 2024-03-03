import { describe } from 'mocha';
import { given } from 'mocha-testdata';

import { ArbitraryTag, BrowserTag, CapabilityTag, FeatureTag, IssueTag, ManualTag, Tag, Tags, ThemeTag } from '../../src/model';
import { expect } from '../expect';

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

    given<string, string>(
        [ 'tag', 'Tag' ],
        [ 'Tag', 'Tag' ],
        [ 'my_theme', 'My theme' ],
        [ '  leading', 'Leading' ],
        [ 'trailing  ', 'Trailing' ],
        [ 'v1Theme', 'V1 theme'],
        [ 'myTheme', 'My theme' ],
        [ 'MyTheme', 'My theme' ],
        [ 'My Theme', 'My theme' ],
        [ 'BDD', 'BDD' ],
        [ 'MyBDDTheme', 'My BDD theme' ],
        [ 'My_ThemeWithSnakeCase_andCamelCase', 'My theme with snake case and camel case' ],
        [ 'My theme with UPPERCASE abbreviations', 'My theme with UPPERCASE abbreviations' ],
        [ 'multiple     spaces', 'Multiple spaces' ],
        [ 'T3Capability3', 'T3 capability3' ],
        [ '1Capability3', '1 capability3' ],
    ).
    it('can be human-readable', (stringTag: string, expectedResult: string) => {
        const result = Tag.humanReadable(CapabilityTag, stringTag);

        expect(result.name).to.equal(expectedResult);
    });

    given([
        new ArbitraryTag('wip'),
        new BrowserTag('chrome', '80.0.3987.87'),
        new CapabilityTag('checkout'),
        new FeatureTag('testability'),
        new IssueTag('abc-123'),
        new ManualTag(),
        new ThemeTag('sales'),
    ]).
    it('can be deserialised from a JSON object', (tag: Tag) => {
        expect(Tag.fromJSON(tag.toJSON())).to.equal(tag);
    });

    given([
        { title: 'A scenario @scenario @issues:JIRA-1 passes @positive @issues:JIRA-2,JIRA-3', expected: 'A scenario passes' },
        { title: '@just-tag', expected: '' },
        { title: 'tag in the @end', expected: 'tag in the' },
        { title: '@start tag', expected: 'tag' },
    ]).
    it('can be stripped from test titles', ({ title, expected }) => {
        expect(Tags.stripFrom(title)).to.equal(expected);
    });
});
