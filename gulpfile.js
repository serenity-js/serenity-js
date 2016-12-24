'use strict';

const gulp      = require('gulp'),
    tslint      = require("gulp-tslint"),
    ts          = require('gulp-typescript'),
    project     = ts.createProject('tsconfig.json'),
    dirs        = require('./gulpfile.config');

gulp.task('lint', () =>
    gulp.src([ dirs.src, dirs.spec, '!**/*.d.ts' ])
        .pipe(tslint({ formatter: "verbose" }))
        .pipe(tslint.report()));

gulp.task('transpile', [ 'lint' ], () =>
    gulp.src([ dirs.src ])
        .pipe(project())
        .pipe(gulp.dest(dirs.export)));

gulp.task('package', [ 'transpile' ]);
