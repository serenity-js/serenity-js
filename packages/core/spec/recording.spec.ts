import sinon = require('sinon');
import expect = require('./expect');
import { Actor, PerformsTasks, Question, Task, UsesAbilities } from '../src/screenplay';

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

            describe('data-driven approach', () => {

                class Destinations implements Question<PromiseLike<string[]>> {

                    static available(): Question<PromiseLike<string[]>> {
                        return new Destinations();
                    }

                    answeredBy(actor: UsesAbilities): PromiseLike<string[]> {
                        return Promise.resolve([ 'The Wonderland' ]);
                    }
                }

                const Walk = {
                    towards: (destination: string) => Task.where(`{0} walks towards ${destination}`),
                };

                class Follow implements Task {
                    static the = (person_of_interest: string) => new Follow(person_of_interest);

                    performAs(actor: PerformsTasks & UsesAbilities): PromiseLike<void> {
                        const availableDestinations = [ 'The Wonderland' ];

                        return Destinations.available().answeredBy(actor).then(destinations => {
                            return actor.attemptsTo(
                                ...destinations.map(destination =>
                                    Walk.towards(destination),
                                ),
                            );
                        });
                    }

                    toString = () => `{0} follows the ${this.person_of_interest}`

                    constructor(private person_of_interest: string) {
                    }
                }

                it('notifies the Stage Manager of Activity\'s invocation location', () => alice.attemptsTo(Follow.the('white rabbit')).then(() => {
                    const entries = stage_manager.readTheJournal();

                    expect(entries[ 0 ].value).to.be.recorded.as('Alice follows the white rabbit').calledAt({
                        line: 150,
                        column: 97,
                        path: '/recording.spec.ts',
                    });

                    expect(entries[ 1 ].value).to.be.recorded.as('Alice walks towards The Wonderland').calledAt({
                        line: 136,
                        column: 52,
                        path: '/recording.spec.ts',
                    });
                }));
            });
        });
    });
});
