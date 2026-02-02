import { expect } from '@integration/testing-tools';
import { Path } from '@serenity-js/core/lib/io';
import { describe, it } from 'mocha';

import { FeatureFileParser, GherkinParserAdapter } from '../../../../../src/listeners/legacy/gherkin';

describe('FeatureFileParser', () => {

    const
        sampleFeature = new Path(__dirname).join(new Path('fixtures')).join(new Path('sample.feature')),
        brokenFeature = new Path(__dirname).join(new Path('fixtures')).join(new Path('broken.feature'));

    it('loads a GherkinDocument from a file', () => {
        const loader = new FeatureFileParser(new GherkinParserAdapter());

        return loader.parse(sampleFeature)
            .then(document => {
                expect(document).to.deep.equal({
                    type: 'GherkinDocument',
                    feature: {
                        type: 'Feature',
                        tags: [],
                        location: { line: 1, column: 1 },
                        language: 'en',
                        keyword: 'Feature',
                        name: 'Sample feature',
                        description: 'Description of the feature',
                        children: [ {
                            type: 'Scenario',
                            tags: [],
                            location: { line: 5, column: 3 },
                            keyword: 'Scenario',
                            name: 'Sample scenario',
                            description: 'Description of a scenario',
                            steps: [ {
                                type: 'Step',
                                location: { line: 9, column: 5 },
                                keyword: 'Given ',
                                text: 'some step',
                            } ],
                        } ],
                    },
                    comments: [],
                });
            });
    });

    it('complains if the feature file does not exist', () => {
        const loader = new FeatureFileParser(new GherkinParserAdapter());

        return expect(loader.parse(new Path('path/to/invalid.feature')))
            .to.be.rejectedWith('Could not read feature file at "path/to/invalid.feature"');
    });

    it('complains if the feature file could not be parsed', () => {
        const loader = new FeatureFileParser(new GherkinParserAdapter());

        return expect(loader.parse(brokenFeature))
            .to.be.rejectedWith('Could not parse feature file');
    });
});
