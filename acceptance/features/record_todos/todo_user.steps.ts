import { BrowseTheWeb } from '../../../src/screenplay-protractor/abilities/browse_the_web';
import { Actor } from '../../../src/serenity/screenplay/actor';
import { TodoListItems } from '../../screenplay/questions/todo_list_items';
import { AddATodoItem } from '../../screenplay/tasks/add_a_todo_item';
import { Start } from '../../screenplay/tasks/start';
import { listOf } from '../../text_functions';
import { binding, given, then, when } from 'cucumber-tsflow';

import expect = require('../../../spec/expect');
import { Deferred } from '../../../src/serenity/recording/async';

function wrap(step: any): Promise<any> {
    let d = new Deferred();
    // https://github.com/angular/jasminewd/blob/jasminewd2/index.js

    browser.controlFlow().execute(step).then(d.resolve, d.reject);

    return d.promise;
}

@binding()
class TodoUserSteps {

    private james: Actor = Actor.named('James').whoCan(BrowseTheWeb.using(browser));

    @given(/^.*has an empty todo list$/)
    public starts_with_an_empty_list() {
        return wrap(() => {
            return this.james.attemptsTo(
                Start.withAnEmptyTodoList()
            );
        });
    };

    @given(/^.*has a todo list containing (.*)$/)
    public has_a_list_with(items: string) {
        return wrap(() => {

            return this.james.attemptsTo(
                Start.withATodoListContaining(items)
            );

        });
    }

    @when(/^s?he adds '(.*?)' to (?:his|her) list$/)
    public adds(itemName: string) {
        return wrap(() => {

            return this.james.attemptsTo(
                AddATodoItem.called(itemName)
            );

        });
    }

    @then(/^'(.*?)' should be recorded in his list$/)
    public should_see_todo_list_with_just_one(item: string): PromiseLike<any> {

        return this.should_see_todo_list_with_following(item);
    }

    @then(/^.* todo list should contain (.*?)$/)
    public should_see_todo_list_with_following(items: string): PromiseLike<any> {
        return wrap(() => {

            return expect(this.james.toSee(TodoListItems.displayed())).eventually.eql(listOf(items));
        });
    }
}

export = TodoUserSteps;
