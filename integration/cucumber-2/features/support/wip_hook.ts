import { defineSupportCode } from 'cucumber';

defineSupportCode(({ Before }) => {

    Before({ tags: '@wip' }, function() {
        return 'pending';
    });
});
