import { PerformsTasks, See, step, Task } from 'serenity-js/lib/screenplay';
import { ItemStatus, TodoListItems } from 'todomvc-model';

import chai = require('chai');

chai.use(require('chai-as-promised'));  // tslint:disable-line:no-var-requires

export class Ensure {

    static itemIsMarkedAsCompleted = (item: string): Task => new ItemMarkedAsCompleted(item);

    static theListIncludes = (item: string): Task => new Includes(item);

    static theListOnlyContains = (...items: string[]): Task => new Equals(items);
}

class ItemMarkedAsCompleted implements Task {

    @step('{0} ensures that \'#item\' is marked as complete')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            See.that(ItemStatus.of(this.item), status => chai.expect(status).to.eventually.eql('completed')),
        );
    }

    constructor(private item: string) {
    }
}

class Equals implements Task {

    private static fn = expected => actual => chai.expect(actual).to.eventually.eql(expected);

    @step('{0} ensures that the list contains only #expectedItems')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            See.that(TodoListItems.Displayed, Equals.fn(this.expectedItems)),
        );
    }

    constructor(private expectedItems: string[]) {
    }

    // used in @step as #description
    private description() {                                         // tslint:disable-line:no-unused-variable
        return `"${ this.expectedItems.join('", "') }"`;
    }
}

class Includes implements Task {

    private static fn = expected => actual => chai.expect(actual).to.eventually.include(expected);

    @step('{0} ensures that the list includes #expectedItem')
    performAs(actor: PerformsTasks): PromiseLike<void> {
        return actor.attemptsTo(
            See.that(TodoListItems.Displayed, Includes.fn(this.expectedItem)),
        );
    }

    constructor(private expectedItem: string) {
    }
}
