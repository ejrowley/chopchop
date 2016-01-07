// =============================================
// Project Settings
// edit these variables to suit your project
// =============================================

var project = {
    name: 'chopchop',
    source: './src',
    dist: './build',
    scss: 'scss',
    css: 'css',
    js: 'js',
    images: 'img',
    fonts: 'fonts',
    vendor: 'vendor',
    bower: './build/bower_components',
};

// =============================================
// Options
// edit these variables to suit your project
// =============================================

var option = {
    autoprefixer: ['last 2 versions'],
    imageOptimisation: {
        optimizationLevel: 3,   // PNG (Between 0 - 7)
        progressive: true,      // JPG
        interlaced: true        // GIF
    }
};

// =============================================
// Dependencies
// =============================================

var gulp = require('gulp'),
    plugin = {
        util:               require('gulp-util'),
        browserSync:        require('browser-sync'),
        bower:              require('gulp-bower'),
        del:                require('del'),
        runSequence:        require('run-sequence'),
        imageMin:           require('gulp-imagemin'),
        sass:               require('gulp-sass'),
        autoPrefixer:       require('gulp-autoprefixer'),
        clipEmptyFiles:     require('gulp-clip-empty-files'),
        combineMq:          require('gulp-combine-mq'),
        jsHint:             require('gulp-jshint'),
        cssNano:            require('gulp-cssnano'),
        uglify:             require('gulp-uglify'),
        changed:            require('gulp-changed'),
        sourcemaps:         require('gulp-sourcemaps')
    };

// =============================================
// Enviroment Variables
// =============================================

var dev = plugin.util.env.dev,
    production = plugin.util.env.production;

// =============================================
// Paths
// =============================================

var scss = {
        source: project.source + '/' + project.scss + '/**/*.scss',
        build: project.dist + '/' + project.css
    },
    js = {
        source: [
            project.source + '/' + project.js + '/**/*.js',
            '!' + project.source + '/' + project.js + '/**/_*.js',
        ],
        build: project.dist + '/' + project.js
    },
    img = {
        source: project.source + '/' + project.images + '/**/*.*',
        build: project.dist + '/' + project.images
    },
    fonts = {
        source: project.source + '/' + project.fonts + '/**/*.*',
        build: project.dist + '/' + project.fonts
    },
    vendor = {
        source: project.source + '/' + project.vendor + '/**/*.*',
        build: project.dist + '/' + project.vendor
    },
    bower = './' + project.bower;

// =============================================
// BROWSER SYNC `gulp browser-sync`
// injects css changes and auto reloads on js changes
// ** gets developer name from enviroment name
// =============================================

gulp.task('browser-sync', function() {
    if(dev) {
        plugin.browserSync({
	    proxy: 'http://' + project.name + '.' + plugin.util.env.name + '.dyn.iweb.co.uk/'
        });
    }
});

// =============================================
// BOWER `gulp bower`
// installs dependencies from the bower.json file
// =============================================

gulp.task('bower', function() {
    return plugin.bower()
        .pipe(gulp.dest(bower));
});

// =============================================
// FONTS `gulp fonts`
// moves fonts to build directory
// =============================================

gulp.task('fonts', function() {
    return gulp.src(fonts.source)
        .pipe(plugin.changed(fonts.build))
        .pipe(gulp.dest(fonts.build));
});

// =============================================
// VENDOR `gulp vendor`
// moves vendor to build directory
// =============================================

gulp.task('vendor', function() {
    return gulp.src(vendor.source)
        .pipe(plugin.changed(vendor.build))
        .pipe(gulp.dest(vendor.build));
});

// =============================================
// IMG `gulp img`
// minifys images
// =============================================

gulp.task('img', function() {
    return gulp.src(img.source)
        .pipe(plugin.changed(img.build))
        .pipe(plugin.util.env.production ? plugin.imageMin(option.imageOptimisation) : plugin.util.noop())
        .pipe(gulp.dest(img.build));
});

// =============================================
// JS `gulp js`
// compiles js, Jshint, Minify if `--production`
// =============================================

gulp.task('js', function() {
    return gulp.src(js.source)
        .pipe(plugin.jsHint())
        .pipe(plugin.jsHint.reporter('default'))
        .pipe(plugin.util.env.production ? plugin.uglify() : plugin.util.noop())
        .pipe(gulp.dest(js.build))
        .pipe(plugin.util.env.dev ? plugin.browserSync.reload({stream: true}) : plugin.util.noop());
});

// =============================================
// CSS `gulp css`
// compiles scss to css, autoprefixer, combines media queries and minifies if `--production`
// =============================================

gulp.task('css', function() {
    return gulp.src(scss.source)
        .pipe(plugin.clipEmptyFiles())
        .pipe(plugin.util.env.dev ? plugin.sourcemaps.init() : plugin.util.noop())
        .pipe(plugin.sass.sync().on('error', plugin.sass.logError))
        .pipe(plugin.autoPrefixer(option.autoprefixer))
        .pipe(plugin.util.env.dev ? plugin.sourcemaps.write() : plugin.util.noop())
        .pipe(plugin.util.env.production ? plugin.combineMq() : plugin.util.noop())
        .pipe(plugin.util.env.production ? plugin.cssNano() : plugin.util.noop())
        .pipe(gulp.dest(scss.build))
        .pipe(plugin.util.env.dev ? plugin.browserSync.reload({stream: true}) : plugin.util.noop());
});

// =============================================
// Clean `gulp clean
// destroys the build directory
// =============================================

gulp.task('clean', function(cb) {
    return plugin.del([project.dist], cb);
});

// =============================================
// Watch 'gulp watch'
// watches for changes and runs the associated task on change
// =============================================

gulp.task('watch', ['browser-sync'], function(cb) {
    gulp.watch(scss.source, ['css']);
    gulp.watch(js.source, ['js']);
    gulp.watch(img.source, ['img']);
    gulp.watch(fonts.source, ['fonts']);
    gulp.watch(vendor.source, ['vendor']);
});

// =============================================
// Build 'gulp build'
// builds all assets, also has `--production` option to build production ready assets
// =============================================

gulp.task('build', function(cb) {
    plugin.runSequence('clean', ['bower', 'css', 'js', 'img', 'fonts', 'vendor'], cb);
});

// =============================================
// Default 'gulp'
// runs build task, then runs watche task
// =============================================

gulp.task('default', function(cb) {
    plugin.runSequence('build', 'watch', cb);
});
