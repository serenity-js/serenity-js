(function(win) {

    const searchIndex = [];
    Object.defineProperty(win, 'esdocSearchIndex', {
        enumerable: true,
        configurable: false,
        set(moduleSearchndex) {
            searchIndex.push.apply(searchIndex, moduleSearchndex);
        },
        get() {
            return searchIndex;
        }
    });
})(window);
