// based on https://github.com/aymericbeaumet/metalsmith-clean-css
const async = require('async');
const CleanCSS = require('clean-css');
const minimatch = require('minimatch');

module.exports = (options = {}) => {
    const {
        cleanCSS: cleanCSSParameters = {},
        files: pattern = '**/*.css',
        sourceMap = false,
        sourceMapInlineSources = false
    } = options;

    return (files, metalsmith, done) => {
        // Instantiate the clean-css engine (with potential source maps support)
        const cleanCSS = new CleanCSS({
            ...cleanCSSParameters,
            ...(sourceMap ?
                {
                    sourceMap,
                    sourceMapInlineSources,
                    rebaseTo: cleanCSSParameters.rebaseTo || metalsmith._directory
                } :
                {})
        });

        // Loop over all the files metalsmith knows of
        async.each(
            Object.entries(files),
            ([filepath, file], callback) => {
                const sourceMapFilepath = `${filepath}.map`;
                const sourceMapFile = files[sourceMapFilepath] || {contents: ''};
                // Check whether the current file is concerned by the minification
                if (!minimatch(filepath, pattern)) {
                    return callback();
                }

                // Minify the file
                cleanCSS.minify(
                    {
                        [filepath]: {
                            styles: file.contents.toString(),
                            sourceMap:
                                file.sourceMap ||
                                sourceMapFile.contents.toString() ||
                                undefined
                        }
                    },
                    (error, output) => {
                        if (output.errors.length > 0 || error !== null) {
                            return callback(output.errors.length > 0 ? output.errors : error);
                        }

                        // Update the file contents with its minified version
                        file.contents = Buffer.from(output.styles);
                        // Deal with the source map
                        if (sourceMap && output.sourceMap) {
                            // Expose the source map (so that it could be used by another plugin)
                            const sourceMap = Buffer.from(JSON.stringify(output.sourceMap));
                            file.sourceMap = sourceMap;
                            sourceMapFile.contents = sourceMap;
                            // Expose the source map as a .map file if asked not to inline it
                            if (!sourceMapInlineSources) {
                                files[sourceMapFilepath] = sourceMapFile;
                            }
                        }

                        return callback();
                    }
                );
            },
            done
        );
    };
};
