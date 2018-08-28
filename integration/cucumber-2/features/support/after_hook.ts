import { defineSupportCode } from 'cucumber';

defineSupportCode(({ After }) => {

    After(function() {
        // no-op
    });
});
