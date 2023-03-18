import { Activity, Interaction, Task } from '@serenity-js/core';
import { FileSystemLocation, Path } from '@serenity-js/core/lib/io';
import { ActivityDetails, Category, CorrelationId, Name, ScenarioDetails } from '@serenity-js/core/lib/model';

export class Perform {
    static interactionThatSucceeds = (id = 1): Interaction =>
        Interaction.where(`#actor succeeds (#${ id })`, actor => new Promise((resolve, reject) => {
            setTimeout(resolve, 10);
        }));

    static interactionThatFailsWith = (errorType: new (message: string) => Error): Interaction =>
        Interaction.where(`#actor fails due to ${ errorType.name }`, actor => {
            throw new errorType('failure');
        });

    static taskWith = (...activities: Activity[]): Task =>
        Task.where(`#actor performs activities`, ...activities);
}

export const defaultCardScenario = new ScenarioDetails(
    new Name('Paying with a default card'),
    new Category('Online Checkout'),
    new FileSystemLocation(
        new Path(`payments/checkout.feature`),
    ),
);

export const pickACard = new ActivityDetails(
    new Name('Pick the default credit card'),
    new FileSystemLocation(Path.from('payments/checkout.steps.ts'), 0, 0),
);

export const sceneId = new CorrelationId('a-scene-id');

export const activityId = new CorrelationId('activity-id');
