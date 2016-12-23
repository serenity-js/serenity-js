'use strict';

const gulp      = require('gulp'),
    tslint      = require("gulp-tslint"),
    ts          = require('gulp-typescript'),
    merge       = require('merge2'),
    concat      = require('gulp-concat'),
    sourcemaps  = require('gulp-sourcemaps'),
    mocha       = require('gulp-mocha'),
    istanbul    = require('gulp-istanbul'),
    remap       = require('remap-istanbul/lib/gulpRemapIstanbul'),
    report      = require('gulp-istanbul-report'),
    runSequence = require('run-sequence'),
    path        = require('path'),
    project     = ts.createProject('tsconfig.json'),
    dirs        = require('./gulpfile.config');

gulp.task('lint', () =>
    gulp.src([ dirs.src, dirs.spec, dirs.behaviour.spec, '!**/*.d.ts' ])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
);

gulp.task('transpile', () => {
    let transpiled = gulp.src([ dirs.src, dirs.spec, dirs.behaviour.spec, dirs.typings ])
        .pipe(sourcemaps.init())
        .pipe(ts(project, { sortOutput: true }));

    return merge([
        transpiled.dts
            .pipe(gulp.dest(dirs.staging.traspiled.all)),
        transpiled.js
            .pipe(sourcemaps.write('.', { sourceRoot: '.', includeContent: false }))
            .pipe(gulp.dest(dirs.staging.traspiled.all))
    ]);
});

gulp.task('prepare-examples', () =>
    gulp.src(dirs.behaviour.examples).pipe(gulp.dest(dirs.staging.traspiled.all + '/behaviour'))
);

gulp.task('pre-test', [ 'transpile' ], () =>
    gulp.src(dirs.staging.traspiled.src)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
);

gulp.task('verify:cucumber', ['pre-test', 'prepare-examples'], () =>
    gulp.src(dirs.staging.traspiled.behaviour.cucumber)
        .pipe(mocha())
);

gulp.task('export', () =>
    gulp
        .src(dirs.staging.traspiled.export)
        .pipe(gulp.dest(dirs.export))
);

gulp.task('package', (done) => runSequence('lint', 'export'));
