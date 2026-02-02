import { expect } from '@integration/testing-tools';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { ArbitraryTag, Description, IssueTag, Name, ScenarioParameters } from '@serenity-js/core/lib/model';
import { describe, it } from 'mocha';

import type { FeatureFileMap} from '../../../../../src/listeners/legacy/gherkin';
import { Background, Feature, FeatureFileMapper, FeatureFileParser, GherkinParserAdapter, Scenario, ScenarioOutline, Step } from '../../../../../src/listeners/legacy/gherkin';

describe('FeatureFileMapper', () => {

    const fixtures = new Path(__dirname).join(new Path('fixtures'));

    describe('when mapping names and descriptions', () => {

        it('maps a feature', parse('names_and_descriptions.feature', map => {
            expect(map.get(Feature).onLine(1)).to.equal(new Feature(
                new FileSystemLocation(fixtures.join(new Path('names_and_descriptions.feature')),
                    1,
                    1,
                ),
                new Name('Names and descriptions'),
                new Description('A multi-line\n\ndescription\nof a feature'),
            ));
        }));

        it('maps a scenario with a single-line description', parse('names_and_descriptions.feature', map => {
            const scenario = map.get(Scenario).onLine(8);

            expect(scenario.name).to.equal(new Name('The one with a description'));
            expect(scenario.description).to.equal(new Description('Description of a scenario'));
        }));

        it('maps a scenario with a multi-line description', parse('names_and_descriptions.feature', map => {
            const scenario = map.get(Scenario).onLine(14);

            expect(scenario.name).to.equal(new Name('The one with a multi-line description'));
            expect(scenario.description).to.equal(new Description('A multi-line\n\ndescription\nof a scenario'));
        }));
    });

    describe('when mapping scenarios with no steps', () => {

        it('maps a scenario even though it has no steps defined', parse('no_steps.feature', map => {
            const scenario = map.get(Scenario).onLine(3);

            expect(scenario.name).to.equal(new Name('The one with no steps'));
            expect(scenario.steps).have.lengthOf(0);
        }));
    });

    describe('when mapping scenarios with backgrounds', () => {

        it('maps the background with no name or description', parse('background_with_no_name_or_description.feature', map => {
            const firstBackground = map.get(Background).onLine(3);

            expect(firstBackground.name).to.equal(new Name(''));
            expect(firstBackground.description).to.equal(undefined);
            expect(firstBackground.steps).to.deep.equal([
                new Step(
                    new FileSystemLocation(fixtures.join(new Path('background_with_no_name_or_description.feature')),
                        5,
                        5,
                    ),
                    new Name('Given a prerequisite'),
                ),
            ]);
        }));

        it('maps the background with name and description', parse('backgrounds.feature', map => {
            const firstBackground = map.get(Background).onLine(3);

            expect(firstBackground.name).to.equal(new Name('The one that provides some context'));
            expect(firstBackground.description).to.equal(new Description('Once upon a time, there was a test suite.'));
            expect(firstBackground.steps).to.deep.equal([
                new Step(
                    new FileSystemLocation(fixtures.join(new Path('backgrounds.feature')),
                        7,
                        5,
                    ),
                    new Name('Given a prerequisite'),
                ),
            ]);
        }));

        it('associates the background with the feature', parse('backgrounds.feature', map => {
            const feature = map.get(Feature).onLine(1);

            expect(feature.background).to.equal(
                new Background(
                    new FileSystemLocation(fixtures.join(new Path('backgrounds.feature')), 3, 3),
                    new Name('The one that provides some context'),
                    new Description('Once upon a time, there was a test suite.'),
                    [
                        new Step(
                            new FileSystemLocation(fixtures.join(new Path('backgrounds.feature')), 7, 5),
                            new Name('Given a prerequisite'),
                        ),
                    ],
                )
            );
        }));

        it('associates the background steps with the scenarios', parse('backgrounds.feature', map => {
            const scenario = map.get(Scenario).onLine(9);

            expect(scenario.steps).to.deep.equal([
                new Step(
                    new FileSystemLocation(fixtures.join(new Path('backgrounds.feature')), 7, 5),
                    new Name('Given a prerequisite'),
                ),
                new Step(
                    new FileSystemLocation(fixtures.join(new Path('backgrounds.feature')), 11, 5),
                    new Name('Given some scenario step'),
                ),
            ]);
        }));
    });

    describe('when mapping scenario with special step arguments', () => {

        it('recognises DocString argument', parse('step_arguments.feature', map => {
            const scenario = map.get(Scenario).onLine(3);

            expect(scenario.steps).to.deep.equal([
                new Step(
                    new FileSystemLocation(fixtures.join(new Path('step_arguments.feature')), 5, 5),
                    new Name('Given a step with DocString argument:\nA couple of\nlines of\ntext'),
                ),
            ]);
        }));

        it('recognises DataTable argument', parse('step_arguments.feature', map => {
            const scenario = map.get(Scenario).onLine(12);

            expect(scenario.steps).to.deep.equal([
                new Step(
                    new FileSystemLocation(fixtures.join(new Path('step_arguments.feature')), 14, 5),
                    new Name('Given a step with a DataTable argument:\n| first name | last name |\n| Jan | Molak |'),
                ),
            ]);
        }));
    });

    describe('when mapping scenario outlines with one set of examples', () => {
        it('maps the scenario template', parse('scenario_outlines.feature', map => {
            const
                scenario = map.get(ScenarioOutline).onLine(3),
                path = fixtures.join(new Path('scenario_outlines.feature'));

            expect(scenario).to.equal(new ScenarioOutline(
                new FileSystemLocation(path, 3, 3),
                new Name('The one with examples'),
                new Description('Description of the scenario with examples'),
                [
                    new Step(
                        new FileSystemLocation(path, 7, 5),
                        new Name('Given step with a <parameter>'),
                    ),
                ],
                {
                    14: new ScenarioParameters(
                        new Name('Name of the example set'),
                        new Description('Description of the example set'),
                        { parameter: 'value one' },
                    ),
                    15: new ScenarioParameters(
                        new Name('Name of the example set'),
                        new Description('Description of the example set'),
                        { parameter: 'value two' },
                    ),
                },
            ));
        }));

        it('maps the interpolated scenario', parse('scenario_outlines.feature', map => {
            const path = fixtures.join(new Path('scenario_outlines.feature'));

            expect(map.get(Scenario).onLine(14)).to.equal(new Scenario(
                new FileSystemLocation(path, 14, 7),
                new Name('The one with examples'),
                new Description('Description of the scenario with examples'),
                [
                    new Step(
                        new FileSystemLocation(path, 7, 5),
                        new Name('Given step with a value one'),
                    ),
                ],
                [],
                new FileSystemLocation(path, 3, 3),
            ));

            expect(map.get(Scenario).onLine(15)).to.equal(new Scenario(
                new FileSystemLocation(path, 15, 7),
                new Name('The one with examples'),
                new Description('Description of the scenario with examples'),
                [
                    new Step(
                        new FileSystemLocation(path, 7, 5),
                        new Name('Given step with a value two'),
                    ),
                ],
                [],
                new FileSystemLocation(path, 3, 3),
            ));
        }));
    });

    describe('when mapping scenario outlines with multiple sets of examples', () => {
        it('recognises the different names and descriptions of example sets', parse('scenario_outlines.feature', map => {
            const path = fixtures.join(new Path('scenario_outlines.feature'));

            /* eslint-disable @stylistic/indent */
            expect(map.get(ScenarioOutline).onLine(17)).to.equal(
                new ScenarioOutline(
                    new FileSystemLocation(path, 17, 3),
                    new Name('The one with more examples'),
                    new Description('Description of the scenario with more examples'),
                    [
                        new Step(
                            new FileSystemLocation(path, 21, 5),
                            new Name('Given step with a <parameter>'),
                        ),
                    ],
                    {
                        28: new ScenarioParameters(
                                new Name('Name of the first set of examples'),
                                new Description('Description of the first set of examples'),
                                { parameter: 'value one' },
                            ),
                        29: new ScenarioParameters(
                                new Name('Name of the first set of examples'),
                                new Description('Description of the first set of examples'),
                                { parameter: 'value two' },
                            ),
                        36: new ScenarioParameters(
                                new Name('Name of the second set of examples'),
                                new Description('Description of the second set of examples'),
                                { parameter: 'value three' },
                            ),
                        37: new ScenarioParameters(
                                new Name('Name of the second set of examples'),
                                new Description('Description of the second set of examples'),
                                { parameter: 'value four' },
                            ),
                    },
                )
            );
            /* eslint-enable */
        }));
    });

    describe('when mapping scenario outlines with special step arguments', () => {
        it('recognises and interpolates DocString arguments', parse('scenario_outlines.feature', map => {
            const
                path = fixtures.join(new Path('scenario_outlines.feature')),
                outline = map.get(ScenarioOutline).onLine(39);

            expect(outline.name).to.equal(new Name('The one with parametrised step argument (DocString)'));
            expect(outline.steps[0]).to.equal(new Step(
                new FileSystemLocation(path, 41, 5),
                new Name('Given step with a:\nParameter of <parameter>'),
            ));
            expect(outline.parameters[49]).to.equal(new ScenarioParameters(
                new Name(''),
                new Description(''),
                { parameter: 'value one' },
            ));

            const scenario = map.get(Scenario).onLine(49);
            expect(scenario.steps[ 0 ]).to.equal(new Step(
                new FileSystemLocation(path, 41, 5),
                new Name('Given step with a:\nParameter of value one'),
            ));
        }));

        it('recognises and interpolates DataTable arguments', parse('scenario_outlines.feature', map => {
            const
                outline = map.get(ScenarioOutline).onLine(51),
                path = fixtures.join(new Path('scenario_outlines.feature'));

            expect(outline.name).to.equal(new Name('The one with parametrised step argument (DataTable)'));
            expect(outline.steps[0])
                .to.equal(new Step(
                    new FileSystemLocation(path, 53, 5),
                    new Name('Given the user logs in as <username> with the following credentials:\n| username | <username> |\n| password | <password> |'),
                ));
            expect(outline.parameters[60]).to.equal(new ScenarioParameters(
                new Name(''),
                new Description(''),
                { username: 'admin', password: 'P@ssw0rd1' },
            ));
            expect(outline.parameters[61]).to.equal(new ScenarioParameters(
                new Name(''),
                new Description(''),
                { username: 'editor', password: 'P@ssw0rd2' },
            ));

            expect(map.get(Scenario).onLine(60).steps[0])
                .to.equal(new Step(
                    new FileSystemLocation(path, 53, 5),
                    new Name('Given the user logs in as admin with the following credentials:\n| username | admin |\n| password | P@ssw0rd1 |'),
                ));

            expect(map.get(Scenario).onLine(61).steps[0])
                .to.equal(new Step(
                    new FileSystemLocation(path, 53, 5),
                    new Name('Given the user logs in as editor with the following credentials:\n| username | editor |\n| password | P@ssw0rd2 |'),
                ));
        }));
    });

    describe('when mapping an empty feature file', () => {

        it('returns an empty map', () => {
            const empty = { type: 'GherkinDocument', comments: [] };

            const mapper = new FeatureFileMapper();

            expect(mapper.map(empty, fixtures).size()).to.equal(0);
        });
    });

    describe('when mapping a tagged scenario', () => {

        it('detects all the applicable tags',  parse('tags.feature', map => {
            const scenario = map.get(Scenario).onLine(7);

            expect(scenario.tags[0]).to.equal(new IssueTag('ABC-123'));
            expect(scenario.tags[1]).to.equal(new IssueTag('DEF-456'));
            expect(scenario.tags[2]).to.equal(new ArbitraryTag('saves-data'));
            expect(scenario.tags[3]).to.equal(new IssueTag('GHI-789'));
            expect(scenario.tags[4]).to.equal(new ArbitraryTag('regression'));
        }));
    });

    function parse(featureFileName: string, spec: (map: FeatureFileMap) => void) {
        const
            path = fixtures.join(new Path(featureFileName)),
            mapper = new FeatureFileMapper(),
            loader = new FeatureFileParser(new GherkinParserAdapter());

        return () => loader.parse(path).then(document => mapper.map(document, path)).then(spec);
    }
});
