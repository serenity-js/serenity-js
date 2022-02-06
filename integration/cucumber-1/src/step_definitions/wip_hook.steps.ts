// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export = function () {

    this.Before({ tags: ['@wip'] }, function () {
        return 'pending';
    });
};
