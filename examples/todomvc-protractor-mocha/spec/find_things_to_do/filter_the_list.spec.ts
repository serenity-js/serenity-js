import { serenity } from 'serenity-js';
import { Actors, CompleteATodoItem, FilterItems, Start } from 'todomvc-model';
import { Ensure } from '../../src/tasks/ensure';

describe('Finding things to do', function() {
    this.timeout(10000);

    const stage = serenity.callToStageFor(new Actors());

    describe('James can', () => {

        describe('apply filters so that the list', () => {
            beforeEach(() => stage.theActorCalled('James').attemptsTo(
                Start.withATodoListContaining([ 'Write some code', 'Walk the dog' ]),
            ));

            it('shows active items only', () => stage.theActorInTheSpotlight().attemptsTo(
                CompleteATodoItem.called('Write some code'),
                FilterItems.toShowOnly('Active'),
                Ensure.theListOnlyContains('Walk the dog'),
            ));

            it('shows completed items only', () => stage.theActorInTheSpotlight().attemptsTo(
                CompleteATodoItem.called('Write some code'),
                FilterItems.toShowOnly('Completed'),
                Ensure.theListOnlyContains('Write some code'),
            ));
        });

        describe('remove filters so that the list', () => {

            it('shows all the items', () => stage.theActorCalled('James').attemptsTo(
                Start.withATodoListContaining([ 'Write some code', 'Walk the dog' ]),
                CompleteATodoItem.called('Write some code'),
                FilterItems.toShowOnly('Active'),
                FilterItems.toShowOnly('All'),
                Ensure.theListOnlyContains('Write some code', 'Walk the dog'),
            ));
        });
    });
});
