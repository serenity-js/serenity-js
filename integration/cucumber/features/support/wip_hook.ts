module.exports = function() {

    this.Before({ tags: ['@wip'] }, function() {
        return 'pending';
    });
};
