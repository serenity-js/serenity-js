export = function () {

    this.Given(/^a step that passes$/, () => {
        // pass
    });

    this.Given(/^a step that fails$/, () => {
        throw new Error('Assertion failed');
    });
};
