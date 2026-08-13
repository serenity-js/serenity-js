# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.45.3](https://github.com/serenity-js/serenity-js/compare/v3.45.2...v3.45.3) (2026-08-13)

**Note:** Version bump only for package @serenity-js/html-reporter





## [3.45.2](https://github.com/serenity-js/serenity-js/compare/v3.45.1...v3.45.2) (2026-08-13)

### Bug Fixes

* **deps:** update html reporter dependencies ([ea78f53](https://github.com/serenity-js/serenity-js/commit/ea78f537b3db8892df2b7c3b9c0d239c7d79d729))
* **html-reporter:** aligned node engine requirement with other Serenity/JS packages ([59a5c9b](https://github.com/serenity-js/serenity-js/commit/59a5c9b45205bd4d9a8e2668db24e6ba0249ec5c))


## [3.45.1](https://github.com/serenity-js/serenity-js/compare/v3.45.0...v3.45.1) (2026-08-13)

**Note:** Version bump only for package @serenity-js/html-reporter





# [3.45.0](https://github.com/serenity-js/serenity-js/compare/v3.44.3...v3.45.0) (2026-08-13)

### Bug Fixes

* **html-reporter:** add .js extensions to all module imports ([480de95](https://github.com/serenity-js/serenity-js/commit/480de9542ac714954748b477325ccc8b16300e31))
* **html-reporter:** add .js extensions to ALL module imports in app/ ([d13abac](https://github.com/serenity-js/serenity-js/commit/d13abac5c016ef5c37f620c52fdd65e6e727bd76))
* **html-reporter:** aggregate parallel worker files by moduleId ([19e60c5](https://github.com/serenity-js/serenity-js/commit/19e60c551bc5f6c8492c2c1ab5e59eaf2493d091))
* **html-reporter:** avoid stack overflow when serialising outcomes with circular error references ([f15405d](https://github.com/serenity-js/serenity-js/commit/f15405da8d688f941281b5df58bffcd85b824d8f))
* **html-reporter:** capabilities back/forward navigation, natural sort, merged specs section ([fddbec4](https://github.com/serenity-js/serenity-js/commit/fddbec440792ce138bf49d984e7eac8971f8b431))
* **html-reporter:** correct history dots lookup for scenarios without line numbers ([7098cdd](https://github.com/serenity-js/serenity-js/commit/7098cddcc6da2aa3a1f28b3803985c0458f4ad38))
* **html-reporter:** exclude module-filtering tests from main suite ([07853bd](https://github.com/serenity-js/serenity-js/commit/07853bd4bd85673eb114da2578231483f775184c))
* **html-reporter:** exclude stale pre-merged db.json when fresh module-level files exist ([d0192c5](https://github.com/serenity-js/serenity-js/commit/d0192c504a2c50cee5eadf94f244598caf6f5b8c)), closes [gh-pages](https://github.com/serenity-js/serenity-js/issues/pages)
* **html-reporter:** fix iOS Safari scroll issue with run details panel ([acc6c7c](https://github.com/serenity-js/serenity-js/commit/acc6c7c58c05dd41adf843f16e1e651a4469cd31))
* **html-reporter:** fix mobile trend chart detail panel table scroll and z-index ([b86caf4](https://github.com/serenity-js/serenity-js/commit/b86caf475435e2795353ecc3de6e183aa78517c5))
* **html-reporter:** handle WebdriverIO parallel worker db.json race condition ([bcd39f3](https://github.com/serenity-js/serenity-js/commit/bcd39f35199de6c9f93fc648b263a6f7c734e328))
* **html-reporter:** improve mobile scroll behaviour for run details panel ([a35c40c](https://github.com/serenity-js/serenity-js/commit/a35c40c8d2e6b1d0e11e30818376616110f18dc1))
* **html-reporter:** include module tag in scene identity to prevent cross-module merging ([7954f9b](https://github.com/serenity-js/serenity-js/commit/7954f9b1c2616881c9111c3d12a733dbae687cda))
* **html-reporter:** make TimelineView route prop optional ([fdf39b2](https://github.com/serenity-js/serenity-js/commit/fdf39b2f720af806b776e82316d89f13cfb14bab))
* **html-reporter:** navigate to timeline view from Slowest Tests card ([acb82f3](https://github.com/serenity-js/serenity-js/commit/acb82f3a78cca9bd48a1f42ba710bb299383271b))
* **html-reporter:** preserve multi-module metadata from historical run-level db.json ([14752ff](https://github.com/serenity-js/serenity-js/commit/14752ffb215c3b6bd613c3af6a7b768034ae4bf6)), closes [gh-pages](https://github.com/serenity-js/serenity-js/issues/pages)
* **html-reporter:** prevent duration stats from being clipped in run details panel ([2ba7614](https://github.com/serenity-js/serenity-js/commit/2ba7614bcdf3639e121231759ee218ecdee26644))
* **html-reporter:** prevent iOS Safari Liquid Glass from clipping fixed content ([6239f64](https://github.com/serenity-js/serenity-js/commit/6239f6437bff29040a6240e6addbaac82db8bf9f))
* **html-reporter:** resolve accessibility, navigation, and data resilience issues ([778e6dd](https://github.com/serenity-js/serenity-js/commit/778e6dd2dd8813f488b14aab96fac05bde7ff78b))
* **html-reporter:** resolve all tsconfig.spec.json type errors ([85ebd76](https://github.com/serenity-js/serenity-js/commit/85ebd76f10d76378616708fe3cabb35d94673e7e))
* **html-reporter:** restore accidentally deleted migration guide ([aca8362](https://github.com/serenity-js/serenity-js/commit/aca8362482f4a92567ac8c882f120cd381ae43d7))
* **html-reporter:** shrink trend detail panel to content on single-module projects ([519cf75](https://github.com/serenity-js/serenity-js/commit/519cf75adbe738d3f801f7087b196c870f868e45))
* **html-reporter:** sort modules in natural order in trend detail panel ([18073b5](https://github.com/serenity-js/serenity-js/commit/18073b568e8c7548c44c29094691b7a29f2a7cc2))
* **html-reporter:** strip leading '--' from argv for pnpm script compatibility ([e2c44c3](https://github.com/serenity-js/serenity-js/commit/e2c44c3f89038623db70cff467925e92772ba728))
* **html-reporter:** unify scenario identity across buildHistory and dashboard dedup filter ([9a6d3d8](https://github.com/serenity-js/serenity-js/commit/9a6d3d80c1a5ac8e6b04ad791f42841f891e7b64))
* **html-reporter:** use explicit package version in CLI and assert against it in tests ([a9678aa](https://github.com/serenity-js/serenity-js/commit/a9678aa24a1a379062769dd16adbc47fcde2d1da))
* **html-reporter:** use Optional interface instead of misnamed isVisible methods ([4c21d41](https://github.com/serenity-js/serenity-js/commit/4c21d41366d6ccf687874a37a9efd4c975515f43))
* **html-reporter:** use sceneIdentity in identifyUnstableTests to prevent history merging ([a0540c8](https://github.com/serenity-js/serenity-js/commit/a0540c83ec1fc7d8bb2ac74cdc6e732d9f06e37b))
* **html-reporter:** use spaced separators in collapsed capability tree labels ([c571388](https://github.com/serenity-js/serenity-js/commit/c571388d5787a103e414e7c6758e3ee19c620228))
* **html-reporter:** wait for component render before returning interaction object ([4921ecf](https://github.com/serenity-js/serenity-js/commit/4921ecf2cc484091e2b9a2f4b501be743b2a67a4))

### Features

* **html-reporter:** add mobile-optimised bottom sheet controls for search, filter, and sort ([d7cbc00](https://github.com/serenity-js/serenity-js/commit/d7cbc00736928408973ef2c410c6f56634167117))
* **html-reporter:** add module tagging and interactive navigation ([25bcf34](https://github.com/serenity-js/serenity-js/commit/25bcf3440a701c21d8ea081116870944f228b56d))
* **html-reporter:** add per-module outcomes to summary.json and fix duplicate module IDs ([6377c38](https://github.com/serenity-js/serenity-js/commit/6377c38a057f12279a1ddd77a8d41042d56d68b9))
* **html-reporter:** bind serve command to 0.0.0.0 and show network URL ([dc65add](https://github.com/serenity-js/serenity-js/commit/dc65add65610085da20e938a8ce5519ab228c6e8))
* **html-reporter:** detect and surface incomplete CI runs ([49ed9c8](https://github.com/serenity-js/serenity-js/commit/49ed9c830c383b2a23a75c8306b1efae814d033d))
* **html-reporter:** display project name and package manager in System Context view ([7b530b1](https://github.com/serenity-js/serenity-js/commit/7b530b14ab9e1c394f792f2bbf90231676e1c99b))
* **html-reporter:** enhance summary.json for AI agent consumption ([341a36a](https://github.com/serenity-js/serenity-js/commit/341a36a0d79fc29141f5a447a07c71b7b411c8a4))
* **html-reporter:** hide KPI cards and capabilities tree behind bottom sheets on mobile ([ab35b40](https://github.com/serenity-js/serenity-js/commit/ab35b40731ecd286692b2dd8386b24b845587d76))
* **html-reporter:** implement @serenity-js/html-reporter package ([2174a15](https://github.com/serenity-js/serenity-js/commit/2174a150b1ae0673f376e2895b0667a5ad21a50b))
* **html-reporter:** improve trend details panel usability ([db2ffe4](https://github.com/serenity-js/serenity-js/commit/db2ffe4bc03f1f543787d184a73fd29018322a30))
* **html-reporter:** show Duration metric in single-module trend detail panel ([049eb7f](https://github.com/serenity-js/serenity-js/commit/049eb7f8c8f5515e540dd246299caf473dcf6d02))
* **html-reporter:** show total duration in trend chart detail footer ([11526ba](https://github.com/serenity-js/serenity-js/commit/11526bad147c28a35dbae47b52e5e056f2694203))
* **html-reporter:** support array filters in link() and migrate remaining inline URLs ([ec5b15a](https://github.com/serenity-js/serenity-js/commit/ec5b15a266fa66d95bf98830e83d774595051ef6))

### Performance Improvements

* **html-reporter:** enable parallel test workers (73s → 17s) ([ee6875a](https://github.com/serenity-js/serenity-js/commit/ee6875a9961c103f6b79a9a12ce735d74fcc3fa4))
