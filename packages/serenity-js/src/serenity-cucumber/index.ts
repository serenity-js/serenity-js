import { protractor } from 'protractor';

import { scenarioLifeCycleNotifier } from './cucumber_serenity_notifier';
import { synchronise } from './webdriver_synchroniser';

export = function() {

    this.registerListener(scenarioLifeCycleNotifier());

    synchronise(this, protractor.browser.driver.controlFlow());
};
