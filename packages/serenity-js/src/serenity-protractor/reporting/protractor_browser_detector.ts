import { DomainEvent, SceneStarts, SceneTagged, Tag } from '@serenity-js/core/lib/domain';
import { defer } from '@serenity-js/core/lib/recording/async';
import { Stage, StageCrewMember } from '@serenity-js/core/lib/stage';

import { ProtractorBrowser } from 'protractor';

export class ProtractorBrowserDetector implements StageCrewMember {

    private static Events_of_Interest = [ SceneStarts ];
    private stage: Stage;

    constructor(private browser: ProtractorBrowser) {
    }

    assignTo(stage: Stage) {
        this.stage = stage;
        this.stage.manager.registerInterestIn(ProtractorBrowserDetector.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {
        switch (event.constructor.name) { // tslint:disable-line:switch-default - other events will not be sent by design
            case SceneStarts.name:
                return this.sceneStarts(event);
        }
    }

    private sceneStarts(event: SceneStarts): void {
        const browserName = defer(() => this.browser.getCapabilities().then(capabilities => capabilities.get('browserName') ));
        const browserTag = browserName.then(name => new Tag('browser', [ name ]));
        const contextTag = browserName.then(name => new Tag('context', [ name ]));

        this.stage.manager.notifyOf(new SceneTagged(browserTag));
        this.stage.manager.notifyOf(new SceneTagged(contextTag));
    }
}
