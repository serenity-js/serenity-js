import { protractor } from 'protractor';
import { Actor, BrowseTheWeb, Cast } from 'serenity-js/lib/screenplay-protractor';

// note: it's important to use `protractor.browser` not simply `browser`
//       a bug in Protractor makes the latter to fail upon a browser restart
//       see: https://github.com/angular/protractor/issues/2001

export class Actors implements Cast {
    actor(name: string): Actor {
        return Actor.named(name).whoCan(BrowseTheWeb.using(protractor.browser));
    }
}
