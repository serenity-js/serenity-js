
import { beforeEach, describe, it } from 'mocha';
import { given } from 'mocha-testdata';
import * as sinon from 'sinon';

import { ErrorFactory, ImplementationPendingError } from '../../src/errors';
import { Actor, type Answerable, Clock, Duration, Interaction, Masked, Question, Task, the } from '../../src/screenplay';
import { Stage, StageManager } from '../../src/stage';
import { Extras } from '../../src/stage/Extras';
import { expect } from '../expect';

const p = <T>(value: T) =>
    Promise.resolve(value);

const q = <T>(description: string, value: T) =>
    Question.about(description, actor => value);

describe('Task', () => {

    const interactionTimeout = Duration.ofSeconds(5);

    let stage: Stage,
        Lara: Actor,
        stageManager: sinon.SinonStubbedInstance<StageManager>;

    beforeEach(() => {
        stageManager = sinon.createStubInstance(StageManager);

        stage = new Stage(
            new Extras(),
            stageManager as unknown as StageManager,
            new ErrorFactory(),
            new Clock(),
            interactionTimeout,
        );
        Lara = new Actor('Lara', stage);
    });

    const
        Nock    = () => Interaction.where(`#actor places an arrow on the bow`, actor => void 0),
        Draw    = () => Interaction.where(`#actor pulls back the bow string`, actor => void 0),
        Loose   = () => Interaction.where(`#actor releases an arrow from the bow`, actor => void 0);

    const ShootAnArrow = () => Task.where(`#actor shoots an arrow`,
        Nock(),
        Draw(),
        Loose(),
    );

    it('provides a convenient factory method for defining tasks', () => {

        const Lara = new Actor('Lara', stage as unknown as Stage);

        return expect(Lara.attemptsTo(ShootAnArrow())).to.be.fulfilled;
    });

    it('provides a way to describe a collection of activities', () => {
        expect(ShootAnArrow().toString()).to.equal(`#actor shoots an arrow`);
    });

    it('generates a pending task if no activities are provided', () => {

        const ClimbAMountain = () => Task.where(`#actor climbs a mountain`);

        return expect(Lara.attemptsTo(ClimbAMountain()))
            .to.be.rejectedWith(ImplementationPendingError, `A task where "#actor climbs a mountain" has not been implemented yet`);
    });

    describe('detecting invocation location', () => {
        it('correctly detects its invocation location when configured with no activities', () => {
            const activity = () => Task.where(`#actor climbs a mountain`);
            const location = activity().instantiationLocation();

            expect(location.path.basename()).to.equal('Task.spec.ts');
            expect(location.line).to.equal(72);
            expect(location.column).to.equal(30);
        });

        it('correctly detects its invocation location when configured with custom activities', () => {
            const location = ShootAnArrow().instantiationLocation();

            expect(location.path.basename()).to.equal('Task.spec.ts');
            expect(location.line).to.equal(80);
            expect(location.column).to.equal(30);
        });
    });

    describe('when describing an interaction', () => {

        const description = '#actor interacts with the system';

        describe('toString()', () => {

            given([
                { description: 'string',                    input: description,                         expected: description      },
                { description: 'Promise<string>',           input: p(description),                      expected: 'Promise'        },
                { description: 'Question<string>',          input: q('some question', description),     expected: 'some question'  },
                { description: 'Question<Promise<string>>', input: q('some question', p(description)),  expected: 'some question'  },
            ]).
            it('produces a human-readable static description', ({ input, expected }) => {
                const task = () =>
                    Task.where(input);

                expect(task().toString()).to.equal(expected);
            });
        });

        describe('describedBy(actor)', () => {

            const expected = 'Lara interacts with the system';

            given([
                { description: 'string',                    input: description                         },
                { description: 'Promise<string>',           input: p(description)                      },
                { description: 'Question<string>',          input: q('some question', description)     },
                { description: 'Question<Promise<string>>', input: q('some question', p(description))  },
            ]).
            it('produces a description resolved in the context of the given actor', async ({ input }) => {
                const task = () =>
                    Task.where(input);

                const description = await task().describedBy(Lara);

                expect(description).to.equal(expected);
            });

            it('replaces any placeholders with their descriptions', async () => {
                const systemUnderTest = (name: Answerable<string>) =>
                    Question.about('system under test', actor_ => name)
                        .describedAs(Question.formattedValue());

                const interactWith = (environmentName: Answerable<string>) =>
                    Task.where(the`#actor interacts with ${ systemUnderTest(environmentName) }`);

                const task = interactWith('prod');

                const description = await task.describedBy(Lara);
                const toString    = task.toString();

                expect(description).to.equal('Lara interacts with "prod"');
                expect(toString).to.equal('#actor interacts with system under test');
            });

            describe('with masked values', () => {

                it('masks the value in the description', async () => {
                    const task = Task.where(the`#actor enters ${ Masked.valueOf(`password`) }`);

                    const description = await task.describedBy(Lara);
                    const toString    = task.toString();

                    expect(description).to.equal(`Lara enters [a masked value]`);
                    expect(toString).to.equal(`#actor enters [a masked value]`);
                });

                it(`masks the value in the description when it's nested in an object`, async () => {
                    const taskDescription = the`#actor enters ${ { password: Masked.valueOf(`password`) } }`;
                    const task = Task.where(taskDescription);

                    expect(task.toString()).to.equal(`#actor enters { password: [a masked value] }`);
                });

                it(`masks the value in the description when it's nested in an array`, async () => {
                    const taskDescription = the`#actor enters ${ [ Masked.valueOf(`password`) ] }`;
                    const task = Task.where(taskDescription);

                    expect(task.toString()).to.equal(`#actor enters [ [a masked value] ]`);
                });
            });
        });
    });
});
