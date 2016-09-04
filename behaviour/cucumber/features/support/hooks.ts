import { scenarioLifeCycleNotifier } from '../../../../src/serenity-cucumber';

export = function () {

    this.registerListener(scenarioLifeCycleNotifier());
};
