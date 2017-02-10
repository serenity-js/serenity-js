import { serenity } from 'serenity-js';

import { Actors } from 'todomvc-model';

export = function() {

    this.setDefaultTimeout(60 * 1000);

    this.World = function() {
        this.stage = serenity.callToStageFor(new Actors());
    };
};
