'use strict';
const cheerio = require('cheerio');

module.exports = function highlightEsdoc(highlight, languages) {

    return function(files, ms, done) {

        Object.keys(files).filter(path => /\.html$/.test(path)).forEach(path => {
            const matches = path.match(/.*\/.*\.([a-z]+)~?.*?\.html$/);
            const originalExtension = matches && matches[1];

            const $ = cheerio.load(files[path].contents.toString('utf8'));

            $('pre code').each(function(i, node) {
                const el = $(this);

                const result = highlight.highlightAuto(
                    el.text(),
                    originalExtension ? [originalExtension] : languages,
                );

                // if (! result.language) {
                //     return done(new Error(`Could not detect the language of the following code sample: ${result.value}`));
                // }

                el.html(result.value);
                el.addClass('hljs');
                el.addClass(result.language || 'plaintext');
            });

            files[path].contents = Buffer.from($.html());
        });

        return done();
    };
}
