import { PerformsTasks, See, step, Task } from 'serenity-js/lib/screenplay';
import { ItemStatus, TodoListItems } from 'todomvc-model';

import chai = require('chai');

chai.use(require('chai-as-promised'));  // tslint:disable-line:no-var-requires

export class Ensure {
    static itemIsMarkedAsCompleted = (item: string): Task => new ItemMarkedAsCompleted(item);

    static theListIncludes = (item: string): Task => new Includes(item);

    static theListOnlyContains = (...items: string[]): Task => new Equals(items);
}

const isMarkedAs = expected => actual => chai.expect(actual).to.eventually.eql(expected);

class ItemMarkedAsCompleted implements Task {

    @step('{0} ensures that \'#item\' is marked as complete')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            See.if(ItemStatus.of(this.item), isMarkedAs('completed')),
        );
    }

    constructor(private item: string) {
    }
}

const equals = expected => actual => chai.expect(actual).to.eventually.eql(expected);

class Equals implements Task {

    @step('{0} ensures that the list contains only #expectedItems')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            See.if(TodoListItems.Displayed, equals(this.expectedItems)),
        );
    }

    constructor(private expectedItems: string[]) {
    }
}

const includes = expected => actual => chai.expect(actual).to.eventually.include(expected);

class Includes implements Task {

    @step('{0} ensures that the list includes #expectedItem')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            See.if(TodoListItems.Displayed, includes(this.expectedItem)),
        );
    }

    constructor(private expectedItem: string) {
    }
}
