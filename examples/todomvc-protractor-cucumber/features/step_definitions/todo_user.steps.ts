import { Serenity } from 'serenity-js';

import {
    Actors,
    AddATodoItem,
    CompleteATodoItem,
    FilterItems,
    ItemStatus,
    Start,
    TodoListItems,
} from '../../src/screenplay';

import { expect } from '../../src/expect';
import { listOf } from '../../src/text';

export = function todoUserSteps() {

    /**
     *  Initialises Serenity with a custom Cast of Actors, specific to your domain
     */
    let stage = Serenity.callToStageFor(new Actors());

    this.Given(/^.*that (.*) has an empty todo list$/, (name) => {

        return stage.theActorCalled(name).attemptsTo(
            Start.withAnEmptyTodoList());
    });

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (name: string, items: string) => {

        return stage.theActorCalled(name).attemptsTo(
            Start.withATodoListContaining(listOf(items))
        );
    });

    this.When(/^s?he adds (.*?) to (?:his|her) list$/, (itemName: string) => {

        return stage.theActorInTheSpotlight().attemptsTo(
            AddATodoItem.called(itemName)
        );
    });

    this.When(/^s?he completes (.*)$/, (itemName: string) => {

        return stage.theActorInTheSpotlight().attemptsTo(
            CompleteATodoItem.called(itemName)
        );
    });

    this.When(/^s?he filters (?:her|his) list to show (?:only )?(.*) tasks$/, (taskType: string) => {
        return stage.theActorInTheSpotlight().attemptsTo(
            FilterItems.toShowOnly(taskType)
        );
    });

    this.Then(/^(.*?) should be recorded in his list$/, (item: string) => {

        return expect(stage.theActorInTheSpotlight().toSee(TodoListItems.Displayed))
            .eventually.contain(item);
    });

    this.Then(/^(.*?) should be marked as (.*?)$/, (item: string, status: string) => {

        return expect(stage.theActorInTheSpotlight().toSee(ItemStatus.of(item)))
            .eventually.equal(status);
    });

    this.Then(/^.* todo list should contain (.*?)$/, (items: string) => {

        return expect(stage.theActorInTheSpotlight().toSee(TodoListItems.Displayed))
            .eventually.eql(listOf(items));
    });
};
