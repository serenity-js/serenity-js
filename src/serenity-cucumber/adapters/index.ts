import { scenarioLifeCycleNotifier } from './cucumber_serenity_notifier';
import { synchroniseCucumberWithWebdriverControlFlow } from './webdriver_synchroniser';

import * as webdriver from 'selenium-webdriver';

import { Hooks, StepDefinitions } from 'cucumber';

export function notifierFor(cucumber: Hooks) {
    cucumber.registerListener(scenarioLifeCycleNotifier());
}

export function webdriverSynchroniserFor(cucumber: StepDefinitions, controlFlow: webdriver.promise.ControlFlow) {
    synchroniseCucumberWithWebdriverControlFlow(cucumber, controlFlow);
}
