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
    project     = ts.createProject('tsconfig.json'),
    dir         = require('./gulpfile.config');


gulp.task('clean', () => gulp.src(dir.target.all, { read: false }).pipe(clean()));

gulp.task("lint", () =>
    gulp.src([ dir.src, dir.spec, '!**/*.d.ts' ])
        .pipe(tslint())
        .pipe(tslint.report("prose"))
);

gulp.task('transpile', () => {
    let transpiled = gulp.src([ dir.src, dir.spec, dir.typings ])
        .pipe(sourcemaps.init())
        .pipe(ts(project, { sortOutput: true }));

    return merge([
        transpiled.dts
            .pipe(gulp.dest(dir.target.traspiled.all)),
        transpiled.js
            .pipe(sourcemaps.write('.', { sourceRoot: '.', includeContent: false }))
            .pipe(gulp.dest(dir.target.traspiled.all))
    ]);
});

gulp.task('pre-test', ['transpile'], () =>
    gulp.src(dir.target.traspiled.src)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
);

gulp.task('test', ['pre-test'], () => {
    let remapToTypescript = () => gulp
        .src(dir.target.reports.coverage + '/coverage-final.json')
        .pipe(remap({
            basePath: '.',
            useAbsolutePaths: true,
            reports: {
                'json':         dir.target.reports.coverage + '/coverage-typescript.json',
                'html':         dir.target.reports.coverage + 'html',
                'text-summary': null,
                'lcovonly':     dir.target.reports.coverage + '/lcov.info',
                'cobertura':    dir.target.reports.coverage + '/cobertura.xml'
            }
        }));

    return gulp.src(dir.target.traspiled.spec)
        .pipe(mocha())
        .pipe(istanbul.writeReports({
            dir: dir.target.reports.coverage,
            reporters: [ 'json' ],
        }))
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 70 } }))
        .on('end', remapToTypescript);
});

gulp.task('default', ['clean', 'lint', 'test'], () => {});