'use strict';

let Serenity        = require('serenity-bdd').Serenity,
    Actors          = require('todomvc-screenplay').Actors,
    AddATodoItem    = require('todomvc-screenplay').AddATodoItem,
    Start           = require('todomvc-screenplay').Start,
    TodoListItems   = require('todomvc-screenplay').TodoListItems,
    expect          = require('./../src/expect');

module.exports = function () {

    /**
     * Initializes Serenity with a Cast of Actors, specific to the domain
     *
     * @type {Stage}
     */
    let stage = Serenity.callToStageFor(new Actors());

    this.Given(/^.*that (.*) has an empty todo list$/, (name) => {

        return stage.theActorCalled(name).attemptsTo(
            Start.withAnEmptyTodoList());
    });

    this.Given(/^.*that (.*) has a todo list containing (.*)$/, (name, items) => {

        return stage.theActorCalled(name).attemptsTo(
            Start.withATodoListContaining(listOf(items))
        );
    });


    this.When(/^s?he adds '(.*?)' to (?:his|her) list$/, (itemName) => {

        return stage.theActorInTheSpotlight().attemptsTo(
            AddATodoItem.called(itemName)
        );
    });

    this.Then(/^'(.*?)' should be recorded in his list$/, (item) => {

        return expect(stage.theActorInTheSpotlight().toSee(TodoListItems.displayed()))
            .eventually.eql([ item ]);
    });

    this.Then(/^.* todo list should contain (.*?)$/, (items) => {

        return expect(stage.theActorInTheSpotlight().toSee(TodoListItems.displayed()))
            .eventually.eql(listOf(items));
    });

    // --

    function listOf (commaSeparatedValues) {
        return commaSeparatedValues.split(',').map(i => i.trim());
    }
};
