import { defineSupportCode } from 'cucumber';
import { Notifier } from './notifier';

defineSupportCode(({ registerListener }) => {

    registerListener(new Notifier() as any);
});
