const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'source/'
        }
    });
}

function cleanBuild() {
    return del('build')
}

function images() {
    return src('source/img/**/*')
        .pipe(imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: true },
                        { cleanupIDs: false }
                    ]
                })
            ]
        ))
        .pipe(dest('build/img'))
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'source/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('source/js'))
        .pipe(browserSync.stream())
}


function styles() {
    // return src('source/scss/style.scss')
    return src('source/css/style.css')
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('source/css'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
        'source/css/style.min.css',
        'source/fonts/**/*',
        'source/js/main.min.js',
        'source/*.html'
    ], { base: 'source' })
        .pipe(dest('build'))
}


function watching() {
    watch(['source/scss/**/*.scss'], styles);
    watch(['source/css/**/*.css'], styles);
    watch(['source/js/**/*.js', '!source/js/main.min.js'], scripts);
    watch(['source/*.html']).on('change', browserSync.reload)
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanBuild = cleanBuild;

exports.build = series(cleanBuild, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);
