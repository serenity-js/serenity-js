import sinon = require('sinon');
import expect = require('./expect');
import { Actor, PerformsTasks, Task } from '../src/screenplay';

import { step } from '../src/recording';
import { Journal, StageManager } from '../src/stage/stage_manager';

describe ('When recording', () => {

    let alice: Actor,
        stage_manager: StageManager;

    beforeEach(() => {
        stage_manager = new StageManager(new Journal());
        alice = new Actor('Alice', stage_manager);
    });

    describe ('Actor', () => {
        describe('performing activities that follow', () => {

            describe('Serenity BDD-style implementation', () => {

                class Follow implements Task {

                    static the = (personOfInterest: string) => new Follow(personOfInterest);

                    @step('{0} follows the #personOfInterest')
                    performAs(actor: PerformsTasks): PromiseLike<void> {
                        return Promise.resolve();
                    }

                    constructor(private personOfInterest: string) {
                    }
                }

                it('notifies the Stage Manager when the activity starts and finishes', () => alice.attemptsTo(Follow.the('white rabbit')).then(() => {
                    const entries = stage_manager.readTheJournal();

                    expect(entries).to.have.lengthOf(2);
                    expect(entries[ 0 ].value).to.deep.equal(entries[ 1 ].value.subject);
                }));

                it('notifies the Stage Manager of Activity\'s invocation location', () => alice.attemptsTo(Follow.the('white rabbit')).then(() => {
                    const entries = stage_manager.readTheJournal();

                    expect(entries[ 0 ].value).to.be.recorded.as('Alice follows the white rabbit').calledAt({
                        line: 43,
                        column: 97,
                        path: '/recording.spec.ts',
                    });
                }));
            });

            describe('ES6-style implementation', () => {

                class Follow implements Task {

                    static the = (personOfInterest: string) => new Follow(personOfInterest);

                    performAs(actor: PerformsTasks): PromiseLike<void> {
                        return Promise.resolve();
                    }

                    toString = () => `{0} follows the ${ this.personOfInterest }`;

                    constructor(private personOfInterest: string) {
                    }
                }

                it('notifies the Stage Manager when the activity starts and finishes', () => alice.attemptsTo(Follow.the('white rabbit')).then(() => {
                    const entries = stage_manager.readTheJournal();

                    expect(entries).to.have.lengthOf(2);
                    expect(entries[ 0 ].value).to.deep.equal(entries[ 1 ].value.subject);
                }));

                it('notifies the Stage Manager of Activity\'s invocation location', () => alice.attemptsTo(Follow.the('white rabbit')).then(() => {
                    const entries = stage_manager.readTheJournal();

                    expect(entries[ 0 ].value).to.be.recorded.as('Alice follows the white rabbit').calledAt({
                        line: 77,
                        column: 97,
                        path: '/recording.spec.ts',
                    });
                }));
            });

            describe('minimalist implementation', () => {

                const Follow = {
                    the: (person_of_interest: string) => Task.where(`{0} follows the ${person_of_interest}`),
                };

                it('notifies the Stage Manager when the activity starts and finishes', () => alice.attemptsTo(Follow.the('white rabbit')).then(() => {
                    const entries = stage_manager.readTheJournal();

                    expect(entries).to.have.lengthOf(2);
                    expect(entries[ 0 ].value).to.deep.equal(entries[ 1 ].value.subject);
                }));

                it('notifies the Stage Manager of Activity\'s invocation location', () => alice.attemptsTo(Follow.the('white rabbit')).then(() => {
                    const entries = stage_manager.readTheJournal();

                    expect(entries[ 0 ].value).to.be.recorded.as('Alice follows the white rabbit').calledAt({
                        line: 101,
                        column: 97,
                        path: '/recording.spec.ts',
                    });
                }));
            });
        });
    });
});
