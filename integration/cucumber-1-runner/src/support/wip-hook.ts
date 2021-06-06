export = function (): void {

    this.Before({ tags: ['@wip'] }, function () {
        return 'pending';
    });
};
