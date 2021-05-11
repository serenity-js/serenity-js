/* eslint-disable unicorn/filename-case */
import 'mocha';

import { expect } from '@integration/testing-tools';
import { StageManager } from '@serenity-js/core';
import {
    BusinessRuleDetected,
    SceneFinished,
    SceneParametersDetected,
    SceneSequenceDetected,
    SceneStarts,
    SceneTemplateDetected,
    TestRunFinishes,
} from '@serenity-js/core/lib/events';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { BusinessRule, Category, CorrelationId, Description, ExecutionSuccessful, Name, ScenarioDetails, ScenarioParameters } from '@serenity-js/core/lib/model';
import * as sinon from 'sinon';

import { SerenityBDDReporter } from '../../../../../src';
import { SerenityBDDReport } from '../../../../../src/stage/crew/serenity-bdd-reporter/SerenityBDDJsonSchema';
import { given } from '../../given';
import { create } from '../create';

describe('SerenityBDDReporter', () => {

    let stageManager: sinon.SinonStubbedInstance<StageManager>,
        reporter: SerenityBDDReporter;

    beforeEach(() => {
        const env = create();

        stageManager    = env.stageManager;
        reporter        = env.reporter;
    });

    // see examples/cucumber/features/reporting_results/reports_scenario_outlines.feature for more context
    const
        sceneIds = [ new CorrelationId('scene-0'), new CorrelationId('scene-1') ],
        category = new Category('Reporting results'),
        name     = new Name('Reports scenario outlines'),
        path     = new Path(`reporting_results/reports_scenario_outlines.feature`),
        template = new Description(`
            When <Developer> makes a contribution of:
              | value      |
              | time       |
              | talent     |
              | great code |
            Then they help bring serenity to fellow devs
        `),
        sequence = new ScenarioDetails(name, category, new FileSystemLocation(
            path,
            7,
        )),
        scenarios = [
            new ScenarioDetails(name, category, new FileSystemLocation(path, 25)),
            new ScenarioDetails(name, category, new FileSystemLocation(path, 26)),
        ]
    ;

    /**
     * @test {SerenityBDDReporter}
     * @test {SceneStarts}
     * @test {SceneBackgroundDetected}
     * @test {SceneFinished}
     * @test {ExecutionSuccessful}
     * @test {TestRunFinishes}
     */
    it('captures information about the business rule for single-scene scenarios', () => {
        given(reporter).isNotifiedOfFollowingEvents(
            new SceneStarts(sceneIds[0], scenarios[0]),
            new BusinessRuleDetected(sceneIds[0], scenarios[0], new BusinessRule(new Name('my rule name'), new Description('my rule description'))),
            new SceneFinished(sceneIds[0], scenarios[0], new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

        expect(report.rule.name).to.equal('my rule name');
        expect(report.rule.description).to.equal('my rule description');
    });

    it('captures information about the business rule for scene sequences', () => {
        given(reporter).isNotifiedOfFollowingEvents(
            new SceneSequenceDetected(sceneIds[0], sequence),
            new SceneTemplateDetected(sceneIds[0], template),
            new SceneParametersDetected(
                sceneIds[0],
                scenarios[0],
                new ScenarioParameters(
                    new Name('Serenity/JS contributors'),
                    new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                    { Developer: 'jan-molak', Twitter_Handle: '@JanMolak' },
                ),
            ),
            new SceneStarts(sceneIds[0], scenarios[0]),
            new BusinessRuleDetected(sceneIds[0], scenarios[0], new BusinessRule(new Name('my rule name'), new Description('my rule description'))),
            new SceneFinished(sceneIds[0], scenarios[0], new ExecutionSuccessful()),

            new SceneSequenceDetected(sceneIds[1], sequence),
            new SceneTemplateDetected(sceneIds[1], template),
            new SceneParametersDetected(
                sceneIds[1],
                scenarios[1],
                new ScenarioParameters(
                    new Name('Serenity/JS contributors'),
                    new Description(`Some of the people who have contributed their time and talent to the Serenity/JS project`),
                    { Developer: 'wakaleo', Twitter_Handle: '@wakaleo' },
                ),
            ),
            new SceneStarts(sceneIds[1], scenarios[1]),
            new BusinessRuleDetected(sceneIds[1], scenarios[1], new BusinessRule(new Name('my rule name'), new Description('my rule description'))),
            new SceneFinished(sceneIds[1], scenarios[1], new ExecutionSuccessful()),
            new TestRunFinishes(),
        );

        const report: SerenityBDDReport = stageManager.notifyOf.firstCall.lastArg.artifact.map(_ => _);

        expect(report.rule.name).to.equal('my rule name');
        expect(report.rule.description).to.equal('my rule description');
    });
});
