/* eslint-disable unicorn/consistent-function-scoping */
import 'mocha';

import { given } from 'mocha-testdata';

import { Serenity } from '../../../src';
import { TaskFinished, TaskStarts } from '../../../src/events';
import { Actor, Question } from '../../../src/screenplay';
import { Loop } from '../../../src/screenplay/tasks';
import { Cast } from '../../../src/stage';
import { expect } from '../../expect';
import { Recorder } from '../../Recorder';
import { Spy } from './Spy';

/** @test {Loop} */
describe('Loop', () => {

    let serenity: Serenity,
        recorder: Recorder;

    class Actors implements Cast {
        prepare(actor: Actor): Actor {
            return actor;
        }
    }

    beforeEach(() => {
        serenity = new Serenity();
        recorder = new Recorder();

        serenity.configure({
            crew: [ recorder ],
            actors: new Actors(),
        });
    });

    afterEach(() => Spy.reset());

    const
        personA     = { name: 'Alice' },
        personB     = { name: 'Bob' },
        personC     = { name: 'Celine' },
        listOfPeople      = [ personA, personB, personC ],
        emptyList   = [],
        p           = <T>(value: T): Promise<T> => Promise.resolve(value),
        q           = <T>(value: T): Question<T> => Question.about('a list of people', actor => value);

    given([
        { description: 'static list',               list: listOfPeople         },
        { description: 'Promise<list>',             list: p(listOfPeople)      },
        { description: 'Question<list>',            list: q(listOfPeople)      },
        { description: 'Question<Promise<list>>',   list: q(p(listOfPeople))   },
    ]).
    it(`iterates over a list`, ({ list }) =>
        serenity.theActorCalled('Looper Joe').attemptsTo(
            Loop.over(list).to(Spy.on(Loop.item(), Loop.index()))
        ).then(() => {
            expect(Spy.call(0)).to.deep.equal([ personA, 0 ]);
            expect(Spy.call(1)).to.deep.equal([ personB, 1 ]);
            expect(Spy.call(2)).to.deep.equal([ personC, 2 ]);
        }));

    given([
        { description: 'static list',               list: emptyList         },
        { description: 'Promise<list>',             list: p(emptyList)      },
        { description: 'Question<list>',            list: q(emptyList)      },
        { description: 'Question<Promise<list>>',   list: q(p(emptyList))   },
    ]).
    it(`doesn't iterate over an empty list`, ({ list }) =>
        serenity.theActorCalled('Looper Joe').attemptsTo(
            Loop.over(list).to(Spy.on(Loop.item()))
        ).then(() => {
            expect(Spy.calls()).to.equal(0);
        }));

    it(`reports the loop even when there are no activities to perform`, () =>
        serenity.theActorCalled('Looper Joe').attemptsTo(
            Loop.over(q(listOfPeople)).to(/* do nothing */)
        ).then(() => {
            expect(recorder.events).to.have.lengthOf(2);

            const taskStarts = recorder.events[0] as TaskStarts;
            expect(taskStarts).to.be.instanceOf(TaskStarts);
            expect(taskStarts.details.name.value).to.equal('Looper Joe loops over a list of people');

            const taskFinished = recorder.events[1] as TaskFinished;
            expect(taskFinished).to.be.instanceOf(TaskFinished);
            expect(taskFinished.details.name.value).to.equal('Looper Joe loops over a list of people');
        }));

    given([
        { description: 'empty list',                list: emptyList,            expected: '#actor loops over a list of 0 items' },
        { description: 'singleton list',            list: ['apple'],            expected: '#actor loops over a list of 1 item' },
        { description: 'static list',               list: listOfPeople,         expected: '#actor loops over a list of 3 items' },
        { description: 'Promise<list>',             list: p(listOfPeople),      expected: '#actor loops over a Promise' },
        { description: 'Question<list>',            list: q(listOfPeople),      expected: '#actor loops over a list of people' },
        { description: 'Question<Promise<list>>',   list: q(p(listOfPeople)),   expected: '#actor loops over a list of people' },
    ]).
    it(`provides a sensible description of the task being performed`, ({ list, expected }) => {
        expect(Loop.over(list).to().toString())
            .to.equal(expected);
    });
});
