import cucumber0 from './cucumber-0.js';
import type { Dependencies } from './Dependencies.js';

export default function ({ serenity, notifier, resultMapper, loader, cucumber, cache, mapper }: Dependencies) {
    cucumber.defineSupportCode(support =>
        cucumber0({ serenity, notifier, resultMapper, loader, cucumber, cache, mapper }).call(support)
    );

    return function (): void {
        // no-op
    };
}
