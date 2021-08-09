'use strict';
const cheerio = require('cheerio');

module.exports = function highlightPrism(Prism) {

    // poor man's language detection, because Prism doesn't support it https://github.com/PrismJS/prism/issues/1313
    function looksLikeHtml(code) {
        const hasHtmlTags = /<[a-z/][\s\S]*>/i;
        const hasTypeScriptKeywords = /\b(import|actor|actorCalled)\b/;
        return hasHtmlTags.test(code) && ! hasTypeScriptKeywords.test(code);
    }

    return function(files, ms, done) {

        Object.keys(files).filter(path => /\.html$/.test(path)).forEach(path => {

            const $ = cheerio.load(files[path].contents.toString('utf8'));

            $('pre code').each(function(i, node) {
                const codeNode = $(this);
                const preNode  = codeNode.parent();

                const code = codeNode.text();

                const codeNodeClasses = codeNode.attr('class')
                    ? codeNode.attr('class').replace(/\s+/, ' ').split(' ')
                    : [];
                const desiredLanguageClass = codeNodeClasses.filter(cssClass => cssClass.startsWith('lang')).map(languageClass => languageClass.split('-')[1])[0];

                const language = Prism.languages[desiredLanguageClass]
                    ? desiredLanguageClass
                    : looksLikeHtml(code)
                        ? 'markup'
                        : 'typescript';

                const result = Prism.highlight(code, Prism.languages[language])

                codeNode.html(result);
                preNode.class = '';
                preNode.addClass(`language-${ language }`);
            });

            files[path].contents = Buffer.from($.html());
        });

        return done();
    };
}
