/* eslint-disable unicorn/filename-case */
import { Before } from '@cucumber/cucumber';

Before({ tags: '@skip' }, function () {
    return 'skipped' as any;
});
