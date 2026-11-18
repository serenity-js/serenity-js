import type { DomainEvent } from '@serenity-js/core/events';
import { CorrelationId } from '@serenity-js/core/model';

/**
 * Coordinates announcing [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/) streamed live
 * from Playwright Test worker processes with the end-of-test flush performed by [`PlaywrightEventBuffer`](https://serenity-js.org/api/playwright-test/class/PlaywrightEventBuffer/),
 * so that each event is announced to the reporter-side stage crew members exactly once:
 * - events streamed live for a scene that has already started are announced immediately,
 * - events streamed live before their scene starts are held back and announced as soon as it does,
 * - events that could not be delivered live (e.g. those recorded before a worker crashed) are announced by the end-of-test flush,
 *   which skips any events already announced live.
 */
export class LiveEventsCoordinator {

    private readonly announcedEventsByScene = new Map<string, Set<string>>();
    private readonly pendingEventsByScene = new Map<string, DomainEvent[]>();
    private readonly startedScenes = new Set<string>();
    private readonly finishedScenes = new Set<string>();

    constructor(private readonly announce: (...events: DomainEvent[]) => void) {
    }

    sceneStarted(sceneId: CorrelationId, sceneStartEvents: DomainEvent[]): void {
        this.startedScenes.add(sceneId.value);

        this.announceAndRecord(sceneId.value, sceneStartEvents);

        const pendingEvents = this.pendingEventsByScene.get(sceneId.value) ?? [];
        this.pendingEventsByScene.delete(sceneId.value);

        this.announceAndRecord(sceneId.value, pendingEvents);
    }

    onStreamedEvent(event: DomainEvent): void {
        const sceneId = this.sceneIdOf(event);

        if (! sceneId || this.finishedScenes.has(sceneId)) {
            return;
        }

        if (this.startedScenes.has(sceneId)) {
            this.announceAndRecord(sceneId, [ event ]);
            return;
        }

        this.pendingEventsByScene.set(sceneId, [ ...(this.pendingEventsByScene.get(sceneId) ?? []), event ]);
    }

    notYetAnnounced(events: DomainEvent[]): DomainEvent[] {
        return events.filter(event => {
            const sceneId = this.sceneIdOf(event);
            const announced = sceneId && this.announcedEventsByScene.get(sceneId);

            return ! announced || ! announced.has(this.serialised(event));
        });
    }

    sceneFinished(sceneId: CorrelationId): void {
        this.finishedScenes.add(sceneId.value);
        this.announcedEventsByScene.delete(sceneId.value);
        this.pendingEventsByScene.delete(sceneId.value);
    }

    sceneFinishedButDeferred(sceneId: CorrelationId): void {
        this.finishedScenes.add(sceneId.value);
        this.pendingEventsByScene.delete(sceneId.value);
    }

    private announceAndRecord(sceneId: string, events: DomainEvent[]): void {
        if (events.length === 0) {
            return;
        }

        const announced = this.announcedEventsByScene.get(sceneId) ?? new Set<string>();
        events.forEach(event => announced.add(this.serialised(event)));
        this.announcedEventsByScene.set(sceneId, announced);

        this.announce(...events);
    }

    private serialised(event: DomainEvent): string {
        return `${ event.constructor.name }:${ JSON.stringify(event.toJSON()) }`;
    }

    private sceneIdOf(event: DomainEvent & { sceneId?: CorrelationId }): string | undefined {
        return event.sceneId instanceof CorrelationId
            ? event.sceneId.value
            : undefined;
    }
}
