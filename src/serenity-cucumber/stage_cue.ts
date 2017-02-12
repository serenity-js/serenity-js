import { serenity } from '../index';

// wait for any tasks outstanding after the previous scenario
// see https://github.com/angular/protractor/issues/4087
export = function() {
    this.Before({timeout: 10 * 1000}, () => serenity.stageManager().waitForNextCue());
};
