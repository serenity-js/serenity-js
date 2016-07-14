import { scenarioLifeCycleNotifier } from './serenity_notifier';
import { synchroniseCucumberWithWebdriverControlFlow } from './webdriver_synchroniser';

import { Hooks, StepDefinitions } from 'cucumber';
import ControlFlow = protractor.promise.ControlFlow;

export function notifierFor(cucumber: Hooks) {
    cucumber.registerListener(scenarioLifeCycleNotifier());
}

export function webdriverSynchroniserFor(cucumber: StepDefinitions, controlFlow: ControlFlow) {
    synchroniseCucumberWithWebdriverControlFlow(cucumber, controlFlow);
}
