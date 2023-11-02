import * as gherkin from '@cucumber/gherkin';
import * as messages from '@cucumber/messages';
import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { FeatureFileParser } from '../../../../../src/listeners/legacy/gherkin';

describe('FeatureFileParser', () => {

    const sampleFeature = new Path(__dirname).join(new Path('fixtures')).join(new Path('sample.feature'));
    const brokenFeature = new Path(__dirname).join(new Path('fixtures')).join(new Path('broken.feature'));

    it('loads a GherkinDocument from a file', async () => {
        const loader = new FeatureFileParser(parser());

        const document = await loader.parse(sampleFeature);

        expect(document).to.deep.equal({
            feature: {
                tags: [],
                location: {
                    line: 1,
                    column: 1
                },
                language: 'en',
                keyword: 'Feature',
                name: 'Sample feature',
                description: '  Description of the feature',
                children: [
                    {
                        scenario: {
                            id: '1',
                            tags: [],
                            location: {
                                line: 5,
                                column: 3
                            },
                            keyword: 'Scenario',
                            name: 'Sample scenario',
                            description: '    Description of a scenario',
                            steps: [
                                {
                                    dataTable: undefined,
                                    docString: undefined,
                                    id: '0',
                                    location: {
                                        line: 9,
                                        column: 5
                                    },
                                    keyword: 'Given ',
                                    keywordType: 'Context',
                                    text: 'some step'
                                }
                            ],
                            examples: []
                        }
                    }
                ]
            },
            comments: []
        });
    });

    it('complains if the feature file does not exist', () => {
        const loader = new FeatureFileParser(parser());

        return expect(loader.parse(new Path('path/to/invalid.feature')))
            .to.be.rejectedWith('Could not read feature file at "path/to/invalid.feature"');
    });

    it('complains if the feature file could not be parsed', () => {
        const loader = new FeatureFileParser(parser());

        return expect(loader.parse(brokenFeature))
            .to.be.rejectedWith('Could not parse feature file');
    });
});

function parser(): gherkin.Parser<messages.GherkinDocument> {
    const uuidGenerator = messages.IdGenerator.incrementing();
    const builder = new gherkin.AstBuilder(uuidGenerator);
    const matcher = new gherkin.GherkinClassicTokenMatcher();
    return new gherkin.Parser(builder, matcher);
}
