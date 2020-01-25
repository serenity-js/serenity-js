import { expect } from '@integration/testing-tools';
import { Serenity } from '@serenity-js/core';
import { ArtifactGenerated, SceneFinished } from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { Category, ExecutionSkipped, Name, ScenarioDetails, TextData } from '@serenity-js/core/lib/model';
import { Runner } from 'protractor';
import * as sinon from 'sinon';
import { ProtractorReporter } from '../../../src/adapter/reporter';

/**
 * See the {@link ProtractorFrameworkAdapter} specs to see how the {@link ProtractorReporter} is used in the context
 */
describe('ProtractorReporter', () => {

    let reporter:           ProtractorReporter,
        protractorRunner:   Runner,
        serenity:           Serenity;

    beforeEach(() => {
        protractorRunner    = sinon.createStubInstance(Runner);
        reporter            = new ProtractorReporter(protractorRunner);
        serenity            = new Serenity();

        serenity.configure({ crew: [ reporter ] });
    });

    const details = new ScenarioDetails(
        new Name('scenario name'),
        new Category('scenario category'),
        new FileSystemLocation(new Path('./some/scenario.spec.ts')),
    );

    /** @test {ProtractorReporter} */
    it('ignores events outcomes Protractor doesn\'t care about', () => {

        expect(reporter.notifyOf(new SceneFinished(details, new ExecutionSkipped()))).to.be.undefined;  // tslint:disable-line:no-unused-expression

        expect(reporter.report()).to.deep.equal({
            failedCount: 0,
            specResults: [],
        });
    });

    /** @test {ProtractorReporter} */
    it('ignores domain events Protractor doesn\'t care about', () => {

        const artifact = TextData.fromJSON({ contentType: 'text/plain', data: 'one,two,three'});

        expect(reporter.notifyOf(new ArtifactGenerated(new Name('report.csv'), artifact))).to.be.undefined;  // tslint:disable-line:no-unused-expression

        expect(reporter.report()).to.deep.equal({
            failedCount: 0,
            specResults: [],
        });
    });
});
