import * as events from '@serenity-js/core/lib/events';

export interface SpawnResult {
    events: events.DomainEvent[];
    exitCode: number;
    stdout: string;
    stderr: string;
}
