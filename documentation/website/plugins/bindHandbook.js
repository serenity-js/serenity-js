const
    fs = require('fs'),
    path = require('path'),
    yaml = require('yaml');

module.exports = function bindHandbook(pathToTableOfContents) {

    const pathToHandbook = path.dirname(pathToTableOfContents);

    return function(files, metalsmith, done) {
        setImmediate(done);

        const toc = yaml.parse(fs.readFileSync(pathToTableOfContents).toString());

        // const articles = [];

        const articles = Object.keys(toc)
            .map(header => [
                {
                    type: 'header',
                    path:  header,
                },
                ...toc[header].map(chapter => ({
                    type: 'chapter',
                    path: chapter,
                }))])
            .reduce((acc, current) => acc.concat(current), [])
            .map(article => ({
                ...article,
                title:  files[article.path].title,
                href:   `/${ article.path.replace('.md', '.html') }`,
            }));

        articles.forEach((article, i) => {
            if (i > 0) {
                files[article.path].previous = articles[i - 1];
            }

            if (i < articles.length - 1) {
                files[article.path].next = articles[i + 1];
            }

            files[article.path].articles = articles;
        });
    };
};
