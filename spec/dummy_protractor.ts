// so that `import { by } from 'protractor/globals'`
// can be used in the Interaction classes
// without having to use the protractor itself

global[ 'protractor' ] = {                    // tslint:disable-line:no-string-literal
    browser: null,
    $: null,
    $$: null,
    element: null,
    By: null,
    by: null,
    wrapDriver: null,
    ExpectedConditions: null,
};
