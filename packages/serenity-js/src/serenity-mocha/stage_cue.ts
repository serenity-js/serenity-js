import { serenity } from '../index';

// wait for any tasks outstanding after the previous scenario
// see https://github.com/angular/protractor/issues/4087
beforeEach(function() {
  this.timeout(serenity.config.timeouts.stageCue.toMillis());
  return serenity.stageManager().waitForNextCue();
});
