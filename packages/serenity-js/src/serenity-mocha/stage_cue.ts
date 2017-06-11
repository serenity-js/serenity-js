import { serenity } from '@serenity-js/core';

// wait for any tasks outstanding after the previous scenario
// see https://github.com/angular/protractor/issues/4087
beforeEach(function() {
  this.timeout(serenity.config.stageCueTimeout);
  return serenity.stageManager().waitForNextCue();
});
