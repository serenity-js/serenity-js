import { Activity, Interaction, Task } from '@serenity-js/core';

export class Perform {
    static interactionThatSucceeds = (id: number = 1) =>
        Interaction.where(`#actor succeeds (#${id})`, actor => new Promise((resolve, reject) => {
            setTimeout(resolve, 10);
        }))

    static interactionThatFailsWith = (errorType: new (message: string) => Error) =>
        Interaction.where(`#actor fails due to ${ errorType.name }`, actor => { throw new errorType('failure'); })

    static taskWith = (...activities: Activity[]) => Task.where(`#actor performs activities`, ...activities);
}
