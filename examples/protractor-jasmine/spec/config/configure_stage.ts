import { serenity } from '@serenity-js/core';
import { Actors } from '../support/Actors';

beforeEach(function () {
    this.stage = serenity.callToStageFor(new Actors());
});
