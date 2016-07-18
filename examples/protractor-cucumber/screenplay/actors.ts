import { Actor, BrowseTheWeb, Cast } from 'serenity/lib/screenplay-protractor';

export class Actors implements Cast {
    actor(name: string): Actor {
        return Actor.named(name).whoCan(BrowseTheWeb.using(browser));
    }
}
