import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import type { Cast } from '../../../../src';
import { Clock, Duration, ErrorFactory, Stage, StageManager, Timestamp } from '../../../../src';
import { SceneStarts, SceneTagged } from '../../../../src/events';
import { FileSystemLocation, Path } from '../../../../src/io';
import { ArbitraryTag, Category, CorrelationId, Name, ScenarioDetails } from '../../../../src/model';
import { ScenarioTagger } from '../../../../src/stage/crew/scenario-tagger/ScenarioTagger';
import { expect } from '../../../expect';

describe('ScenarioTagger', () => {

    class Extras implements Cast {
        prepare(actor) { return actor; }
    }

    let stage: Stage;

    beforeEach(() => {
        stage = new Stage(new Extras(), new StageManager(Duration.ofMilliseconds(250), new Clock()), new ErrorFactory(), new Clock(), Duration.ofSeconds(2));
    });

    it('emits SceneTagged for each configured tag when a scene starts', () => {
        const tagger = new ScenarioTagger(['@mocha', '@integration']);
        tagger.assignedTo(stage);

        const sceneId = CorrelationId.create();
        const details = new ScenarioDetails(new Name('example'), new Category('Suite'), new FileSystemLocation(Path.from('test.spec.ts'), 1));
        const event = new SceneStarts(sceneId, details, new Timestamp(new Date()));

        const announce = sinon.spy(stage, 'announce');

        tagger.notifyOf(event);

        const tagEvents = announce.getCalls()
            .map(call => call.args[0])
            .filter(e => e instanceof SceneTagged);

        expect(tagEvents).to.have.lengthOf(2);
        expect(tagEvents[0].tag).to.deep.equal(new ArbitraryTag('mocha'));
        expect(tagEvents[0].sceneId).to.equal(sceneId);
        expect(tagEvents[1].tag).to.deep.equal(new ArbitraryTag('integration'));
    });

    it('does not emit events for non-SceneStarts events', () => {
        const tagger = new ScenarioTagger(['@mocha']);
        tagger.assignedTo(stage);

        const announce = sinon.spy(stage, 'announce');

        tagger.notifyOf(new Timestamp(new Date()) as any);

        expect(announce).not.to.have.been.called;
    });

    it('strips the @ prefix from tag values', () => {
        const tagger = new ScenarioTagger(['@slow']);
        tagger.assignedTo(stage);

        const sceneId = CorrelationId.create();
        const details = new ScenarioDetails(new Name('test'), new Category('Suite'), new FileSystemLocation(Path.from('a.ts'), 1));

        const announce = sinon.spy(stage, 'announce');

        tagger.notifyOf(new SceneStarts(sceneId, details, new Timestamp(new Date())));

        const tagEvent = announce.getCalls().map(c => c.args[0]).find(e => e instanceof SceneTagged);
        expect(tagEvent.tag).to.deep.equal(new ArbitraryTag('slow'));
    });

    it('preserves forward slashes in tag values', () => {
        const tagger = new ScenarioTagger(['@playwright/test']);
        tagger.assignedTo(stage);

        const sceneId = CorrelationId.create();
        const details = new ScenarioDetails(new Name('test'), new Category('Suite'), new FileSystemLocation(Path.from('a.ts'), 1));

        const announce = sinon.spy(stage, 'announce');

        tagger.notifyOf(new SceneStarts(sceneId, details, new Timestamp(new Date())));

        const tagEvent = announce.getCalls().map(c => c.args[0]).find(e => e instanceof SceneTagged);
        expect(tagEvent.tag).to.deep.equal(new ArbitraryTag('playwright/test'));
    });

    it('implements the StageCrewMember interface', () => {
        const tagger = new ScenarioTagger(['@tag']);

        expect(tagger).to.have.property('assignedTo').that.is.a('function');
        expect(tagger).to.have.property('notifyOf').that.is.a('function');
    });
});
