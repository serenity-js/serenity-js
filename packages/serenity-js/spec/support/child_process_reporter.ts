import { DomainEvent } from '../../src/serenity/domain/events';
import { StageCrewMember } from '../../src/serenity/stage/stage_manager';

export class ChildProcessReporter implements StageCrewMember {
    constructor() {
        this.enableSerialisationOfErrors();
    }

    assignTo(stage) {
        stage.manager.registerInterestIn([ DomainEvent ], this);
    }

    notifyOf(event) {
        process.send(event);
    }

    private enableSerialisationOfErrors() {
        if (! ('toJSON' in Error.prototype)) {
            Object.defineProperty(Error.prototype, 'toJSON', {
                value: function() {    // tslint:disable-line:object-literal-shorthand needed for `this` to work
                    const alt = {};

                    Object.getOwnPropertyNames(this).forEach(function(key) {
                        alt[key] = this[key];
                    }, this);

                    return alt;
                },
                configurable: true,
                writable: true,
            });
        }
    }
}

export function childProcessReporter() {
    return new ChildProcessReporter();
}
