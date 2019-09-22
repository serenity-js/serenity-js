import { serenity } from '@serenity-js/core';
import { Actors } from '../support';

beforeEach(function () {
    this.stage = serenity.callToStageFor(new Actors());
});
