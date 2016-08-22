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
    report      = require('gulp-istanbul-report'),
    runSequence = require('run-sequence'),
    path        = require('path'),
    project     = ts.createProject('tsconfig.json'),
    dirs        = require('./gulpfile.config');


gulp.task('clean', () => gulp.src([dirs.staging.all, dirs.export], { read: false }).pipe(clean()));

gulp.task("lint", () =>
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

gulp.task('test', ['pre-test'], () =>
    gulp.src(dirs.staging.traspiled.spec)
        .pipe(mocha())
        .pipe(istanbul.writeReports({
            dir: dirs.staging.reports.coverage.spec,
            reporters: ['json'],
        }))
        // .pipe(istanbul.enforceThresholds({ thresholds: { global: 70 } }))
);

gulp.task('verify', ['pre-test', 'prepare-examples'], () =>
    gulp.src(dirs.staging.traspiled.behaviour)
        .pipe(mocha())
);

gulp.task('aggregate', () => {
    function remapCoverageToTypescript(dir) {
        return gulp
            .src(path.join(dir, 'coverage-final.json'))
            .pipe(remap({
                basePath: '.',
                useAbsolutePaths: true,
                reports: { 'json': path.join(dir, 'coverage-final-remaped.json') }
            }))
    }

    return merge([
        remapCoverageToTypescript(dirs.staging.reports.coverage.spec),
        remapCoverageToTypescript(dirs.staging.reports.coverage.behaviour)
    ]).pipe(report({
        dir: dirs.staging.reports.coverage.all,
        reporters: [
            'text-summary',
            {name: 'html', dir: dirs.staging.reports.coverage.all + 'html'},
            {name: 'lcovonly', file: 'lcov.info'},
            {name: 'json'}
        ]
    }));
});

gulp.task('export', () =>
    gulp
        .src(dirs.staging.traspiled.export)
        .pipe(gulp.dest(dirs.export))
);

gulp.task('package', (done) => runSequence('clean', 'lint', 'test', 'verify', 'aggregate', 'export'));

gulp.task('default', [ 'package' ], () => {});