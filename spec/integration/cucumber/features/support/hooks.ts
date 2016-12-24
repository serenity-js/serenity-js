import { scenarioLifeCycleNotifier } from '../../../../../src/serenity-cucumber/cucumber_serenity_notifier';

export = function () {

    this.registerListener(scenarioLifeCycleNotifier());
};
