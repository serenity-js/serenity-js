'use strict';

const gulp      = require('gulp'),
    clean       = require('gulp-clean'),
    tslint      = require("gulp-tslint"),
    ts          = require('gulp-typescript'),
    merge       = require('merge2'),
    concat      = require('gulp-concat'),
    sourcemaps  = require('gulp-sourcemaps'),
    mocha       = require('gulp-mocha'),
    istanbul    = require('gulp-istanbul'),
    remap       = require('remap-istanbul/lib/gulpRemapIstanbul'),
    runSequence = require('run-sequence'),
    project     = ts.createProject('tsconfig.json'),
    dirs        = require('./gulpfile.config');


gulp.task('clean', () => gulp.src([dirs.staging.all, dirs.export], { read: false }).pipe(clean()));

gulp.task("lint", () =>
    gulp.src([ dirs.src, dirs.spec, '!**/*.d.ts' ])
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
);

gulp.task('transpile', () => {
    let transpiled = gulp.src([ dirs.src, dirs.spec, dirs.typings ])
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

gulp.task('pre-test', ['transpile'], () =>
    gulp.src(dirs.staging.traspiled.src)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
);

gulp.task('test', ['pre-test'], () => {
    let remapToTypescript = () => gulp
        .src(dirs.staging.reports.coverage + '/coverage-final.json')
        .pipe(remap({
            basePath: '.',
            useAbsolutePaths: true,
            reports: {
                'json':         dirs.staging.reports.coverage + '/coverage-typescript.json',
                'html':         dirs.staging.reports.coverage + 'html',
                'text-summary': null,
                'lcovonly':     dirs.staging.reports.coverage + '/lcov.info',
                'cobertura':    dirs.staging.reports.coverage + '/cobertura.xml'
            }
        }));

    return gulp.src(dirs.staging.traspiled.spec)
        .pipe(mocha())
        .pipe(istanbul.writeReports({
            dir: dirs.staging.reports.coverage,
            reporters: [ 'json' ],
        }))
        // .pipe(istanbul.enforceThresholds({ thresholds: { global: 70 } }))
        .on('end', remapToTypescript);
});

gulp.task('package', [ 'lint', 'test' ], () => {
    return gulp
        .src(dirs.staging.traspiled.export)
        .pipe(gulp.dest(dirs.export));
});

gulp.task('prepublish', (done) => runSequence('clean', 'package'));

gulp.task('default', [ 'prepublish' ], () => {});