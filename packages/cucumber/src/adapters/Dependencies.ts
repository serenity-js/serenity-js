import { FeatureFileLoader } from '../gherkin';
import { Notifier } from '../notifier';

export interface Dependencies {
    notifier: Notifier;
    loader: FeatureFileLoader;
    cucumber: any;
}
