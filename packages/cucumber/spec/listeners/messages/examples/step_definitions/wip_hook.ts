/* eslint-disable unicorn/filename-case */
import { Before } from '@cucumber/cucumber';

Before({ tags: '@wip' }, function () {
    return 'pending' as any;
});
