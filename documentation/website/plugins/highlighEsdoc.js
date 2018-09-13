'use strict';

const cheerio = require('cheerio');

module.exports = function highlightEsdoc(highlight, languages) {

    return function(files, ms, done) {

        setImmediate(done);

        Object.keys(files).filter(path => /\.html$/.test(path)).forEach(path => {
            const $ = cheerio.load(files[path].contents.toString('utf8'));

            $('pre code').each(function(i, node) {
                const el = $(this);

                const result = highlight.highlightAuto(el.text(), languages);

                el.html(result.value);
                el.addClass('hljs');
                el.addClass(result.language);
            });

            files[path].contents = Buffer.from($.html());
        });
    };
}