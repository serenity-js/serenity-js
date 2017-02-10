import {
    AddATodoItem,
    CompleteATodoItem,
    FilterItems,
    ItemStatus,
    Start,
    TodoListItems,
} from 'todomvc-model';

import { See } from 'serenity-js/lib/screenplay-protractor';

import { expect } from '../../src/expect';
import { listOf } from '../../src/text';

export = function todoUserSteps() {

    this.Given(/^.*that (.*) has an empty todo list$/, function(name: string) {
        return this.stage.theActorCalled(name).attemptsTo(
            Start.withAnEmptyTodoList());
    });

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, function(name: string, items: string) {
        return this.stage.theActorCalled(name).attemptsTo(
            Start.withATodoListContaining(listOf(items)),
        );
    });

    this.When(/^s?he adds (.*?) to (?:his|her) list$/, function(itemName: string) {

        return this.stage.theActorInTheSpotlight().attemptsTo(
            AddATodoItem.called(itemName),
        );
    });

    this.When(/^s?he completes (.*)$/, function(itemName: string) {

        return this.stage.theActorInTheSpotlight().attemptsTo(
            CompleteATodoItem.called(itemName),
        );
    });

    this.When(/^s?he filters (?:her|his) list to show (?:only )?(.*) tasks$/, function(taskType: string) {
        return this.stage.theActorInTheSpotlight().attemptsTo(
            FilterItems.toShowOnly(taskType),
        );
    });

    this.Then(/^(.*?) should be recorded in his list$/, function(item: string) {

        return this.stage.theActorInTheSpotlight().attemptsTo(
            See.if(TodoListItems.Displayed, actual => expect(actual).to.eventually.contain(item)),
        );
    });

    this.Then(/^(.*?) should be marked as (.*?)$/, function(item: string, status: string) {

        return this.stage.theActorInTheSpotlight().attemptsTo(
            See.if(ItemStatus.of(item), actual => expect(actual).to.eventually.eql(status)),
        );
    });

    this.Then(/^.* todo list should contain (.*?)$/, function(items: string) {

        return this.stage.theActorInTheSpotlight().attemptsTo(
            See.if(TodoListItems.Displayed, actual => expect(actual).to.eventually.eql(listOf(items))),
        );
    });
};
