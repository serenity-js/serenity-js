import { DomainEvent } from '@serenity-js/core/lib/events';

export class CategorisedEvents<EventProperties> {
    private readonly eventsByCategory: Map<string, Array<DomainEvent & EventProperties>> = new Map();

    constructor(private readonly categoryName: (event: DomainEvent & EventProperties) => string) {
    }

    add(event: DomainEvent & EventProperties) {
        const category = this.categoryName(event);

        if (! this.eventsByCategory.has(category)) {
            this.eventsByCategory.set(category, []);
        }

        this.eventsByCategory.get(category).push(event);
    }

    forEach<T>(callback: (eventsInCategory: Array<DomainEvent & EventProperties>) => void): void {
        this.eventsByCategory.forEach(callback);
    }

    clear(): void {
        this.eventsByCategory.clear();
    }
}
